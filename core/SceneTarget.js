function SceneTarget(renderer){
  RenderTarget.call(this, renderer);

  this.shader = new Shader(this.program, '../shader/phong.vert', '../shader/phong.frag');
}
var p = SceneTarget.prototype = Object.create(RenderTarget.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttribute(this.program);
  this.shader.bindUniform(this.program);

  gl.viewport(0, 0, window.innerWidth, window.innerHeight);

  gl.clear(this.bits);

  camera.projection(this.shader.uniform);

  // light up the scene
  var len;
  len = scene.lights.length;
  for(var i=0; i<len; ++i){
    // bind depth texture
    gl.activeTexture(gl.TEXTURE1);
    gl.uniform1i(this.shader.uniform['u_ShadowMap'], 1);
    gl.bindTexture(gl.TEXTURE_2D, scene.lights[i].depthTexture);

    gl.activeTexture(gl.TEXTURE0);

    scene.lights[i].lit(this.shader, camera);
  }

  // draw the scene
  len = scene.sortList.length;
  for(var i=0; i<len; ++i){
    scene.sortList[i].draw(this.shader, camera);
  }
}