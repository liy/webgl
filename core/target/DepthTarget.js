function DepthTarget(renderer){
  RenderTarget.call(this, renderer);
  this.shader = new Shader(this.program, 'shader/depth.vert', 'shader/depth.frag');

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.renderer.canvas.width, this.renderer.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  // TODO: check depth texture extension, if extension available use the extension. Otherwise, use renderbuffer to draw depth information.
}
var p = DepthTarget.prototype = Object.create(RenderTarget.prototype);

p.render = function(scene, camera){
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
  gl.clear(gl.DEPTH_BUFFER_BIT);

  // TODO: draw the scene

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}