(function(window){
function LambertianMaterial(){
  // vec4
  this.ambient = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.diffuse = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.emission = vec4.fromValues(0.3, 0.3, 0.3, 1.0);
  // float
  this.shininess = 65;
}
var p = LambertianMaterial.prototype;

p.setUniforms = function(uniform){
  gl.uniform4fv(uniform['u_Material.ambient'], this.ambient);
  gl.uniform4fv(uniform['u_Material.diffuse'], this.diffuse);
  gl.uniform4fv(uniform['u_Material.specular'], this.specular);
  gl.uniform4fv(uniform['u_Material.emission'], this.emission);
  gl.uniform1f(uniform['u_Material.shininess'], this.shininess);
}

window.LambertianMaterial = LambertianMaterial;
})(window);