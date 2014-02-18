"use strict"
function LightProbeRenderer(){

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  // geometry and light pass to render each side
  this.geometryPass = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'));
  this.lightPass = new LightPass(this);

  // framebuffer to hold cube texture
  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
}
var p = LightProbeRenderer.prototype;

p.render = function(scene){
  // light probe capturing the scene
  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].capture(scene);
  }
}