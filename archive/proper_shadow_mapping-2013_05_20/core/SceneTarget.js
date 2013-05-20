function SceneTarget(renderer){
  RenderTarget.call(this, renderer);

  this.shader = new Shader(this.program, './shader/phong.vert', './shader/phong.frag');
}
var p = SceneTarget.prototype = Object.create(RenderTarget.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttribute(this.program);
  this.shader.bindUniform(this.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, window.innerWidth, window.innerHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.project(this.shader);

  // light up the scene
  var len;
  len = scene.lights.length;
  for(var i=0; i<len; ++i){

    // bind depth texture
    scene.lights[i].shadowMapping(this.shader, i);


    scene.lights[i].lit(this.shader, camera);
  }

  // draw the scene
  len = scene.sortList.length;
  for(var i=0; i<len; ++i){
    scene.sortList[i].draw(this.shader, camera);
  }
}