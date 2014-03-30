define(function(require){
"use strict"

var Texture = require('texture/Texture');
var Library = require('assets/Library');
var ImageResource = require('assets/resource/Resource');

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

p.init = function(data){
  if(data instanceof ImageResource){
    this.resource = data;
    this.resource.ready.then(this.onComplete.bind(this));
  }
  else{
    this.bind();
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, data.internalformat || gl.RGBA, data.width, data.height, 0, data.format || gl.RGBA, data.type || gl.UNSIGNED_BYTE, null);
    this.unbind();
  }
}

p.onComplete = function(){
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

  // texture setup completed, can be bound now.
  this.complete = true;

  this.unbind();
}

return Texture2D;

});