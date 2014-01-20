function BRDFMaterial(params){
  Material.call(this);

  // vec4
  this.ambientColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.albedoColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.specularColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec4
  this.emissionColor = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
  // float
  this.roughness = 65;

  // image texture map
  this.ambientTexture = null;
  this.albedoTexture = null;
  this.specularTexture = null;
  this.roughnessTexture = null;

  // set parameters
  for(var key in params){
    this[key] = params[key];
  }
}
var p = BRDFMaterial.prototype = Object.create(Material.prototype);

p.updateUniforms = function(shader){
  // gl.uniform4fv(shader.uniforms['u_Material.ambientColor'], this.ambientColor);
  // gl.uniform4fv(shader.uniforms['u_Material.albedoColor'], this.albedoColor);
  // gl.uniform4fv(shader.uniforms['u_Material.specularColor'], this.specularColor);
  // gl.uniform4fv(shader.uniforms['u_Material.emissionColor'], this.emissionColor);
  // gl.uniform1f(shader.uniforms['u_Material.roughness'], this.roughness);

  // gl.uniform1i(shader.uniforms['u_Material.albedoTexture'], 0);

  gl.uniform4fv(shader.uniforms['ambientColor'], this.ambientColor);
  gl.uniform4fv(shader.uniforms['albedoColor'], this.albedoColor);
  gl.uniform4fv(shader.uniforms['specularColor'], this.specularColor);
  gl.uniform4fv(shader.uniforms['emissionColor'], this.emissionColor);
  gl.uniform1f(shader.uniforms['roughness'], this.roughness);

  gl.uniform1i(shader.uniforms['albedoTexture'], 0);
}