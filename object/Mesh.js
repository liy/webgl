function Mesh(geometry, material){
  Object3D.call(this);

  this.normalMatrix = mat3.create();
  this.modelViewMatrix = mat4.create();

  this.geometry = geometry;
  this.material = material;

  this.createBuffer();
}
var p = Mesh.prototype = Object.create(Object3D.prototype);

p.createBuffer = function(){
  // vertices information
  var data = [];
  for(var i=0; i<24; ++i){
    // vertex
    data.push(this.geometry.vertices[i*3]);
    data.push(this.geometry.vertices[i*3+1]);
    data.push(this.geometry.vertices[i*3+2]);

    // normal
    data.push(this.geometry.normals[i*3]);
    data.push(this.geometry.normals[i*3+1]);
    data.push(this.geometry.normals[i*3+2]);
    // uv
    data.push(this.material.texture.texCoords[i*2]);
    data.push(this.material.texture.texCoords[i*2+1]);

    // color
    data.push(this.material.color[0])
    data.push(this.material.color[1])
    data.push(this.material.color[2])
    data.push(this.material.color[3])
  }

  // index information
  this.indices = [
    0,  1,  2,   0,  2,  3,  // front
    4,  5,  6,   4,  6,  7,  // back
    8,  9,  10,  8,  10, 11, // top
    12, 13, 14,  12, 14, 15, // bottom
    16, 17, 18,  16, 18, 19, // left
    20, 21, 22,  20, 22, 23  // right
  ];

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
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
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

p.render = function(shader, camera){
  this.updateMatrix();

  var concatMatrix = this.concatMatrix;

  // set model view matrix
  mat4.mul(this.modelViewMatrix, camera.matrix, concatMatrix);
  gl.uniformMatrix4fv(shader.uniform['u_ModelViewMatrix'], false, this.modelViewMatrix);

  // transform model normal
  mat3.normalFromMat4(this.normalMatrix, concatMatrix);
  gl.uniformMatrix3fv(shader.uniform['u_NormalMatrix'], false, this.normalMatrix);

  this.material.setUniform(shader.uniform);

  this.setAttribute(shader.attribute);

  Texture.bind(this.material.texture.textureID);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
}