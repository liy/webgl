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
}
var p = Light.prototype = Object.create(Object3D.prototype);

p.setUniform = function(uniform){
  gl.uniform4fv(uniform['u_Light.position'], [this.position[0], this.position[1], this.position[2], 1]);
  gl.uniform4fv(uniform['u_Light.ambient'], this.ambient);
  gl.uniform4fv(uniform['u_Light.diffuse'], this.diffuse);
  gl.uniform4fv(uniform['u_Light.specular'], this.specular);
  gl.uniform3fv(uniform['u_Light.attenuation'], this.attenuation);
  gl.uniform3fv(uniform['u_Light.direction'], this.direction);
}