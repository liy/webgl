function RenderPass(w, h){
  this.width = w;
  this.height = h;

  this.framebuffer = null;
}
var p = RenderPass.prototype;

p.render = function(){

}

p.createColorTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  texture.unbind();

  return texture;
}

p.createDepthTexture = function(w, h){
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
p.createColorDepthTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  texture.unbind();

  return texture;
}

p.createDepthStencilTexture = function(w, h){
  var texture = new Texture2D();
  texture.bind();
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // this requires WEBKIT_WEBGL_depth_texture extension, notice the type of the data must be: UNSIGNED_INT_24_8_WEBGL
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, w, h, 0, gl.DEPTH_STENCIL, gl.UNSIGNED_INT_24_8_WEBGL, null);
  texture.unbind();

  return texture;
}

p.createDepthStencilRenderBuffer = function(w, h){
  var renderbuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);

  return renderbuffer;
}