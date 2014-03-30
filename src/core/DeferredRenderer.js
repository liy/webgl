define(function(require){
"use strict"

var RenderPass = require('core/pipeline/RenderPass');
var GeometryPass = require('core/pipeline/GeometryPass');
var LightPass = require('core/pipeline/LightPass');
var SynthesisPass = require('core/pipeline/SynthesisPass');
var ScreenPass = require('core/pipeline/ScreenPass');
var Texture2D = require('texture/Texture2D');

var DeferredRenderer = function(canvasWidth, canvasHeight, bufferWidth, bufferHeight){
  this.bufferWidth = bufferWidth || 1024;
  this.bufferHeight = bufferHeight || 1024;

  this.canvasWidth = canvasWidth;
  this.canvasHeight = canvasHeight;

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  //
  // Depth target holds gl_FragCoord.z value, just stores standard depth texture value. I need it because WebGL depth stencil texture attachment(gl.DEPTH_STENCIL)
  // has bug, cannot get stencil working properly during lighting pass. This depth target is purely used for sampling in other passes.
  // The actual OpenGL depth test and stencil test is done by depth stencil render buffer, shown below.
  var depthBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  // Because the DEPTH_STENCIL texture bug, I have to use depth stencil render buffer for OpenGL depth and stencil test.
  var depthStencilRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthStencilRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, this.bufferWidth, this.bufferHeight);

  // geometry buffers
  var albedoBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  var normalBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  var specularBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  this.geometryPass = new GeometryPass(albedoBuffer, normalBuffer, specularBuffer, depthBuffer, depthStencilRenderBuffer);

  // The accumulation buffers, diffuse and specular is separated. The separated diffuse texture could be used later for stable camera exposure setup, tone mapping.
  var diffuseLightBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  var specularLightBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  this.lightPass = new LightPass(diffuseLightBuffer, specularLightBuffer, depthBuffer, depthStencilRenderBuffer);

  var compositeBuffer = new Texture2D({width: this.bufferWidth, height: this.bufferHeight});
  this.synthesisPass = new SynthesisPass(compositeBuffer, depthStencilRenderBuffer);

  this.screenPass = new ScreenPass(canvasWidth, canvasHeight);

  this.lightPass.inputs = [this.geometryPass];
  this.synthesisPass.inputs = [this.geometryPass, this.lightPass];
  this.screenPass.inputs = [this.synthesisPass];
}
var p = DeferredRenderer.prototype;

p.render = function(scene, camera){
  // update the view dependent matrix
  scene.updateModelViewMatrix(camera);

  gl.viewport(0, 0, this.bufferWidth, this.bufferHeight);
  this.geometryPass.render(scene, camera);
  this.lightPass.render(scene, camera);
  this.synthesisPass.render(scene, camera);

  gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
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