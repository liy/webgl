define(function(require){

var Material = require('material/Material');
var Mesh = require('object/Mesh');
var TextureCube = require('texture/TextureCube');
var SkyBoxGeometry = require('geometry/SkyBoxGeometry');

"use strict"
var SkyBox = function(faces){
  Mesh.call(this, new SkyBoxGeometry(), new Material());

  var cubeTexture = new TextureCube();
  cubeTexture.init(faces);
  this.material.textures.cubeMap = cubeTexture;
}
var p = SkyBox.prototype = Object.create(Mesh.prototype);

p.createBuffer = function(){
  // vertices information
  var data = [];
  var len = this.geometry.vertices.length;
  for(var i=0; i<len; ++i){
    // vertex
    var v = this.geometry.vertices[i];
    data.push(v[0]);
    data.push(v[1]);
    data.push(v[2]);
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

  // vertex
  gl.enableVertexAttribArray(shader.attributes.a_Vertex);
  gl.vertexAttribPointer(shader.attributes.a_Vertex, 3, gl.FLOAT, false, 12, 0);

  // index information
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.bindVertexArrayOES(null);
}

return SkyBox;
});