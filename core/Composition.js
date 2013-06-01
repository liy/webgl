function Composition(renderer){
  RenderPass.call(this, renderer);

  this.shader = new Shader(this.program, './shader/composition.vert', './shader/composition.frag');

  this.camera = new OrthoCamera(0, window.innerWidth, window.innerHeight, 0);
  this.plane = new Mesh(new PlaneGeometry(window.innerWidth, window.innerHeight), new PhongMaterial());
  this.plane.x = window.innerWidth/2;
  this.plane.y = window.innerHeight/2;
  this.plane.z = -1;

  this.invertProjectionMatrix = mat4.create();

  window.addEventListener('resize', bind(this, this.resize));
}
var p = Composition.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttributes(this.program);
  this.shader.bindUniforms(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.setUniforms(this.shader.uniforms);

  var passes = this.renderer.passes;
  var len = passes.length;
  // bind different textures
  for(var i=0; i<len; ++i){
    gl.activeTexture(gl.TEXTURE0 + (i+1));
    gl.bindTexture(gl.TEXTURE_2D, passes[i].texture);
    gl.uniform1i(this.shader.uniforms['u_Sampler'][i], i+1);
  }

  this.plane.updateMatrix();
  mat4.mul(this.plane.modelViewMatrix, this.camera.worldMatrix, this.plane.worldMatrix);

  this.plane.draw(this.shader, this.camera);
}