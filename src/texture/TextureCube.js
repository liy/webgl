define(function(require){
"use strict"

var Library = require('assets/Library');
var Texture = require('texture/Texture');

var TextureCube = function(){
  Texture.call(this, gl.TEXTURE_CUBE_MAP);

  this.bind();
  // The edge must be clamped. Otherwise there will be artifact on face joint edges.
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameterf(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  this.unbind();
}
var p = TextureCube.prototype = Object.create(Texture.prototype);

/**
 * Initialization
 * @param  {[type]} faces { resource: ImageResource, target: gl.TEXTURE_CUBE_MAP_POSITIVE_X }
 */
p.init = function(faces){
  var promises = faces.map(function(face){
    var texture = this;

    // update each face's texture data when loaded.
    face.resource.ready.then(function(resource){
      texture.bind();

      // flip the texture content in y direction.
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      if(resource.data instanceof Image)
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resource.data);
      else
        gl.texImage2D(face.target, 0, gl.RGBA, resource.width, resource.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, resource.data);

      texture.unbind();
    });

    return face.resource.ready;
  }.bind(this));

  Promise.all(promises).then(this.onComplete.bind(this));
}

p.onComplete = function(){
  this.bind();

  if(this.setParameters)
    this.setParameters(this);

  this.complete = true;

  this.unbind();
}

return TextureCube;

});