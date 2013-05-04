function Renderer(){
  this.shadowProgram = gl.createProgram();
  this.shadowShader = new Shader(this.shadowProgram, 'shader/shadow.vert', 'shader/shadow.frag');

  this.phongProgram = gl.createProgram();
  this.phongShader = new Shader(this.phongProgram, 'shader/phong.vert', 'shader/phong.frag');
}
var p = Renderer.prototype;

// TODO: remove shader from the parameter
p.render = function(scene, camera){
  var len = scene.children.length;
  var i;
  for(i=0; i<len; ++i){
    // update all objects, to world space.
    scene.children[i].updateMatrix();
  }

  // TODO: sort the list first.
  scene.sort();

  // TODO: draw shadow, etc.
  gl.useProgram(this.shadowProgram);
  shadowShader.bindAttribute(this.shadowProgram);
  shadowShader.bindUniform(this.shadowProgram);
  // draw shadows
  len = scene.lights.length;
  for(i=0; i<len; ++i){
    scene.lights[i].shadow(shadowShader);
  }

  // render final scene
  gl.useProgram(this.phongProgram);
  phongShader.bindAttribute(this.phongProgram);
  phongShader.bindUniform(this.phongProgram);
  // draw to canvas context
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  len = scene.sortList.length;
  for(i=0; i<len; ++i){
    scene.sortList[i].render(phongShader, camera);
  }
}