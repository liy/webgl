function PointLight(radius){
  PositionalLight.call(this);

  this.radius = radius || 0.5;
  // TOOD: use attenuation to calculate the radius of the sphere
  // for now, just hardcode the radius
  this._geometry = new SphereGeometry(this.radius);
  this.createBuffer();
}
var p = PointLight.prototype = Object.create(PositionalLight.prototype);

p.createBuffer = function(){
  // vertices information
  var data = [];
  for(var i=0; i<this._geometry.numVertices; ++i){
    // vertex
    data.push(this._geometry.vertices[i*3]);
    data.push(this._geometry.vertices[i*3+1]);
    data.push(this._geometry.vertices[i*3+2]);
  }

  // vertex buffer
  this.vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

  // index information
  this.ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._geometry.indices), gl.STATIC_DRAW);
}

p.setAttributes = function(attributes){
  // vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);

  // always have a vertex array
  gl.vertexAttribPointer(attributes['a_Vertex'], 3, gl.FLOAT, false, 12, 0);
  gl.enableVertexAttribArray(attributes['a_Vertex']);
}

p.setUniforms = function(uniforms){
  gl.uniformMatrix4fv(uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix4fv(uniforms['u_ModelMatrix'], false, this.worldMatrix);

  this.color = [0, 0, 1];
  // notice that the light's position is the eye space position, since it is more convenient to do light in eye space
  gl.uniform3fv(uniforms['u_Light.position'], this._eyeSpacePosition);
  gl.uniform1f(uniforms['u_Light.intensity'], this.intensity);
  gl.uniform3fv(uniforms['u_Light.color'], this.color);
  gl.uniform3fv(uniforms['u_Light.attenuation'], this.attenuation);
  gl.uniform1i(uniforms['u_Light.enabled'], this.enabled);
  gl.uniform1f(uniforms['u_Light.radius'], this.radius);
}

// draw the light volume
p.draw = function(shader, camera){
  // setup uniform and attributes
  this.setAttributes(shader.attributes);
  this.setUniforms(shader.uniforms);

  // if camera outside of the sphere cull back face; if the camera is inside the light geometry, cull front face
  var distance = vec3.distance(this._position, camera._position);
  // outside of the geometry, cull back face, back face is treated as CCW
  if(distance > this.radius)
    gl.frontFace(gl.CCW);
  else
    gl.frontFace(gl.CW);
  gl.enable(gl.CULL_FACE);

  // draw light volume
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this._geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}