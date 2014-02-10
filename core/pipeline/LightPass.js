function LightPass(){
  RenderPass.call(this);

  // point light calculation
  this.pointLightProgram = gl.createProgram();
  this.pointLightShader = new Shader(this.pointLightProgram, 'shader/light/point.vert', 'shader/light/point.frag');
  gl.useProgram(this.pointLightProgram);
  this.pointLightShader.locateAttributes(this.pointLightProgram);
  this.pointLightShader.locateUniforms(this.pointLightProgram);

  // directional light calculation
  this.dirLightProgram = gl.createProgram();
  this.dirLightShader = new Shader(this.dirLightProgram, 'shader/light/directional.vert', 'shader/light/directional.frag');
  gl.useProgram(this.dirLightProgram);
  this.dirLightShader.locateAttributes(this.dirLightProgram);
  this.dirLightShader.locateUniforms(this.dirLightProgram);

  // null shader for stencil update
  this.stencilProgram = gl.createProgram();
  this.stencilShader = new Shader(this.stencilProgram, 'shader/stencil.vert', 'shader/stencil.frag');
  gl.useProgram(this.stencilProgram);
  this.stencilShader.locateAttributes(this.stencilProgram);
  this.stencilShader.locateUniforms(this.stencilProgram);
}
var p = LightPass.prototype = Object.create(RenderPass.prototype);

p.initBuffer = function(){
  this.diffuseTexture = this.createColorTexture(this.width, this.height);
  this.specularTexture = this.createColorTexture(this.width, this.height);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.diffuseTexture.glTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.specularTexture.glTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);

  gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1]);
}

p.render = function(){
  
}