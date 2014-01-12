function Composition(renderer){
  RenderPass.call(this, renderer);

  this.shader = new Shader(this.program, './shader/composition.vert', './shader/composition.frag');

  // For computing eye-space coordinate from clip-space coordinate. Also provide necessary values for eye-space z value calculation.
  this.invProjectionMatrix = mat4.create();

  // vertices, texture coordinate
  this.data = [
    -1.0, -1.0, 0.0, 0.0,
     1.0, -1.0, 1.0, 0.0,
    -1.0,  1.0, 0.0, 1.0,
     1.0,  1.0, 1.0, 1.0
  ];
  this.vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.STATIC_DRAW);

  window.addEventListener('resize', bind(this, this.resize));
}
var p = Composition.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // bind different textures
  var passes = this.renderer.passes;
  var len = passes.length;
  for(var i=0; i<len; ++i){
    gl.activeTexture(gl.TEXTURE0 + (i+1));
    gl.bindTexture(gl.TEXTURE_2D, passes[i].texture);
    gl.uniform1i(this.shader.uniforms['u_Sampler'][i], i+1);
  }

  // setup scene camera's projection matrix, needed for calculating eye-space Z value.
  camera.setUniforms(this.shader.uniforms);
  // inverse of the projection matrix
  mat4.invert(this.invProjectionMatrix, camera.projectionMatrix);
  gl.uniformMatrix4fv(this.shader.uniforms['u_InvProjectionMatrix'], false, this.invProjectionMatrix);

  // draw
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.vertexAttribPointer(this.shader.attributes['a_Vertex'], 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(this.shader.attributes['a_Vertex']);
  gl.vertexAttribPointer(this.shader.attributes['a_TexCoord'], 2, gl.FLOAT, false, 16, 8);
  gl.enableVertexAttribArray(this.shader.attributes['a_TexCoord']);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}