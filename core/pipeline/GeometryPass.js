function GeometryPass(params){
  RenderPass.call(this, params);
}
var p = GeometryPass.prototype = Object.create(RenderPass.prototype);


p.render = function(scene, camera){
  // enable depth buffer
  gl.depthMask(true);

  gl.useProgram(this.shader.program)
  // g-buffers render
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.width, this.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

  // cull face needs to be enabled during G-buffer filling
  gl.enable(gl.CULL_FACE);
  // depth test of course is needed
  gl.enable(gl.DEPTH_TEST);
  // TODO: disable blend for now for G-Buffer, future needs support transparency.
  gl.disable(gl.BLEND);

  // upload camera uniforms for geometry shader
  camera.uploadUniforms(this.shader);

  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    scene.meshes[i].draw(this.shader);
  }

  // now you have finished filling the G-Buffers, the depth information is recorded.
  // Other passes, such as lighting pass should only read the depth information.
  gl.depthMask(false);
}