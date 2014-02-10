function GeometryTarget(w, h){
  RenderPass.call(this, w, h);

  this.program = gl.createProgram();
  this.shader = new Shader(this.program, 'shader/geometry.vert', 'shader/geometry.frag');
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);


  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frambuffer);
  // specify 3 textures as render targets
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.albedoTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.normalTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, this.specularTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+3, gl.TEXTURE_2D, this.depthColorTarget.glTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);

  // Specifies a list of color buffers to be drawn into
  gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
}
var p = GeometryTarget.prototype = Object.create(RenderPass.prototype);