"use strict"

function LightProbePass(params){
  RenderPass.call(this, params);

  this.width = this.height = 128;

  // default depth buffer and depth stencil buffer used by light probe.
  // If the light probe's width and height is different from default value, they will use their own depth and depth stencil buffer
  this.depthBuffer = RenderPass.createColorDepthTexture(this.width, this.height);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.width, this.height);

  this.geometryPass = new GeometryPass({
    width: this.bufferWidth,
    height: this.bufferHeight,

    init: (function(depthBuffer, depthStencilRenderBuffer){
      return function(){
        this.shader = new Shader('shader/geometry.vert', 'shader/geometry.frag');

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
    width: this.bufferWidth,
    height: this.bufferHeight,

    init: (function(depthBuffer){
      return function(){
        this.pointLightShader = new Shader('shader/light/point.vert', 'shader/light/point.frag');
        this.dirLightShader = new Shader('shader/light/directional.vert', 'shader/light/directional.frag');
        // a null shader for stencil update
        this.stencilShader = new Shader('shader/stencil.vert', 'shader/stencil.frag');

        // The accumulation buffers, diffuse and specular is separated. The separated diffuse texture could be used later for stable camera exposure setup, tone mapping.
        this.export.diffuseLightBuffer = RenderPass.createColorTexture(this.width, this.height);
        this.export.specularLightBuffer = RenderPass.createColorTexture(this.width, this.height);

        // light pass needs to bind and sample depth texture to reconstruct eye space position for lighting calculation
        this.depthBuffer = depthBuffer;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.diffuseLightBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.specularLightBuffer.glTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
        gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0+0, gl.COLOR_ATTACHMENT0+1]);        
      }
    })(this.depthBuffer)
  });
}
var p = LightProbePass.prototype;

p.capture = function(scene){
  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].capture(scene);
  }
}

p.render = function(scene, camera){

}