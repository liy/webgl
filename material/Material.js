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
      var texture = this.textureMap[name] = new Texture(gl.TEXTURE_2D, gl.createTexture());
      texture.name = name;
      texture.setParameters = function(texture){
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if(texture.name === 'albedo'){
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        else
          gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      }
      
      texture.load(map[name]);
    }
  }
}

p.setTextureMap = function(map){
  for(var name in texture){
    this.textureMap[name] = map[name];
  }
}

/**
  uniform sampler2D albedoTexture;
  uniform sampler2D specularTexture;
  uniform sampler2D normalTexture;
  uniform sampler2D roughnessTexture;
  uniform sampler2D depthTexture;
 */
p.bind = function(shader){
  // albedo
  if(this.textureMap.albedo && this.textureMap.albedo.data){
    gl.uniform1i(shader.uniforms['albedoTexture'], 0);
    this.textureMap.albedo.bind(gl.TEXTURE0);
  }
  else{
    TextureManager.instance.unbindTexture(gl.TEXTURE0);
  }

  // specular
  if(this.textureMap.specular && this.textureMap.specular.data){
    gl.uniform1i(shader.uniforms['specularTexture'], 1);
    this.textureMap.specular.bind(gl.TEXTURE0+1);
  }
  else{
    TextureManager.instance.unbindTexture(gl.TEXTURE0+1);
  }

  // normal
  if(this.textureMap.normal && this.textureMap.normal.data){
    gl.uniform1i(shader.uniforms['normalTexture'], 2);
    this.textureMap.normal.bind(gl.TEXTURE0+2);
  }
  else{
    TextureManager.instance.unbindTexture(gl.TEXTURE0+2);
  }

  // roughness
  if(this.textureMap.roughness && this.textureMap.roughness.data){
    gl.uniform1i(shader.uniforms['roughnessTexture'], 3);
    this.textureMap.roughness.bind(gl.TEXTURE0+3);
  }
  else{
    TextureManager.instance.unbindTexture(gl.TEXTURE0+3);
  }

    // bump
  if(this.textureMap.bump && this.textureMap.bump.data){
    gl.uniform1f(shader.uniforms['textureDeltaX'], 1/this.textureMap.bump.width);
    gl.uniform1f(shader.uniforms['textureDeltaY'], 1/this.textureMap.bump.height);
    gl.uniform1i(shader.uniforms['bumpTexture'], 4);
    this.textureMap.bump.bind(gl.TEXTURE0+4);
  }
  else{
    TextureManager.instance.unbindTexture(gl.TEXTURE0+4);
  }

  gl.uniform4fv(shader.uniforms['ambientColor'], this.ambientColor);
  gl.uniform4fv(shader.uniforms['albedoColor'], this.albedoColor);
  gl.uniform4fv(shader.uniforms['specularColor'], this.specularColor);
  gl.uniform4fv(shader.uniforms['emissionColor'], this.emissionColor);
  gl.uniform1f(shader.uniforms['roughness'], this.roughness);
}

Material.id = 0;