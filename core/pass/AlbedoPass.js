function AlbedoPass(renderer){
  RenderPass.call(this, renderer);

  this.shader = new Shader(this.program, 'shader/albedo.vert', 'shader/albedo.frag');

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.renderer.canvas.width, this.renderer.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  // depth buffer to record z depth information for depth testing.
  this.depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.renderer.canvas.width, this.renderer.canvas.height);

  // create off-screen framebuffer for drawing normal information
  this.framebuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
}
var p = AlbedoPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttribute(this.program);
  this.shader.bindUniform(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.viewport(0, 0, this.renderer.canvas.width, this.renderer.canvas.height);
  gl.clearColor(0.2, 0.2, 0.2, 0.2);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.project(this.shader);

  var len = scene.sortList.length;
  for(var i=0; i<len; ++i){
    scene.sortList[i].draw(this.shader, camera);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
}