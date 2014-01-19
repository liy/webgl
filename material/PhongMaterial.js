function PhongMaterial(params){
  Material.call(this);

  // vec4
  this.ambient = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.diffuse = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.emission = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
  // float
  this.shininess = 65;

  // image texture map
  this.texture = null

  // set parameters
  for(var key in params){
    this[key] = params[key];
  }
}
var p = PhongMaterial.prototype = Object.create(Material.prototype);

p.updateUniforms = function(shader){
  gl.uniform4fv(shader.uniforms['u_Material.ambient'], this.ambient);
  gl.uniform4fv(shader.uniforms['u_Material.diffuse'], this.diffuse);
  gl.uniform4fv(shader.uniforms['u_Material.specular'], this.specular);
  gl.uniform4fv(shader.uniforms['u_Material.emission'], this.emission);
  gl.uniform1f(shader.uniforms['u_Material.shininess'], this.shininess);
}