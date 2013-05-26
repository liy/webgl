function ScreenPass(renderer){
  RenderPass.call(this, renderer);

  this.shader = new Shader(this.program, './shader/scene.vert', './shader/scene.frag');
}
var p = ScreenPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttributes(this.program);
  this.shader.bindUniforms(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.setUniforms(this.shader.uniforms);

  // light up the scene
  var len;
  len = scene.lights.length;
  for(var i=0; i<len; ++i){

    // bind depth texture
    scene.lights[i].shadowMapping(this.shader, i);


    scene.lights[i].lit(this.shader, camera);
  }

  // draw the scene
  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    scene.meshes[i].draw(this.shader, camera);
  }
}