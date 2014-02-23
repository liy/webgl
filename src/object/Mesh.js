"use strict"
function Mesh(geometry, material){
  Node.call(this);

  // model view matrix
  this.modelViewMatrix = mat4.create();
  // for normal transformation and tangent transformation
  this.normalMatrix = mat3.create();

  this.geometry = geometry;
  this.material = material || new Material();

  this.createBuffer();
}
var p = Mesh.prototype = Object.create(Node.prototype);

p.createBuffer = function(){
  this.geometry.computeFaceNormal();
  // compute vertex normal, if there is no vertex normal defined
  // if(this.geometry.normals.length === 0)
    this.geometry.computeVertexNormal();
  if(this.geometry.texCoords.length !== 0)
    this.geometry.computeTangent();

  // vertices information
  var data = [];
  var len = this.geometry.vertices.length;
  for(var i=0; i<len; ++i){
    // vertex
    var v = this.geometry.vertices[i];
    data.push(v[0]);
    data.push(v[1]);
    data.push(v[2]);

    // normal
    if(this.geometry.normals.length !== 0){
      var n = this.geometry.normals[i];
      data.push(n[0]);
      data.push(n[1]);
      data.push(n[2]);
    }

    // texCoords
    if(this.geometry.texCoords.length !== 0){
      var t = this.geometry.texCoords[i];
      data.push(t[0]);
      data.push(t[1]);
    }

    // tangents and bitangents
    if(this.geometry.tangents.length !== 0){
      var ta = this.geometry.tangents[i];
      data.push(ta[0]);
      data.push(ta[1]);
      data.push(ta[2]);

       var bt = this.geometry.bitangents[i];
      data.push(bt[0]);
      data.push(bt[1]);
      data.push(bt[2]);
    }
  }

  // create the buffer contains all the data
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // index information
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexData), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

p.createVertexArray = function(shader){
  // vertex array buffer object, needs extension support! For simplify the attribute binding
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  // calculate stride bytes
  var strideBytes = 12;
  if(this.geometry.normals.length !== 0)
    strideBytes += 12;
  if(this.geometry.texCoords.length !== 0)
    strideBytes += 8;
  // tangent
  if(this.geometry.tangents.length !== 0)
    strideBytes += 12;
  // bitangent
  if(this.geometry.bitangents.length !== 0)
    strideBytes += 12;

  // starting point of each attribute data
  var pointerOffset = 0;
  // vertex
  gl.enableVertexAttribArray(shader.attributes.a_Vertex);
  gl.vertexAttribPointer(shader.attributes.a_Vertex, 3, gl.FLOAT, false, strideBytes, pointerOffset);

  // normal
  if(this.geometry.normals.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Normal);
    gl.vertexAttribPointer(shader.attributes.a_Normal, 3, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // texture coordinate
  if(this.geometry.texCoords.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_TexCoord);
    gl.vertexAttribPointer(shader.attributes.a_TexCoord, 2, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // tangent coordinate
  if(this.geometry.tangents.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Tangent);
    gl.vertexAttribPointer(shader.attributes.a_Tangent, 3, gl.FLOAT, false, strideBytes, pointerOffset+=8);
  }

  // bitangent coordinate
  if(this.geometry.bitangents.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Bitangent);
    gl.vertexAttribPointer(shader.attributes.a_Bitangent, 3, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // index information
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.bindVertexArrayOES(null);
}

p.uploadUniforms = function(shader){
  shader.mat4('u_ModelMatrix', this.worldMatrix);
  shader.mat4('u_ModelViewMatrix', this.modelViewMatrix);
  shader.mat3('u_NormalMatrix', this.normalMatrix);

  if(this.material)
    this.material.uploadUniforms(shader);
}

p.draw = function(shader){
  // Any better way to setup vertex array object? It needs shader attributes access...
  if(this.vao === undefined)
    this.createVertexArray(shader);

  this.uploadUniforms(shader);

  gl.bindVertexArrayOES(this.vao);
  gl.drawElements(gl.TRIANGLES, this.geometry.indexData.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArrayOES(null);
}