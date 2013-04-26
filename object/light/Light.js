// by default position directional light, from (1, 1, 1)
function Light(){
  Object3D.call(this);

  // vec4
  this.ambient = vec4.fromValues(0.25, 0.25, 0.25, 1.0);
  // vec4
  this.diffuse = vec4.fromValues(0.95, 0.95, 0.95, 1.0);
  // vec4
  this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec3, constant, linear and quadratic
  this.attenuation = vec3.fromValues(1, 0, 0);
  // vec3
  // if any of x, y, z are non-zero, it is spot light
  this.direction = vec3.create();
  this._transformedDirection = vec3.create();

  // internal spot fall off
  this._cosOuter = 0;
  this._cosInner = 0;
  this._outerRadian = 0;
  this._innerRadian = 0;

  this.outerRadian = Math.PI/9;
  this.innerRadian = Math.PI/10;

  // shadow map requires the view matrix from the light
  this._viewMatrix = mat4.create();

  this._modelViewMatrix = mat4.create();

  // if 0, then this light is a directional, if it 1, it is a point or spot light
  this.directional = 1;
}
var p = Light.prototype = Object.create(Object3D.prototype);

p.setUniform = function(uniform){
  this.updateMatrix();

  // calculate model view matrix
  mat4.mul(this._modelViewMatrix, camera.matrix, this.matrix);
  // console.log(this._modelViewMatrix);
  // transform direction to eye coordinate
  // ********** this is wrong!!!!!!!!!!!
  // vec3.transformMat4(this._transformedDirection, this.direction, this._modelViewMatrix);
  var directionMatrix = mat3.create();
  mat3.normalFromMat4(directionMatrix, this._modelViewMatrix);
  vec3.transformMat3(this._transformedDirection, this.direction, directionMatrix);





  // transform light position to eye coordinate
  // ************ this is correct
  this._trasnformedPosition = vec3.create();
  vec3.transformMat4(this._trasnformedPosition, [0, 0, 0], this._modelViewMatrix);


  // this._transformedDirection = this.direction;
  console.log(this._trasnformedPosition);

  gl.uniform4fv(uniform['u_Light.position'], [this._trasnformedPosition[0], this._trasnformedPosition[1], this._trasnformedPosition[2], this.directional]);
  gl.uniform4fv(uniform['u_Light.ambient'], this.ambient);
  gl.uniform4fv(uniform['u_Light.diffuse'], this.diffuse);
  gl.uniform4fv(uniform['u_Light.specular'], this.specular);
  gl.uniform3fv(uniform['u_Light.attenuation'], this.attenuation);
  gl.uniform3fv(uniform['u_Light.direction'], this._transformedDirection);
  gl.uniform1f(uniform['u_Light.cosOuter'], this._cosOuter);
  gl.uniform1f(uniform['u_Light.cosFalloff'], this._cosOuter - this._cosInner);
}

Object.defineProperty(p, "viewMatrix", {
  get: function(){
    this.updateMatrix();
    // apply the current transformation to the direction first.
    vec3.transformMat4(this._transformedDirection, this.direction, this.matrix);
    mat4.lookAt(this._viewMatrix, this.position, this._transformedDirection, [0, 1, 0]);
    return this._viewMatrix;
  }
});

Object.defineProperty(p, "outerRadian", {
  set: function(value){
    this._outerRadian = value;
    this._cosOuter = Math.cos(this._outerRadian);
  },
  get: function(){
    return this._outerRadian;
  }
});

Object.defineProperty(p, "innerRadian", {
  set: function(value){
    this._innerRadian = value;
    this._cosInner = Math.cos(this._innerRadian);
  },
  get: function(){
    return this._innerRadian;
  }
});