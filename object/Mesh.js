function Mesh(geometry, material){
  Object3D.call(this);

  this.normalMatrix = mat3.create();
  this.modelViewMatrix = mat4.create();
  this.viewSpacePosition = vec3.create();

  this.geometry = geometry;
  this.material = material;

  this.createBuffer();
}
var p = Mesh.prototype = Object.create(Object3D.prototype);

// NO NEED TO deallocate the buffer.
// bufferData auto resize the buffer size, and upload the data
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

  // vertex buffer
  this.vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // index information
  this.ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indices), gl.STATIC_DRAW);
}

p.setAttributes = function(attributes){
  // vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

  // always have a vertex array
  gl.vertexAttribPointer(attributes['a_Vertex'], 3, gl.FLOAT, false, 48, 0);
  gl.enableVertexAttribArray(attributes['a_Vertex']);

  if(typeof attributes['a_Normal'] !== 'undefined'){
    gl.vertexAttribPointer(attributes['a_Normal'], 3, gl.FLOAT, false, 48, 12);
    gl.enableVertexAttribArray(attributes['a_Normal']);
  }
  if(typeof attributes['a_TexCoord'] !== 'undefined'){
    gl.vertexAttribPointer(attributes['a_TexCoord'], 2, gl.FLOAT, false, 48, 24);
    gl.enableVertexAttribArray(attributes['a_TexCoord']);
  }
  if(typeof attributes['a_Color'] !== 'undefined'){
    gl.vertexAttribPointer(attributes['a_Color'], 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(attributes['a_Color']);
  }
}

p.setUniforms = function(uniforms){
  // normal, model view matrix
  gl.uniformMatrix4fv(uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix3fv(uniforms['u_NormalMatrix'], false, this.normalMatrix);
  // set model matrix, for shadow mapping use
  gl.uniformMatrix4fv(uniforms['u_ModelMatrix'], false, this.worldMatrix);
}

p.draw = function(shader, camera){
  // setup uniform and attributes
  this.setAttributes(shader.attributes);
  this.material.setUniforms(shader.uniforms);
  this.setUniforms(shader.uniforms);

  // always use texture 0 for mesh texture
  gl.activeTexture(gl.TEXTURE0);
  // bind texture
  if(this.material.texture)
    TextureLoader.bind(this.material.texture);
  else
    TextureLoader.bind(null);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}