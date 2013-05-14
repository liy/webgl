function ShadowMapTarget(renderer){
  RenderTarget.call(this, renderer);

  this.shader = new Shader(this.program, '../shader/shadow.vert', '../shader/shadow.frag');
}
var p = ShadowMapTarget.prototype = Object.create(RenderTarget.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttribute(this.program);
  this.shader.bindUniform(this.program);

  // gl.colorMask(false, false, false, false);
  var len = scene.lights.length;
  for(var i=0; i<len; ++i){

    // draw to the depth texture
    for(var j=0; j<scene.sortList.length; ++j){
      scene.sortList[j].draw(this.shader, scene.lights[i].shadowCamera);
    }
  }

  // gl.colorMask(true, true, true, true);

  // reset to default
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}