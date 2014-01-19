function Mesh(geometry, material){
  Object3D.call(this);

  // model view matrix
  this.modelViewMatrix = mat4.create();
  // normal matrix
  this.normalMatrix = mat3.create();

  this.geometry = geometry;
  this.material = material || new Material();
}
var p = Mesh.prototype = Object.create(Object3D.prototype);

p.prepare = function(shader){
  this.geometry.computeFaceNormal();
  // compute vertex normal, if there is no vertex normal defined
  if(this.geometry.normals.length == 0)
    this.geometry.computeVertexNormal();

  // vertex array buffer object, needs extension support! For simplify the attribute binding
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  // vertices information
  var data = [];
  var len = this.geometry.vertices.length;
  for(var i=0; i<len; ++i){
    // vertex
    var v = this.geometry.vertices[i];
    data.push(v.x);
    data.push(v.y);
    data.push(v.z);

    // normal
    if(this.geometry.normals.length !== 0){
      var n = this.geometry.normals[i];
      data.push(n.x);
      data.push(n.y);
      data.push(n.z);  
    }
    
    // texCoords
    if(this.geometry.texCoords.length !== 0){
      var t = this.geometry.texCoords[i];
      data.push(t.x);
      data.push(t.y);
    }

    // tint color, RGBA
    if(this.material.color.length !== 0){
      data.push(this.material.color[0]);
      data.push(this.material.color[1]);
      data.push(this.material.color[2]);
      data.push(this.material.color[3]);
    }
  }

  // create the buffer contains all the data
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // calculate stride bytes
  var strideBytes = 12;
  if(this.geometry.normals.length !== 0)
    strideBytes += 12;
  if(this.geometry.texCoords.length !== 0)
    strideBytes += 8;
  if(this.material.color.length !== 0)
    strideBytes += 16;

  // starting point of each attribute data
  var pointerOffset = 0;
  // vertex
  gl.enableVertexAttribArray(shader.attributes.a_Vertex);
  gl.vertexAttribPointer(shader.attributes.a_Vertex, 3, gl.FLOAT, false, strideBytes, pointerOffset);

  // normal
  if(this.geometry.normals.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Normal);
    gl.vertexAttribPointer(shader.attributes.a_Nomral, 3, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // texture coordinate
  if(this.geometry.texCoords.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_TexCoord);
    gl.vertexAttribPointer(shader.attributes.a_TexCoord, 2, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // tint color
  if(this.material.color.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Color);
    gl.vertexAttribPointer(shader.attributes.a_Color, 4, gl.FLOAT, false, strideBytes, pointerOffset+=8);
  }
  
  // index information
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexData), gl.STATIC_DRAW);

  gl.bindVertexArrayOES(null);

  // prepare children.
  Object3D.prototype.prepare.call(this, shader);
}

p.update = function(camera){
  // if user set the simple xyz, rotation or scale values, autoMatrix will be set to true.
  // The object's matrix will be computed by those values instead.
  if(this.autoMatrix){
    mat4.identity(this._matrix);
    mat4.translate(this._matrix, this._matrix, this._position);
    mat4.rotateX(this._matrix, this._matrix, this._rotationX);
    mat4.rotateY(this._matrix, this._matrix, this._rotationY);
    mat4.rotateZ(this._matrix, this._matrix, this._rotationZ);
    mat4.scale(this._matrix, this._matrix, this._scale);
  }

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update model view matrix, normal matrix
  mat4.mul(this.modelViewMatrix, camera.viewMatrix, this.worldMatrix);
  mat3.normalFromMat4(this.normalMatrix, this.modelViewMatrix);


  // update the matrix of its children
  this._updateChildrenMatrix(camera);

  console.log(this.modelViewMatrix);
}

p.setUniforms = function(shader){
  // set model matrix, for shadow mapping use
  gl.uniformMatrix4fv(shader.uniforms['u_ModelMatrix'], false, this.worldMatrix);
  // normal, model view matrix
  gl.uniformMatrix4fv(shader.uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix3fv(shader.uniforms['u_NormalMatrix'], false, this.normalMatrix);
}

p.draw = function(shader, camera){
  // setup uniform and attributes
  // this.material.setUniforms(shader.uniforms);
  this.setUniforms(shader);

  // // always use texture 0 for mesh texture
  // gl.activeTexture(gl.TEXTURE0);
  // // bind texture
  // if(this.material.texture)
  //   TextureLoader.bind(this.material.texture);
  // else
  //   TextureLoader.bind(null);

  gl.bindVertexArrayOES(this.vao);
  gl.drawElements(gl.TRIANGLES, this.geometry.indexData.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArrayOES(null);

  // draw children.
  Object3D.prototype.draw.call(this, shader, camera);
}