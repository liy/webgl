function PointLight(radius){
  Light.call(this);

  this.radius = radius || 0.5;
  // TOOD: use attenuation to calculate the radius of the sphere
  // for now, just hardcode the radius
  this.geometry = new SphereGeometry(this.radius);

  this.createBuffer();
}
var p = PointLight.prototype = Object.create(Light.prototype);

p.createBuffer = function(){
  // vertices information
  var data = [];
  for(var i=0; i<this.geometry.vertices.length; ++i){
    // vertex
    var v = this.geometry.vertices[i];
    data.push(v.x);
    data.push(v.y);
    data.push(v.z);
  }

  // vertex buffer
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // index information
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexData), gl.STATIC_DRAW);
}

p.createVertexArray = function(shader){
  // vertex array buffer object, needs extension support! For simplify the attribute binding
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  // vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.enableVertexAttribArray(shader.attributes['a_Vertex']);
  gl.vertexAttribPointer(shader.attributes['a_Vertex'], 3, gl.FLOAT, false, 12, 0);
  

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.bindVertexArrayOES(null);
}

p.uploadUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix.m);

  // notice that the light's position is the eye space position, since it is more convenient to do light in eye space
  gl.uniform3fv(shader.uniforms['u_Light.position'], this._viewSpacePosition.getData());
  gl.uniform1f(shader.uniforms['u_Light.intensity'], this.intensity);
  gl.uniform3fv(shader.uniforms['u_Light.color'], this.color.getData());
  gl.uniform1i(shader.uniforms['u_Light.enabled'], this.enabled);
  gl.uniform1f(shader.uniforms['u_Light.radius'], this.radius);
}

// draw the light volume
p.lit = function(shader, camera){
  // Any better way to setup vertex array object? It needs shader attributes access...
  if(this.vao === undefined)
    this.createVertexArray(shader);

  this.uploadUniforms(shader);

  // draw light volume
  gl.bindVertexArrayOES(this.vao);
  gl.drawElements(gl.TRIANGLES, this.geometry.indexData.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArrayOES(null);
}