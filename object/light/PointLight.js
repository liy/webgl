function PointLight(){
  PositionalLight.call(this);

  // TOOD: use attenuation to calculate the radius of the sphere
  // for now, just hardcode the radius
  this._geometry = new SphereGeometry();
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

    // color
    data.push(this.color[0])
    data.push(this.color[1])
    data.push(this.color[2])
    data.push(this.color[3])
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
  gl.vertexAttribPointer(attributes['a_Vertex'], 3, gl.FLOAT, false, 28, 0);
  gl.enableVertexAttribArray(attributes['a_Vertex']);
  // color
  gl.vertexAttribPointer(attributes['a_Color'], 4, gl.FLOAT, false, 28, 12);
  gl.enableVertexAttribArray(attributes['a_Color']);
}

p.setUniforms = function(uniforms){
  gl.uniformMatrix4fv(uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix4fv(uniforms['u_ModelMatrix'], false, this.worldMatrix);
}

// draw the light volume
p.draw = function(shader, camera){
  // setup uniform and attributes
  this.setAttributes(shader.attributes);
  this.setUniforms(shader.uniforms);


  // draw light volume
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  gl.drawElements(gl.TRIANGLES, this._geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}