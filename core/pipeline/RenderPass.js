function RenderPass(params){
  // render targets, textures imported from parent passes, upstream.
  this.import = Object.create(null);
  // The render targets which the current RenderPass expose to other RenderPasses, downstream.
  this.export = Object.create(null);

  this.framebuffer = null;

  if(params){
    if(params.inputs){
      for(var i=0; i<params.inputs.length; ++i){
        var renderPass = params.inputs[i];
        // assign parent pass's exporting textures
        for(var name in renderPass.export){
          this.import[name] = renderPass.export[name];
        }
      }
    }

    for(var name in params){
      this[name] = params[name];
    }

    // handle invalid buffer width and height
    this.width = this.width || 128;
    this.height = this.height || 128;

    if(this.init)
      this.init();
  }
}
var p = RenderPass.prototype;

p.render = function(){

}

RenderPass.createColorTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  texture.unbind();

  return texture;
}

RenderPass.createDepthTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
  texture.unbind();

  return texture;
}

/**
 * You should encode depth data into RGBA manually.
 */
RenderPass.createColorDepthTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  texture.unbind();

  return texture;
}

RenderPass.createDepthStencilTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // this requires WEBKIT_WEBGL_depth_texture extension, notice the type of the data must be: UNSIGNED_INT_24_8_WEBGL
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, w, h, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8_WEBGL, null);
  texture.unbind();

  return texture;
}

RenderPass.createDepthStencilRenderBuffer = function(w, h){
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);

  return renderbuffer;
}