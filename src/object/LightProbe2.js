define(function(require){
"use strict"

var LightProbe2 = function(){

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  //
  // Depth target holds gl_FragCoord.z value, just stores standard depth texture value. I need it because WebGL depth stencil texture attachment(gl.DEPTH_STENCIL)
  // has bug, cannot get stencil working properly during lighting pass. This depth target is purely used for sampling in other passes.
  // The actual OpenGL depth test and stencil test is done by depth stencil render buffer, shown below.
  var depthBuffer = RenderPass.createColorDepthTexture(bufferWidth, bufferHeight);
  // Because the DEPTH_STENCIL texture bug, I have to use depth stencil render buffer for OpenGL depth and stencil test.
  var depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(bufferWidth, bufferHeight);

  this.geometryPass = new GeometryPass(bufferWidth, bufferHeight, depthBuffer, depthStencilRenderBuffer);
  this.lightPass = new LightPass(bufferWidth, bufferHeight, depthBuffer, depthStencilRenderBuffer);
  this.synthesisPass = new SynthesisPass(bufferWidth, bufferHeight, depthStencilRenderBuffer);

  this.lightPass.inputs = [this.geometryPass];
  this.synthesisPass.inputs = [this.geometryPass, this.lightPass];
}
var p = LightProbe2.prototype = Object.create(Node.prototype);

p.capture = function(scene){

}

return LightProbe2;

})