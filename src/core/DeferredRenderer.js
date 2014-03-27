define(function(require){

var RenderPass = require('core/pipeline/RenderPass');
var GeometryPass = require('core/pipeline/GeometryPass');
var LightPass = require('core/pipeline/LightPass');
var SynthesisPass = require('core/pipeline/SynthesisPass');
var ScreenPass = require('core/pipeline/ScreenPass');


"use strict"
var DeferredRenderer = function(engine){
  this.engine = engine;
  this.bufferWidth = engine.bufferWidth;
  this.bufferHeight = engine.bufferHeight;
  this.canvasWidth = engine.canvas.width;
  this.canvasHeight = engine.canvas.height;

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  //
  // Depth target holds gl_FragCoord.z value, just stores standard depth texture value. I need it because WebGL depth stencil texture attachment(gl.DEPTH_STENCIL)
  // has bug, cannot get stencil working properly during lighting pass. This depth target is purely used for sampling in other passes.
  // The actual OpenGL depth test and stencil test is done by depth stencil render buffer, shown below.
  this.depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  // Because the DEPTH_STENCIL texture bug, I have to use depth stencil render buffer for OpenGL depth and stencil test.
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  this.geometryPass = new GeometryPass(this);
  this.lightPass = new LightPass(this, [this.geometryPass]);
  this.synthesisPass = new SynthesisPass(this, [this.geometryPass, this.lightPass]);
  this.screenPass = new ScreenPass(this, [this.synthesisPass]);
}
var p = DeferredRenderer.prototype;

p.render = function(scene, camera){
  // light probe capturing the scene
  // LightProbePass.instance.capture(scene);

  // update the view dependent matrix
  scene.updateViewMatrix(camera);

  this.geometryPass.render(scene, camera);
  // debug draw light probe. This is only for debugging purpose
  // LightProbePass.instance.render(scene, camera);
  this.lightPass.render(scene, camera);
  this.synthesisPass.render(scene, camera);
  this.screenPass.render(scene, camera);
}

function sort(camera){
  return function(a, b){
    if(a.material.name != b.material.name){
      if(a.material.name < b.material.name)
        return 1;
      else
        return -1;
    }


    if(a._viewSpacePosition[2] < b._viewSpacePosition[2])
      return 1;
    else if(a._viewSpacePosition[2] > b._viewSpacePosition[2])
      return -1
    else
      return 0;
  }
}

return DeferredRenderer;
});