function Mesh(geometry, material){
  Object3D.call(this);

  this.normalMatrix = mat3.create();
  this.modelViewMatrix = mat4.create();

  this.geometry = geometry;
  this.material = material;

  this.useColor = !this.material.texture;

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


  // NO NEED TO deallocate the buffer.
  // bufferData auto resize the buffer size, and upload the data
  // // destroy original buffers
  // if(this.vb)
  //   gl.deleteBuffer(this.vb);
  // if(this.ib)
  //   gl.deleteBuffer(this.ib);

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

  // always have a vertex array
  gl.vertexAttribPointer(attribute['a_Vertex'], 3, gl.FLOAT, false, 48, 0);
  gl.enableVertexAttribArray(attribute['a_Vertex']);

  if(typeof attribute['a_Normal'] !== 'undefined'){
    gl.vertexAttribPointer(attribute['a_Normal'], 3, gl.FLOAT, false, 48, 12);
    gl.enableVertexAttribArray(attribute['a_Normal']);
  }
  if(typeof attribute['a_TexCoord'] !== 'undefined'){
    gl.vertexAttribPointer(attribute['a_TexCoord'], 2, gl.FLOAT, false, 48, 24);
    gl.enableVertexAttribArray(attribute['a_TexCoord']);
  }
  if(typeof attribute['a_Color'] !== 'undefined'){
    gl.vertexAttribPointer(attribute['a_Color'], 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(attribute['a_Color']);
  }
}

p.setUniform = function(uniform){
  gl.uniform1i(uniform['u_UseColor'], this.useColor);

  // normal model view matrix
  gl.uniformMatrix4fv(uniform['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix3fv(uniform['u_NormalMatrix'], false, this.normalMatrix);

  // set model matrix, for shadow mapping use
  gl.uniformMatrix4fv(uniform['u_ModelMatrix'], false, this.worldMatrix);
}

p.draw = function(shader, camera){
  // update to model view matrix
  mat4.mul(this.modelViewMatrix, camera.matrix, this.worldMatrix);
  // transform model normal
  // ********
  // notice that the normal matrix is inverse transpose of the ** model view ** matrix
  // ********
  mat3.normalFromMat4(this.normalMatrix, this.modelViewMatrix);

  // setup uniform and attributes
  this.setAttribute(shader.attribute);
  this.material.setUniform(shader.uniform);
  this.setUniform(shader.uniform);

  // bind texture
  if(this.material.texture){
    Texture.bind(this.material.texture.textureID);
  }

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}