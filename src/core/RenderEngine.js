define(function(require){
"use strict"

var ExtensionCheck = require('util/ExtensionCheck');

var RenderEngine = function(bufferWidth, bufferHeight, canvasWidth, canvasHeight){
  this.bufferWidth = bufferWidth || 1280;
  this.bufferHeight = bufferHeight || 1280;

  this.canvas = document.createElement('canvas');
  document.body.appendChild(this.canvas);
  this.canvasWidth = canvasWidth || window.innerWidth;
  this.canvasHeight = canvasHeight || window.innerHeight;
  window.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

  window.addEventListener('resize', this.onResize);

  this.dbExt = gl.getExtension("WEBGL_draw_buffers");
  this.dtExt = gl.getExtension("WEBGL_depth_texture");
  this.vaoExt = gl.getExtension("OES_vertex_array_object");

  var supportedNames = gl.getSupportedExtensions();

  // include extensions' properties into gl, for convenience reason.
  var exts = [this.dbExt, this.dtExt, this.vaoExt];
  ExtensionCheck.check(exts);
  for(var i=0; i<exts.length; ++i){
    var ext = exts[i];
    for(var name in ext){
      if(gl[name] === undefined){
        if(ext[name] instanceof Function){
          (function(e, n){
            gl[n] = function(){
              return e[n].apply(e, arguments);
            }
          })(ext, name);
        }
        else
          gl[name] = ext[name];
      }
      else
        console.error('gl conflict name in extension: ' + ext +' name: ' + name);
    }
  }

  function validateNoneOfTheArgsAreUndefined(functionName, args) {
    for (var ii = 0; ii < args.length; ++ii) {
      if (args[ii] === undefined) {
        console.error("undefined passed to gl." + functionName + "(" +
                       WebGLDebugUtils.glFunctionArgsToString(functionName, args) + ")");
      }
    }
  }
  // FIXME: enable this, ensure no undefined location is passed into gl related function
  // gl = WebGLDebugUtils.makeDebugContext(gl, undefined, validateNoneOfTheArgsAreUndefined);
};
var p = RenderEngine.prototype;

p.render = function(scene, camera){
  // update model, world matrix
  scene.updateModelMatrix();

  // light probe capturing the scene
  // LightProbePass.instance.capture(scene);

  // update the view dependent matrix
  scene.updateViewMatrix(camera);
}

});