"use strict"
function ScreenPass(params){
  RenderPass.call(this, params);

  this.createScreenBuffer();
}
var p = ScreenPass.prototype = Object.create(RenderPass.prototype);

p.render = function(scene, camera){
  gl.useProgram(this.shader.program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, this.width, this.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.import.compositeBuffer.bind(gl.TEXTURE0);
  this.shader.i('compositeBuffer', 0);

  gl.bindVertexArrayOES(this.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArrayOES(null);
}

p.createScreenBuffer = function(){
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