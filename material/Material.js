"use strict"
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

  this.u_CubeMapEnabled = 0;

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
  this.textureMap['cubeMap'] = new TextureCube();
  this.textureMap['cubeMap'].load(faces);
  this.u_CubeMapEnabled = 1;
}

p.setCubeTexture = function(cubeTexture){
  this.textureMap['cubeMap'] = cubeTexture;
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
      this.textureMap.albedo.bind(gl.TEXTURE0);
    }
    else
      this.textureMap.albedo.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+0);

  // specular
  if(this.textureMap.specular){
    if(this.textureMap.specular.ready){
      this.textureMap.specular.bind(gl.TEXTURE0+1);
    }
    else
      this.textureMap.specular.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+1);

  // normal
  if(this.textureMap.normal){
    if(this.textureMap.normal.ready){
      this.textureMap.normal.bind(gl.TEXTURE0+2);
    }
    else
      this.textureMap.normal.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+2);

  // roughness
  if(this.textureMap.roughness){
    if(this.textureMap.roughness.ready){
      this.textureMap.roughness.bind(gl.TEXTURE0+3);
    }
    else
      this.textureMap.roughness.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+3);

  // bump
  if(this.textureMap.bump){
    if(this.textureMap.bump.ready){
      shader.f('textureDeltaX', 1/this.textureMap.bump.width);
      shader.f('textureDeltaY', 1/this.textureMap.bump.height);
      this.textureMap.bump.bind(gl.TEXTURE0+4);
    }
    else
      this.textureMap.bump.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+4);

  // cube map
  if(this.textureMap.cubeMap){
    if(this.textureMap.cubeMap.ready){
      this.textureMap.cubeMap.bind(gl.TEXTURE0+5);
    }
    else
      this.textureMap.cubeMap.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+5);

  shader.i('albedoTexture', 0);
  shader.i('specularTexture', 1);
  shader.i('normalTexture', 2);
  shader.i('roughnessTexture', 3);
  shader.i('bumpTexture', 4);
  shader.i('cubeMapTexture', 5);

  shader.f('u_CubeMapEnabled', this.u_CubeMapEnabled);

  shader.fv3('ambientColor', this.ambientColor);
  shader.fv3('albedoColor', this.albedoColor);
  shader.fv3('specularColor', this.specularColor);
  shader.fv3('emissionColor', this.emissionColor);
  shader.f('roughness', this.roughness);
}

Material.id = 0;