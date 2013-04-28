function Mesh(geometry, material){
  Object3D.call(this);

  this.normalMatrix = mat3.create();
  this.modelViewMatrix = mat4.create();

  this.geometry = geometry;
  this.material = material;

  this.useColor = false;

  this.createBuffer();
}
var p = Mesh.prototype = Object.create(Object3D.prototype);

p.createBuffer = function(){
  // vertices information
  var data = [];
  for(var i=0; i<this.geometry.numVertices; ++i){
    // vertex
    data.push(this.geometry.vertices[i*3]);
    data.push(this.geometry.vertices[i*3+1]);
    data.push(this.geometry.vertices[i*3+2]);

    // normal
    data.push(this.geometry.normals[i*3]);
    data.push(this.geometry.normals[i*3+1]);
    data.push(this.geometry.normals[i*3+2]);

    // uv
    data.push(this.geometry.texCoords[i*2]);
    data.push(this.geometry.texCoords[i*2+1]);

    // color
    data.push(this.material.color[0])
    data.push(this.material.color[1])
    data.push(this.material.color[2])
    data.push(this.material.color[3])
  }



  // destroy original buffers
  if(this.vb)
    gl.deleteBuffer(this.vb);
  if(this.ib)
    gl.deleteBuffer(this.ib);

  // vertex buffer
  this.vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // index information
  this.ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indices), gl.STATIC_DRAW);
}

p.setAttribute = function(attribute){
  // vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.vertexAttribPointer(attribute['a_Vertex'], 3, gl.FLOAT, false, 48, 0);
  gl.vertexAttribPointer(attribute['a_Normal'], 3, gl.FLOAT, false, 48, 12);
  gl.vertexAttribPointer(attribute['a_TexCoord'], 2, gl.FLOAT, false, 48, 24);
  gl.vertexAttribPointer(attribute['a_Color'], 4, gl.FLOAT, false, 48, 32);
  gl.enableVertexAttribArray(attribute['a_Vertex']);
  gl.enableVertexAttribArray(attribute['a_TexCoord']);
  gl.enableVertexAttribArray(attribute['a_Normal']);
  gl.enableVertexAttribArray(attribute['a_Color']);
}

p.setUniform = function(uniform){
  gl.uniform1i(uniform['u_UseColor'], this.useColor);
}

p.render = function(shader, camera){
  this.updateMatrix();

  var concatMatrix = this.concatMatrix;

  // set model matrix, for shadow mapping use
  gl.uniformMatrix4fv(shader.uniform['u_ModelMatrix'], false, concatMatrix);

  // set model view matrix
  mat4.mul(this.modelViewMatrix, camera.matrix, concatMatrix);
  gl.uniformMatrix4fv(shader.uniform['u_ModelViewMatrix'], false, this.modelViewMatrix);

  // transform model normal
  // ********
  // notice that the normal matrix is inverse transpose of the ** model view ** matrix
  // ********
  mat3.normalFromMat4(this.normalMatrix, this.modelViewMatrix);
  gl.uniformMatrix3fv(shader.uniform['u_NormalMatrix'], false, this.normalMatrix);

  this.material.setUniform(shader.uniform);

  this.setAttribute(shader.attribute);
  this.setUniform(shader.uniform);

  if(this.material.texture)
    Texture.bind(this.material.texture.textureID);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}