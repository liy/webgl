function PointLight(radius){
  PositionalLight.call(this);

  this.radius = radius || 0.5;
  // TOOD: use attenuation to calculate the radius of the sphere
  // for now, just hardcode the radius
  this.geometry = new SphereGeometry(this.radius);

  // this.attenuation[0] = 1;
  // this.attenuation[1] = 2/this.radius;
  // this.attenuation[2] = 1/(this.radius*this.radius);

  this.createBuffer();
}
var p = PointLight.prototype = Object.create(PositionalLight.prototype);

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

p.setUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  // console.log(this.modelViewMatrix);

  // notice that the light's position is the eye space position, since it is more convenient to do light in eye space
  gl.uniform3fv(shader.uniforms['u_Light.position'], this._viewSpacePosition);
  gl.uniform1f(shader.uniforms['u_Light.intensity'], this.intensity);
  gl.uniform3fv(shader.uniforms['u_Light.color'], this.color);
  gl.uniform1i(shader.uniforms['u_Light.enabled'], this.enabled);
  gl.uniform1f(shader.uniforms['u_Light.radius'], this.radius);

  // console.log(this._viewSpacePosition);
}

// draw the light volume
p.draw = function(shader, camera){
  // Any better way to setup vertex array object? It needs shader attributes access...
  if(this.vao === undefined)
    this.createVertexArray(shader);
  this.setUniforms(shader);

  // use stencil buffer to handle situation camera is inside the light volume
  // 
  // if camera outside of the sphere cull back face; if the camera is inside the light geometry, cull front face
  // var distance = vec3.distance(this._position, camera._position);
  // // outside of the geometry, cull back face, back face is treated as CCW
  // if(distance > this.radius)
  //   gl.frontFace(gl.CCW);
  // else
  //   gl.frontFace(gl.CW);

  // draw light volume
  gl.bindVertexArrayOES(this.vao);
  gl.drawElements(gl.TRIANGLES, this.geometry.indexData.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArrayOES(null);
}