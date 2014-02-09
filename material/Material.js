// TODO: FIXME: Match the uniform names? So I can easily traverse the object to expose uniform entry points?(Later for auto detect uniforms in GUI application)
function Material(){
  this.id = Material.id++;

  this.name = '';

  this.color = vec3.fromValues(1.0, 1.0, 1.0);
  this.ambientColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.albedoColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.specularColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.emissionColor = vec3.fromValues(0.0, 0.0, 0.0);
  // float
  this.roughness = 65;

  // stores the actual webgl texture object.
  this.textureMap = {};
}
var p = Material.prototype;

// TODO: Find a better way to setup textures
p.setTextureMap = function(map){
  for(var name in map){
    if(map[name]){
      var texture = this.textureMap[name] = new Texture2D();
      texture.name = name;
      texture.setParameters = function(texture){
        if(texture.name === 'albedo'){
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        texture.unbind();
      }
      texture.load(map[name]);
    }
  }
}

p.setCubeMap = function(faces){
  this.textureMap['cubeMap'] = new TextureCube(faces);
}

/**
  uniform sampler2D albedoTexture;
  uniform sampler2D specularTexture;
  uniform sampler2D normalTexture;
  uniform sampler2D roughnessTexture;
  uniform sampler2D depthTexture;
 */
// TODO: FIXME: find a better way to set the uniforms and bind the textures!!!
p.uploadUniforms = function(shader){
  // albedo
  if(this.textureMap.albedo){
    if(this.textureMap.albedo.ready){
      gl.uniform1i(shader.uniforms['albedoTexture'], 0);
      this.textureMap.albedo.bind(gl.TEXTURE0);
    }
    else
      this.textureMap.albedo.unbind();
  }

  // specular
  if(this.textureMap.specular){
    if(this.textureMap.specular.ready){
      gl.uniform1i(shader.uniforms['specularTexture'], 1);
      this.textureMap.specular.bind(gl.TEXTURE0+1);  
    }
    else
      this.textureMap.specular.unbind(); 
  }

  // normal
  if(this.textureMap.normal){
    if(this.textureMap.normal.ready){
      gl.uniform1i(shader.uniforms['normalTexture'], 2);
      this.textureMap.normal.bind(gl.TEXTURE0+2);  
    }
    else
      this.textureMap.normal.unbind();
  }

  // roughness
  if(this.textureMap.roughness){
    if(this.textureMap.roughness.ready){
      gl.uniform1i(shader.uniforms['roughnessTexture'], 3);
      this.textureMap.roughness.bind(gl.TEXTURE0+3);  
    }
    else
      this.textureMap.roughness.unbind();
  }

  // bump
  if(this.textureMap.bump){
    if(this.textureMap.bump.ready){
      gl.uniform1f(shader.uniforms['textureDeltaX'], 1/this.textureMap.bump.width);
      gl.uniform1f(shader.uniforms['textureDeltaY'], 1/this.textureMap.bump.height);
      gl.uniform1i(shader.uniforms['bumpTexture'], 4);
      this.textureMap.bump.bind(gl.TEXTURE0+4);  
    }
    else
      this.textureMap.bump.unbind();
  }

  // cube map
  if(this.textureMap.cubeMap){
    if(this.textureMap.cubeMap.ready){
      this.textureMap.cubeMap.bind(gl.TEXTURE0+5);
      gl.uniform1i(shader.uniforms['cubeMapTexture'], 5);  
    }
    else
      this.textureMap.cubeMap.unbind();
  }

  gl.uniform4fv(shader.uniforms['ambientColor'], this.ambientColor);
  gl.uniform4fv(shader.uniforms['albedoColor'], this.albedoColor);
  gl.uniform4fv(shader.uniforms['specularColor'], this.specularColor);
  gl.uniform4fv(shader.uniforms['emissionColor'], this.emissionColor);
  gl.uniform1f(shader.uniforms['roughness'], this.roughness);
}

Material.id = 0;