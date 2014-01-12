function PositionalLightPass(renderer){
  RenderPass.call(this, renderer);

  this.shader = new Shader(this.program, 'shader/positional_light.vert', 'shader/positional_light.frag');

  // For computing eye-space coordinate from clip-space coordinate. Also provide necessary values for eye-space z value calculation.
  this.invProjectionMatrix = mat4.create();

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.renderer.canvas.width, this.renderer.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  // create off-screen framebuffer for drawing normal information
  this.framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderer.depthBuffer);
}
var p = PositionalLightPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);



  // gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  // bind different textures
  var passes = this.renderer.passes;
  var len = passes.length-1;
  for(var i=0; i<len; ++i){
    gl.activeTexture(gl.TEXTURE0 + (i+1));
    gl.bindTexture(gl.TEXTURE_2D, passes[i].texture);
    gl.uniform1i(this.shader.uniforms['u_Sampler'][i], i+1);
  }

  // set the resolution
  gl.uniform2fv(this.shader.uniforms['u_Viewport'], [this.renderer.canvas.width, this.renderer.canvas.height]);

  // setup scene camera's projection matrix, needed for calculating eye-space Z value.
  camera.setUniforms(this.shader.uniforms);
  // inverse of the projection matrix
  mat4.invert(this.invProjectionMatrix, camera.projectionMatrix);
  gl.uniformMatrix4fv(this.shader.uniforms['u_InvProjectionMatrix'], false, this.invProjectionMatrix);

  var len = scene.lights.length;
  for(var i=0; i<len; ++i){
    // only draw the positional light bounding box
    if(scene.lights[i] instanceof PositionalLight)
      scene.lights[i].draw(this.shader, camera);
  }

  // reset front face cull to be normal CCW front face cull
  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.disable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
}