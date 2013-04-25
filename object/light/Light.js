// by default position directional light, from (1, 1, 1)
function Light(){
  Object3D.call(this);

  // vec4
  this.ambient = vec4.fromValues(0.05, 0.05, 0.05, 1.0);
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
  // float
  // this._cosOuter = Math.cos(Math.PI/9);
  // float, outer cos - inner cos
  // this._cosFalloff = this._cosOuter - Math.cos(Math.PI/10);

  this.outerRadian = Math.PI/9;
  this.innerRadian = 0;

  // shadow map requires the view matrix from the light
  this._viewMatrix = mat4.create();

  // if 0, then this light is a directional, if it 1, it is a point or spot light
  this.directional = 1;
}
var p = Light.prototype = Object.create(Object3D.prototype);

p.setUniform = function(uniform){
  this.updateMatrix();

  vec3.transformMat4(this._transformedDirection, this.direction, this.matrix);

  gl.uniform4fv(uniform['u_Light.position'], [this.position[0], this.position[1], this.position[2], this.directional]);
  gl.uniform4fv(uniform['u_Light.ambient'], this.ambient);
  gl.uniform4fv(uniform['u_Light.diffuse'], this.diffuse);
  gl.uniform4fv(uniform['u_Light.specular'], this.specular);
  gl.uniform3fv(uniform['u_Light.attenuation'], this.attenuation);
  gl.uniform3fv(uniform['u_Light.direction'], this._transformedDirection);
  gl.uniform1f(uniform['u_Light.cosOuter'], Math.cos(this.outerRadian));
  gl.uniform1f(uniform['u_Light.cosFalloff'], Math.cos(this.outerRadian) - Math.cos(this.innerRadian));

  // TODO: may be ensure the matrix is the transpose inverse of the transformation matrix? Just in case, the matrix has scale transformation.
  // Of course, the scale transformation does not make sense to the light.
  // gl.uniformMatrix4fv(uniform['u_LightDirectionMatrix'], false, this.matrix);
}

Object.defineProperty(p, "viewMatrix", {
  get: function(){
    mat4.lookAt(this._viewMatrix, this.position, this.direction, [0, 1, 0]);
    return this._viewMatrix;
  }
});