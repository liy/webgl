define(function(requirejs){

var Shader = require('library/resource/Shader');
var RenderPass = require('core/pipeline/RenderPass');
var GeometryPass = require('core/pipeline/GeometryPass');
var LightPass = require('core/pipeline/LightPass');

"use strict"
var LightProbePass = function(params){
  RenderPass.call(this, params);

  // note that, this.width and this.height are buffer size, not probe size.
  this.defaultProbeWidth = this.defaultProbeHeight = 128;


  // the buffer used by light probe
  this.createSharedPasses();


  // debugger shader
  this.shader = new Shader('src/shader/probe/probe_debug.vert', 'src/shader/probe/probe_debug.frag');
  // debugger buffer
  this.export.lightProbeDebugBuffer = RenderPass.createColorTexture(this.width, this.height);

  // TODO: FIXME: find a better way to do input, output and sharing the targets
  this.debuggerFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.debuggerFramebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.export.lightProbeDebugBuffer.glTexture, 0);
  // !!! FIXME: find a better name for passDepthStencilRenderBuffer
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.passDepthStencilRenderBuffer);
}
var p = LightProbePass.prototype;

p.createSharedPasses = function(){
  // default depth buffer and depth stencil buffer used by light probe.
  // If the light probe's width and height is different from default value, they will use their own depth and depth stencil buffer
  // FIXME: TODO: find a better name!!!!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.defaultProbeWidth, this.defaultProbeHeight);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.defaultProbeWidth, this.defaultProbeHeight);

  this.geometryPass = new GeometryPass({
    width: this.defaultProbeWidth,
    height: this.defaultProbeHeight,

    init: (function(depthBuffer, depthStencilRenderBuffer){
      return function(){
        this.shader = new Shader('src/shader/probe/probe_geometry.vert', 'src/shader/probe/probe_geometry.frag');

        this.export.albedoBuffer = RenderPass.createColorTexture(this.width, this.height);
        this.export.normalBuffer = RenderPass.createColorTexture(this.width, this.height);
        this.export.specularBuffer = RenderPass.createColorTexture(this.width, this.height);

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.albedoBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.normalBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, this.export.specularBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+3, gl.TEXTURE_2D, depthBuffer.glTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilRenderBuffer);
        gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
      }
    })(this.depthBuffer, this.depthStencilRenderBuffer)
  });

  this.lightPass = new LightPass({
    inputs: [this.geometryPass],
    width: this.defaultProbeWidth,
    height: this.defaultProbeHeight,

    init: (function(depthBuffer, depthStencilRenderBuffer){
      return function(){
        this.pointLightShader = new Shader('src/shader/light/point.vert', 'src/shader/light/point.frag');
        this.dirLightShader = new Shader('src/shader/light/directional.vert', 'src/shader/light/directional.frag');
        // a null shader for stencil update
        this.stencilShader = new Shader('src/shader/stencil.vert', 'src/shader/stencil.frag');

        // The accumulation buffers, diffuse and specular is separated. The separated diffuse texture could be used later for stable camera exposure setup, tone mapping.
        this.export.diffuseLightBuffer = RenderPass.createColorTexture(this.width, this.height);
        this.export.specularLightBuffer = RenderPass.createColorTexture(this.width, this.height);

        // light pass needs to bind and sample depth texture to reconstruct eye space position for lighting calculation
        this.depthBuffer = depthBuffer;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.diffuseLightBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.specularLightBuffer.glTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilRenderBuffer);
        gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0+0, gl.COLOR_ATTACHMENT0+1]);
      }
    })(this.depthBuffer, this.depthStencilRenderBuffer)
  });
}

p.capture = function(scene){
  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].capture(scene);
  }
}

p.render = function(scene, camera){
  // enable depth buffer
  gl.depthMask(true);

  gl.useProgram(this.shader.program)
  // g-buffers render
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.debuggerFramebuffer);
  gl.viewport(0, 0, this.width, this.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  // cull face needs to be enabled during G-buffer filling
  gl.enable(gl.CULL_FACE);
  // depth test of course is needed
  gl.enable(gl.DEPTH_TEST);
  // TODO: disable blend for now for G-Buffer, future needs support transparency.
  gl.disable(gl.BLEND);

  // upload camera uniforms for geometry shader
  camera.uploadUniforms(this.shader);

  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].draw(this.shader);
  }

  gl.depthMask(false);
}

return LightProbePass;

});