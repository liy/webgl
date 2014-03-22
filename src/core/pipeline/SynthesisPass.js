define(function(requirejs){
"use strict"

var RenderPass = require('core/pipeline/RenderPass');
var Texture = require('texture/Texture');

// do light and albedo synthesis and draw sky box.
var SynthesisPass = function(params){
  RenderPass.call(this, params);

  this.createSynthesisBuffer();
}
var p = SynthesisPass.prototype = Object.create(RenderPass.prototype);


p.render = function(scene, camera){
  // draw to the default screen framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.viewport(0, 0, this.width, this.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(this.synthesisShader.program);

  // geometry targets
  this.import.albedoBuffer.bind(gl.TEXTURE0);
  // light targets
  this.import.diffuseLightBuffer.bind(gl.TEXTURE0+1);
  this.import.specularLightBuffer.bind(gl.TEXTURE0+2);

  // light probe debug
  if(this.import.lightProbeDebugBuffer)
    this.import.lightProbeDebugBuffer.bind(gl.TEXTURE0+3);
  else
    Texture.unbind(gl.TEXTURE0+3);

  this.synthesisShader.i('u_AlbedoBuffer', 0);
  this.synthesisShader.i('u_DiffuseLightBuffer', 1);
  this.synthesisShader.i('u_SpecularLightBuffer', 2);
  this.synthesisShader.i('u_LightProbeDebugBuffer', 3);

  gl.bindVertexArrayOES(this.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArrayOES(null);

  // draw sky box
  this.drawSkyBox(scene, camera);
}

p.drawSkyBox = function(scene, camera){
  gl.useProgram(this.skyBoxShader.program);

  // I think no need to disable blend, since depth test will discard any overlapping fragments
  // gl.disable(gl.BLEND);

  // The depth render buffer is untouched after geometry pass, we can use it to discard any sky box fragments behind the meshes.
  gl.enable(gl.DEPTH_TEST);
  // By default, depth buffer is cleared with value 1, which means the farthest position. Only the fragment depth less than 1 needs to be
  // drawn. However, in this case, sky box vertex depth will be mapped to 1(check vertex shader for detail). In order to draw the sky box, we have to allow
  // "equal" to pass the depth test.
  gl.depthFunc(gl.LEQUAL);

  var len = scene.skyBoxes.length;
  for(var i=0; i<len; ++i){
    var skyBox = scene.skyBoxes[i];

    camera.uploadUniforms(this.skyBoxShader);
    skyBox.draw(this.skyBoxShader, camera);
  }

  // back to default depth test function, only draw the fragment's depth less than value in the depth buffer.
  gl.depthFunc(gl.LESS);
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
  gl.enableVertexAttribArray(this.synthesisShader.attributes.a_Vertex);
  gl.vertexAttribPointer(this.synthesisShader.attributes.a_Vertex, 2, gl.FLOAT, false, 0, 0);
  // texture coordinate buffer
  var tb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0,
                                                   1, 0,
                                                   1, 1,
                                                   1, 1,
                                                   0, 1,
                                                   0, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.synthesisShader.attributes.a_TexCoord);
  gl.vertexAttribPointer(this.synthesisShader.attributes.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArrayOES(null);
}

return SynthesisPass;

});