function ScreenPass(){
  RenderPass.call(this);

  this.program = gl.createProgram();
  this.shader = new Shader(this.program, 'shader/screen.vert', 'shader/screen.frag');
  gl.useProgram(this.program);
  this.shader.locateAttributes(this.program);
  this.shader.locateUniforms(this.program);

  this.createScreenBuffer();
}
var p = ScreenPass.prototype = Object.create(RenderPass.prototype)

p.render = function(){
  
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