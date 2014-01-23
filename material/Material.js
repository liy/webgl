function Material(){
  this.id = Material.id++;

  this.name = '';

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
    }
  }
}

p.setTextureMap = function(map){
  for(var name in texture){
    this.textureMap[name] = map[name];
  }
}

p.bind = function(shader){
  // albedo
  if(this.textureMap.albedo && this.textureMap.albedo.data){
    gl.uniform1f(shader.uniforms['textureReady'][0], 1);
    gl.uniform1i(shader.uniforms['textures'][0], 0);
    TextureManager.instance.bindTexture(this.textureMap.albedo, gl.TEXTURE0);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][0], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0);
  }

  // normal
  if(this.textureMap.normal && this.textureMap.normal.data){
    gl.uniform1f(shader.uniforms['textureReady'][1], 1);
    gl.uniform1i(shader.uniforms['textures'][1], 1);
    TextureManager.instance.bindTexture(this.textureMap.normal, gl.TEXTURE0+1);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][1], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0+1);
  }

  // bump
  if(this.textureMap.bump && this.textureMap.bump.data){
    gl.uniform1f(shader.uniforms['textureReady'][2], 1);
    gl.uniform1i(shader.uniforms['textures'][2], 2);
    TextureManager.instance.bindTexture(this.textureMap.bump, gl.TEXTURE0+2);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][2], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0+2);
  }

  // specular
  if(this.textureMap.specular && this.textureMap.specular.data){
    gl.uniform1f(shader.uniforms['textureReady'][3], 1);
    gl.uniform1i(shader.uniforms['textures'][3], 3);
    TextureManager.instance.bindTexture(this.textureMap.specular, gl.TEXTURE0+3);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][3], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0+3);
  }

  // roughness
  if(this.textureMap.roughness && this.textureMap.roughness.data){
    gl.uniform1f(shader.uniforms['textureReady'][4], 1);
    gl.uniform1i(shader.uniforms['textures'][4], 4);
    TextureManager.instance.bindTexture(this.textureMap.roughness, gl.TEXTURE0+4);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][4], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0+4);
  }

  // shininess
  if(this.textureMap.shininess && this.textureMap.shininess.data){
    gl.uniform1f(shader.uniforms['textureReady'][5], 1);
    gl.uniform1i(shader.uniforms['textures'][5], 5);
    TextureManager.instance.bindTexture(this.textureMap.shininess, gl.TEXTURE0+5);
  }
  else{
    gl.uniform1f(shader.uniforms['textureReady'][5], 0);
    TextureManager.instance.unbindTexture(gl.TEXTURE0+5);
  }

  gl.uniform4fv(shader.uniforms['ambientColor'], this.ambientColor);
  gl.uniform4fv(shader.uniforms['albedoColor'], this.albedoColor);
  gl.uniform4fv(shader.uniforms['specularColor'], this.specularColor);
  gl.uniform4fv(shader.uniforms['emissionColor'], this.emissionColor);
  gl.uniform1f(shader.uniforms['roughness'], this.roughness);
}

Material.id = 0;