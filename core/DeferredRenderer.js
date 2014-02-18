"use strict"
function DeferredRenderer(){
  this.canvas = document.createElement('canvas');
  document.body.appendChild(this.canvas);
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  window.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

  this.bufferWidth = 1280;
  this.bufferHeight = 1280;

  window.addEventListener('resize', this.onResize);

  this.dbExt = gl.getExtension("WEBGL_draw_buffers");
  this.dtExt = gl.getExtension("WEBGL_depth_texture");
  this.vaoExt = gl.getExtension("OES_vertex_array_object");

  var supportedNames = gl.getSupportedExtensions();

  // include extensions' properties into gl, for convenience reason.
  var exts = [this.dbExt, this.dtExt, this.vaoExt];
  ExtensionCheck.check(exts);
  for(var i=0; i<exts.length; ++i){
    var ext = exts[i];
    for(var name in ext){
      if(gl[name] === undefined){
        if(ext[name] instanceof Function){
          (function(e, n){
            gl[n] = function(){
              return e[n].apply(e, arguments);
            }
          })(ext, name);
        }
        else
          gl[name] = ext[name];
      }
      else
        console.error('gl conflict name in extension: ' + ext +' name: ' + name);
    }
  }

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  //
  // Depth target holds gl_FragCoord.z value, just light standard depth texture value. I need it because WebGL depth stencil texture attachment(gl.DEPTH_STENCIL)
  // has bug, cannot get stencil working properly during lighting pass. This depth target is purely used for sampling in other passes.
  // OpenGL depth test, stencil test is handled by depth stencil render buffer, shown below.
  var depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  // Because the DEPTH_STENCIL texture bug, I have to use depth stencil render buffer for OpenGL depth and stencil test.
  var depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  this.geometryPass = new GeometryPass({
    width: this.bufferWidth,
    height: this.bufferHeight,

    init: (function(depthBuffer, depthStencilRenderBuffer){
      return function(){
        this.shader = new Shader('shader/geometry.vert', 'shader/geometry.frag');

        // Geometry pass render targets
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
        // multiple render targets requires specifies a list of color buffers to be drawn into.
        gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
      }
    })(depthBuffer, depthStencilRenderBuffer)
  });

  this.lightPass = new LightPass({
    inputs: [this.geometryPass],
    width: this.bufferWidth,
    height: this.bufferHeight,

    init: (function(depthBuffer){
      return function(){
        // point light calculation
        this.pointLightShader = new Shader('shader/light/point.vert', 'shader/light/point.frag');
        // directional light calculation
        this.dirLightShader = new Shader('shader/light/directional.vert', 'shader/light/directional.frag');
        // null shader for stencil update
        this.stencilShader = new Shader('shader/stencil.vert', 'shader/stencil.frag');

        // The accumulation buffers, diffuse and specular is separated. The separated diffuse texture could be used later for stable camera exposure setup, tone mapping.
        this.export.diffuseLightBuffer = RenderPass.createColorTexture(this.width, this.height);
        this.export.specularLightBuffer = RenderPass.createColorTexture(this.width, this.height);

        this.depthBuffer = depthBuffer;

        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.diffuseLightBuffer.glTexture, 0);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.specularLightBuffer.glTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
        // multiple render targets requires specifies a list of color buffers to be drawn into.
        gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0+0, gl.COLOR_ATTACHMENT0+1]);        
      }
    })(depthBuffer)
  });

  this.synthesisPass = new SynthesisPass({ 
    inputs: [this.geometryPass, this.lightPass],
    width: this.bufferWidth,
    height: this.bufferHeight,

    init: (function(depthStencilRenderBuffer){
      return function(){
        this.synthesisShader = new Shader('shader/synthesis.vert', 'shader/synthesis.frag');
        this.skyBoxShader = new Shader('shader/skybox.vert', 'shader/skybox.frag');

        this.export.compositeBuffer = RenderPass.createColorTexture(this.width, this.height);

        // TODO: FIXME: find a better way to do input, output and sharing the targets
        this.framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.export.compositeBuffer.glTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilRenderBuffer);
      }
    })(depthStencilRenderBuffer)
  });

  this.screenPass = new ScreenPass({ 
    inputs: [this.synthesisPass],
    width: this.canvas.width,
    height: this.canvas.height,
    init: function(){
      this.shader = new Shader('shader/screen.vert', 'shader/screen.frag');
    }
  });

  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
}
var p = DeferredRenderer.prototype;

p.render = function(scene, camera){
  // update model, world matrix
  scene.updateModelMatrix();

  // light probe capturing the scene
  

  // update the view dependent matrix
  scene.updateViewMatrix(camera);

  this.geometryPass.render(scene, camera);
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