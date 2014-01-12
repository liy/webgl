function DepthPass(renderer){
  RenderPass.call(this, renderer);
  this.shader = new Shader(this.program, 'shader/depth.vert', 'shader/depth.frag');

  if(!this.renderer.depthTextureExt){
    console.log('do not support depth texture extension');
  }

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  // instead of the use RGBA format, we use DEPTH_COMPONENT format for depth texture
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.renderer.canvas.width, this.renderer.canvas.height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

  // although we do not need to draw a color into framebuffer, but seems like webgl force you to have a color texture attached.
  // However, we can disable the color writing, use colorMask(false, false, false, false)
  this.colorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.renderer.canvas.width, this.renderer.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.texture, 0);
}
var p = DepthPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.setUniforms(this.shader.uniforms);

  gl.colorMask(false, false, false, false);
  var len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    scene.meshes[i].draw(this.shader, camera);
  }
  gl.colorMask(true, true, true, true);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}