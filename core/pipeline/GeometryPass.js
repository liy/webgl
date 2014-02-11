function GeometryPass(renderer, w, h){
  RenderPass.call(this, renderer, w, h);

  this.program = gl.createProgram();
  this.shader = new Shader(this.program, 'shader/geometry.vert', 'shader/geometry.frag');
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);

  // Geometry pass render targets
  renderer.albedoTarget = this.createColorTexture(this.width, this.height);
  renderer.normalTarget = this.createColorTexture(this.width, this.height);
  renderer.specularTarget = this.createColorTexture(this.width, this.height);

  // Depth target holds gl_FragCoord.z value, just light standard depth texture value. I need it because WebGL depth stencil texture attachment(gl.DEPTH_STENCIL) 
  // has bug, cannot get stencil working properly during lighting pass. This depth target is purely used for sampling in other passes.
  // OpenGL depth test, stencil test is handled by depth stencil render buffer, shown below.
  renderer.depthTarget = this.createColorDepthTexture(this.width, this.height);
  // Because the DEPTH_STENCIL texture bug, I have to use depth stencil render buffer for OpenGL depth and stencil test.
  renderer.depthStencilRenderBuffer = this.createDepthStencilRenderBuffer(this.width, this.height);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, renderer.albedoTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, renderer.normalTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, renderer.specularTarget.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+3, gl.TEXTURE_2D, renderer.depthTarget.glTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderer.depthStencilRenderBuffer);
  // multiple render targets requires specifies a list of color buffers to be drawn into.
  gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
}
var p = GeometryPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  // enable depth buffer
  gl.depthMask(true);

  gl.useProgram(this.program);
  // g-buffers render
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.width, this.height);
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
  // Lighting pass should only read the depth information.
  gl.depthMask(false);
}