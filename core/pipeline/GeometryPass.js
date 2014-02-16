function GeometryPass(renderer, shader){
  RenderPass.call(this, renderer);

  this.shader = shader || new Shader('shader/geometry.vert', 'shader/geometry.frag');

  // Geometry pass render targets
  this.export.albedoBuffer = RenderPass.createColorTexture(this.renderer.bufferWidth, this.renderer.bufferHeight);
  this.export.normalBuffer = RenderPass.createColorTexture(this.renderer.bufferWidth, this.renderer.bufferHeight);
  this.export.specularBuffer = RenderPass.createColorTexture(this.renderer.bufferWidth, this.renderer.bufferHeight);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.albedoBuffer.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.normalBuffer.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, this.export.specularBuffer.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+3, gl.TEXTURE_2D, this.renderer.depthBuffer.glTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderer.depthStencilRenderBuffer);
  // multiple render targets requires specifies a list of color buffers to be drawn into.
  gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
}
var p = GeometryPass.prototype = Object.create(RenderPass.prototype);


p.render = function(scene, camera){
  // enable depth buffer
  gl.depthMask(true);

  gl.useProgram(this.shader.program)
  // g-buffers render
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.renderer.bufferWidth, this.renderer.bufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  // cull face needs to be enabled during G-buffer filling
  gl.enable(gl.CULL_FACE);
  // depth test of course is needed
  gl.enable(gl.DEPTH_TEST);
  // TODO: disable blend for now for G-Buffer, future needs support transparency.
  gl.disable(gl.BLEND);

  // upload camera uniforms for geometry shader
  camera.uploadUniforms(this.shader);

  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    scene.meshes[i].draw(this.shader);
  }

  // now you have finished filling the G-Buffers, the depth information is recorded.
  // Other passes, such as lighting pass should only read the depth information.
  gl.depthMask(false);
}