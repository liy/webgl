define(function(require){

"use strict"

var Texture = require('texture/Texture');
var Library = require('assets/Library');

var Texture2D = function Texture2D(){
  Texture.call(this, gl.TEXTURE_2D);

  // setup default parameters
  this.bind();
  gl.texParameterf(this.target, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameterf(this.target, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameterf(this.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameterf(this.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  this.unbind();
}
var p = Texture2D.prototype = Object.create(Texture.prototype);

p.setResource = function(resource){
  this.resource = resource;
  this.resource.ready.then(this.onComplete.bind(this));
}

p.onComplete = function(){
  this.ready = true;

  this.bind();

  this.width = this.resource.width;
  this.height = this.resource.height;

  // flip the texture content in y direction.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if(this.resource.data instanceof Image)
    gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resource.data);
  else
    gl.texImage2D(this.target, 0, gl.RGBA, this.resource.width, this.resource.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.resource.data);

  if(this.setParameters)
    this.setParameters(this);

  this.unbind();
}

return Texture2D;

});