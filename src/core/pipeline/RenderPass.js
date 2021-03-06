define(function(require){
"use strict"

var  Texture2D = require('texture/Texture2D');

var RenderPass = function(){
  // render targets, textures imported from parent passes, upstream.
  this.import = Object.create(null);
  // The render targets which the current RenderPass expose to other RenderPasses, downstream.
  this.export = Object.create(null);

  this.framebuffer = null;

  this._inputs = [];
}
var p = RenderPass.prototype;

Object.defineProperty(p, "inputs", {
  get: function(){
    return this._inputs;
  },
  set: function(inputs){
    for(var i=0; i<inputs.length; ++i){
      var renderPass = inputs[i];
      // assign parent pass's exporting textures
      for(var name in renderPass.export){
        this.import[name] = renderPass.export[name];
      }
    }
    this._inputs = inputs;
  }
});

p.render = function(){

}

// RenderPass.createColorTexture = function(w, h){
//   var texture = new Texture2D({width:w, height:h});

//   return texture;
// }

// RenderPass.createDepthTexture = function(w, h){
//   // var texture = new Texture2D();
//   // texture.bind();
//   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   // gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
//   // texture.unbind();
//   var texture = new Texture2D({
//     internalFormat: gl.DEPTH_COMPONENT,
//     width: w,
//     height: h,
//     format: gl.DEPTH_COMPONENT,
//     type: gl.UNSIGNED_SHORT
//   });

//   return texture;
// }

// /**
//  * You should encode depth data into RGBA manually.
//  */
// RenderPass.createColorDepthTexture = function(w, h){
//   var texture = new Texture2D({width:w, height:h});
//   // texture.bind();
//   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
//   // texture.unbind();

//   return texture;
// }

// RenderPass.createDepthStencilTexture = function(w, h){
//   var texture = new Texture2D({
//     internalFormat: gl.DEPTH_STENCIL,
//     width: w,
//     height: h,
//     format: gl.DEPTH_STENCIL,
//     type: gl.UNSIGNED_INT_24_8_WEBGL
//   });
//   texture.bind();
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   texture.unbind();

//   return texture;
// }

// RenderPass.createDepthStencilRenderBuffer = function(w, h){
//   var renderbuffer = gl.createRenderbuffer();
//   gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
//   gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);

//   return renderbuffer;
// }

return RenderPass;

});