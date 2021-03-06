define(function(require){
"use strict"

var ExtensionCheck = require('util/ExtensionCheck');

var RenderEngine = function(canvasWidth, canvasHeight){
  this.canvas = document.createElement('canvas');
  document.body.appendChild(this.canvas);
  this.canvas.width = canvasWidth || window.innerWidth;
  this.canvas.height = canvasHeight || window.innerHeight;
  window.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  // window.addEventListener('resize', this.onResize);

  // check required extensions
  var requiredExtensions = [gl.getExtension("WEBGL_draw_buffers"), gl.getExtension("WEBGL_depth_texture"), gl.getExtension("OES_vertex_array_object")];
  ExtensionCheck.check(requiredExtensions);

  // include extensions' properties into gl, for convenience reason.
  var supportedExtenstionNames = gl.getSupportedExtensions();
  this.extensions = [];
  for(var i=0; i<supportedExtenstionNames.length; ++i){
    var ext = this.extensions[i] = gl.getExtension(supportedExtenstionNames[i]);
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

  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
};
var p = RenderEngine.prototype;

return RenderEngine;
});