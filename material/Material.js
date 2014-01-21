function Material(){
  this.id = Material.id++;

  this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
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

  // this.setImageMap(params.textureMap);
  // this.setTextureMap(params.textureMap);

  // stores the actual webgl texture object.
  this.textureMap = {};

  /*
  this.texture.albedo = null;
  this.texture.normal = null;
  this.texture.bump = null;
  this.texture.specular = null;
  this.texture.shininess = null;
  this.texture.roughness = null;
  this.texture.alpha = null;
  this.texture.displacement = null;
   */
}
var p = Material.prototype;

p.setImageMap = function(map){
  for(var name in map){
    if(map[name]){
      var texture = this.textureMap[name] = TextureManager.instance.add(map[name]);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
      
  }
  TextureManager.instance.load();
}

p.setTextureMap = function(map){
  for(var name in texture){
    this.textureMap[name] = map[name];
  }
}

p.bind = function(shader){
  gl.uniform1i(shader.uniforms['textures'][0], 0);
  TextureManager.instance.bindTexture(this.textureMap.albedo, 0);
  gl.uniform1i(shader.uniforms['textures'][1], 1);
  TextureManager.instance.bindTexture(this.textureMap.normal, 1);
  gl.uniform1i(shader.uniforms['textures'][2], 2);
  TextureManager.instance.bindTexture(this.textureMap.bump, 2);
  gl.uniform1i(shader.uniforms['textures'][3], 3);
  TextureManager.instance.bindTexture(this.textureMap.specular, 3);
  gl.uniform1i(shader.uniforms['textures'][4], 4);
  TextureManager.instance.bindTexture(this.textureMap.roughness, 4);
  gl.uniform1i(shader.uniforms['textures'][5], 5);
  TextureManager.instance.bindTexture(this.textureMap.shininess, 5);

  gl.uniform4fv(shader.uniforms['ambientColor'], this.ambientColor);
  gl.uniform4fv(shader.uniforms['albedoColor'], this.albedoColor);
  gl.uniform4fv(shader.uniforms['specularColor'], this.specularColor);
  gl.uniform4fv(shader.uniforms['emissionColor'], this.emissionColor);
  gl.uniform1f(shader.uniforms['roughness'], this.roughness); 
}

Material.id = 0;