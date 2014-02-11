function DirectionalLight(){
  Light.call(this);

  this.direction = vec3.create();

  this.createBuffer();
}
var p = DirectionalLight.prototype = Object.create(Light.prototype);

p.createBuffer = function(){
  var data = [
    -1.0, -1.0, 0, 0,
     1.0, -1.0, 1, 0,
     1.0,  1.0, 1, 1,
     1.0,  1.0, 1, 1,
    -1.0,  1.0, 0, 1,
    -1.0, -1.0, 0, 0
  ];

  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

p.createVertexArray = function(shader){
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  // vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.enableVertexAttribArray(shader.attributes['a_Vertex']);
  gl.vertexAttribPointer(shader.attributes['a_Vertex'], 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(shader.attributes['a_TexCoord']);
  gl.vertexAttribPointer(shader.attributes['a_TexCoord'], 2, gl.FLOAT, false, 16, 8);

  gl.bindVertexArrayOES(null);
}

p.uploadUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);

  // notice that the light's position is the eye space position, since it is more convenient to do light in eye space
  gl.uniform3fv(shader.uniforms['u_Light.direction'], this.direction);
  gl.uniform3fv(shader.uniforms['u_Light.color'], this.color);
  gl.uniform1i(shader.uniforms['u_Light.enabled'], this.enabled);

  // console.log(this._viewSpacePosition);
}

// draw the light volume
p.lit = function(shader, camera){
  // Any better way to setup vertex array object? It needs shader attributes access...
  if(this.vao === undefined)
    this.createVertexArray(shader);


  var origin = vec3.fromValues(0,0,0);
  vec3.transformMat4(origin, origin, camera.viewMatrix);
  vec3.transformMat4(this._viewSpacePosition, this._position, camera.viewMatrix);
  vec3.sub(this.direction, this._viewSpacePosition, origin);


  this.uploadUniforms(shader);

  // draw light volume
  gl.bindVertexArrayOES(this.vao);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  gl.bindVertexArrayOES(null);
}