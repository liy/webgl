function ShadowMapTarget(renderer){
  RenderTarget.call(this, renderer);

  this.shader = new Shader(this.program, '../shader/shadow.vert', '../shader/shadow.frag');
}
var p = ShadowMapTarget.prototype = Object.create(RenderTarget.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.program);
  this.shader.bindAttribute(this.program);
  this.shader.bindUniform(this.program);

  // for some reason, the framebuffer requires a colorTexture. Better to disable color drawing, save some computation.
  gl.colorMask(false, false, false, false);

  var len = scene.lights.length;
  for(var i=0; i<len; ++i){
    if(!scene.lights[i].castShadow)
      continue;

    // bind the light's framebuffer, ready to draw to the texture
    gl.bindFramebuffer(gl.FRAMEBUFFER, scene.lights[i].framebuffer);
    gl.viewport(0, 0, scene.lights[i].framebufferSize, scene.lights[i].framebufferSize);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // use the light's camera to do the projection
    scene.lights[i].shadowCamera.project(this.shader);

    // draw all scene object to the depth texture
    for(var j=0; j<scene.sortList.length; ++j){
      // draw to shadow texture using light's camera as the view matrix.
      scene.sortList[j].draw(this.shader, scene.lights[i].shadowCamera);
    }
  }

  // reset fraembuffer to context fraembuffer, and re-enable color draw for scene drawing
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.colorMask(true, true, true, true);
}