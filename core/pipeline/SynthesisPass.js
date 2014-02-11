function SynthesisPass(renderer, w, h){
  RenderPass.call(this, renderer, w, h);

  this.program = gl.createProgram();
  this.shader = new Shader(this.program, 'shader/synthesis.vert', 'shader/synthesis.frag');
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);

  // this.skyBoxProgram = gl.createProgram();
  // this.skyBoxShader = new Shader(this.skyBoxProgram, 'shader/skybox.vert', 'shader/skybox.frag');
  // gl.useProgram(this.skyBoxProgram);
  // this.skyBoxShader.locateAttributes(this.skyBoxProgram);
  // this.skyBoxShader.locateUniforms(this.skyBoxProgram);

  renderer.compositeTarget = this.createColorTexture(this.width, this.height);

  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderer.compositeTarget.glTexture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, renderer.depthStencilRenderBuffer);

  this.createSynthesisBuffer();
}
var p = SynthesisPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  // draw to the default screen framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.width, this.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(this.program);

  // geometry targets
  renderer.albedoTarget.bind(gl.TEXTURE0);
  gl.uniform1i(this.shader.uniforms['albedoTarget'], 0);
  // renderer.normalTarget.bind(gl.TEXTURE0+1);
  // gl.uniform1i(this.shader.uniforms['normalTarget'], 1);
  // renderer.specularTarget.bind(gl.TEXTURE0+2)
  // gl.uniform1i(this.shader.uniforms['specularTarget'], 2);
  // renderer.depthTarget.bind(gl.TEXTURE0+3)
  // gl.uniform1i(this.shader.uniforms['depthTarget'], 3);

  // light targets
  renderer.diffuseLightTarget.bind(gl.TEXTURE0+4)
  gl.uniform1i(this.shader.uniforms['diffuseLightTarget'], 4);
  renderer.specularLightTarget.bind(gl.TEXTURE0+5)
  gl.uniform1i(this.shader.uniforms['specularLightTarget'], 5);

  gl.bindVertexArrayOES(this.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArrayOES(null);

  // draw sky box
  // this.drawSkyBox(scene, camera);
}

p.createSynthesisBuffer = function(){
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  // Screen attributes buffer
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1.0, -1.0,
                                                     1.0, -1.0,
                                                     1.0,  1.0,
                                                     1.0,  1.0,
                                                    -1.0,  1.0,
                                                    -1.0, -1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.shader.attributes.a_Vertex);
  gl.vertexAttribPointer(this.shader.attributes.a_Vertex, 2, gl.FLOAT, false, 0, 0);
  // texture coordinate buffer
  var tb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0,
                                                   1, 0,
                                                   1, 1,
                                                   1, 1,
                                                   0, 1,
                                                   0, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.shader.attributes.a_TexCoord);
  gl.vertexAttribPointer(this.shader.attributes.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArrayOES(null);
}


// TODO: find a better way to do the skybox
// p.drawSkyBox = function(scene, camera){
//   gl.useProgram(this.skyBoxProgram);

//   // gl.disable(gl.BLEND);
//   gl.enable(gl.DEPTH_TEST);
//   // sky box NDC.z is always 1, since w is always -e.z. Clip space z sign will be flipped: go into the screen will points to 1,
//   // come out from the screen points to -1. So it is LEQUAL. 
//   gl.depthFunc(gl.LEQUAL);

//   var len = scene.skyBoxes.length;
//   for(var i=0; i<len; ++i){
//     var skyBox = scene.skyBoxes[i];

//     camera.uploadUniforms(this.skyBoxShader);
//     skyBox.draw(this.skyBoxShader, camera);
//   }
//   gl.depthFunc(gl.LESS);
// }
