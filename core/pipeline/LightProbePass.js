"use strict"

function LightProbePass(params){
  RenderPass.call(this, params);

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.width, this.height);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.width, this.height);
}
var p = LightProbePass.prototype;

p.render = function(scene){
  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].capture(scene);
  }
}