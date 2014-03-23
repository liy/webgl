define(function(requirejs){

var RenderPass = require('core/pipeline/RenderPass');

"use strict"
var LightPass = function(params){
  RenderPass.call(this, params);
}
var p = LightPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  // draw to the default screen framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  gl.viewport(0, 0, this.width, this.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // light accumulation blend: add
  gl.enable(gl.BLEND);
  gl.blendEquation(gl.FUNC_ADD);
  gl.blendFunc(gl.ONE, gl.ONE);

  // enable stencil for stencil pass
  gl.enable(gl.STENCIL_TEST);

  var len = scene.positionalLights.length;
  for(var i=0; i<len; ++i){
    var light = scene.positionalLights[i];
    // Every light requires a clean stencil test.
    this.stencil(light, camera);
    this.pointLighting(light, camera);
  }

  // disable stencil test for directional lighting
  gl.disable(gl.STENCIL_TEST);
  // switch back to normal back face culling, for geometry rendering next frame
  gl.cullFace(gl.BACK)

  // directional light
  this.directionalLighting(scene, camera);

  // after light pass disable blend.
  gl.disable(gl.BLEND);
}

p.stencil = function(light, camera){
  gl.useProgram(this.stencilShader.program);

  // needs depth test to correctly increase stencil buffer
  gl.enable(gl.DEPTH_TEST);
  // needs both faces to correctly increase stencil buffer
  gl.disable(gl.CULL_FACE);
  // stencil buffer is refreshed for each light
  gl.clear(gl.STENCIL_BUFFER_BIT);
  // always write to stencil buffer in stencil stage.
  gl.stencilFunc(gl.ALWAYS, 0, 0);
  // increase and decrease the stencil according to the rule:
  // http://ogldev.atspace.co.uk/www/tutorial37/tutorial37.html
  gl.stencilOpSeparate(gl.BACK, gl.KEEP, gl.INCR_WRAP, gl.KEEP);
  gl.stencilOpSeparate(gl.FRONT, gl.KEEP, gl.DECR_WRAP, gl.KEEP);
  // only stencil write is needed, do not write to color buffer, save some processing power
  gl.colorMask(false, false, false, false);

  camera.uploadUniforms(this.stencilShader)
  light.lit(this.stencilShader, camera);
}

p.pointLighting = function(light, camera){
   // use point light program
  gl.useProgram(this.pointLightShader.program);

  // all light volumes need to be drawn
  gl.disable(gl.DEPTH_TEST);
  // alway cull front face and leave the back face of light volume for lighting.
  // Since once camera pass back face of the volume, it should not affecting anything in front of the camera.
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  // lighting effect will have none-zero stencil value.
  gl.stencilFunc(gl.NOTEQUAL, 0, 0xFF);
  // enable color drawing
  gl.colorMask(true, true, true, true);

  // bind the geometry targets
  this.import.albedoBuffer.bind(gl.TEXTURE0);
  this.import.normalBuffer.bind(gl.TEXTURE0+1);
  this.import.specularBuffer.bind(gl.TEXTURE0+2)
  this.depthBuffer.bind(gl.TEXTURE0+3)

  this.pointLightShader.i('albedoBuffer', 0);
  this.pointLightShader.i('normalBuffer', 1);
  this.pointLightShader.i('specularBuffer', 2);
  this.pointLightShader.i('depthBuffer', 3);

  camera.uploadUniforms(this.pointLightShader)
  light.lit(this.pointLightShader, camera);
}

p.directionalLighting = function(scene, camera){
  gl.useProgram(this.dirLightShader.program);

  camera.uploadUniforms(this.dirLightShader);

  var len = scene.directionalLights.length;
  for(var i=0; i<len; ++i){
    var light = scene.directionalLights[i];

    this.import.albedoBuffer.bind(gl.TEXTURE0);
    this.dirLightShader.i('albedoBuffer', 0);
    this.import.normalBuffer.bind(gl.TEXTURE0+1);
    this.dirLightShader.i('normalBuffer', 1);
    this.import.specularBuffer.bind(gl.TEXTURE0+2)
    this.dirLightShader.i('specularBuffer', 2);
    this.depthBuffer.bind(gl.TEXTURE0+3)
    this.dirLightShader.i('depthBuffer', 3);

    light.lit(this.dirLightShader, camera);
  }
}

return LightPass;

});