define(function(require){

var Texture = require('texture/Texture');
var Texture2D = require('texture/Texture2D');

"use strict"
// TODO: FIXME: Match the uniform names? So I can easily traverse the object to expose uniform entry points?(Later for auto detect uniforms in GUI application)
var Material = function(){
  this.id = Material.id++;

  this.name = '';

  this.color = vec3.fromValues(1.0, 1.0, 1.0);
  this.ambientColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.albedoColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.specularColor = vec3.fromValues(1.0, 1.0, 1.0);
  this.emissionColor = vec3.fromValues(0.0, 0.0, 0.0);
  this.roughness = 65;

  // stores the actual webgl texture object.
  this.textures = {};
}
var p = Material.prototype;

// TODO: Find a better way to setup textures
p.setResources = function(resources){
  for(var name in resources){
    if(resources[name]){
      var texture = this.textures[name] = new Texture2D();
      texture.name = name;
      texture.setParameters = function(texture){
        if(texture.name === 'albedo'){
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
          gl.generateMipmap(gl.TEXTURE_2D);
        }
        texture.unbind();

        console.log('set param', texture)
      };
      texture.init(resources[name]);
    }

  }
}

p.uploadUniforms = function(shader){
  // albedo
  if(this.textures.albedo){
    if(this.textures.albedo.complete){
      this.textures.albedo.bind(gl.TEXTURE0);
    }
    else
      this.textures.albedo.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+0);

  // specular
  if(this.textures.specular){
    if(this.textures.specular.complete){
      this.textures.specular.bind(gl.TEXTURE0+1);
    }
    else
      this.textures.specular.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+1);

  // normal
  if(this.textures.normal){
    if(this.textures.normal.complete){
      this.textures.normal.bind(gl.TEXTURE0+2);
    }
    else
      this.textures.normal.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+2);

  // roughness
  if(this.textures.roughness){
    if(this.textures.roughness.complete){
      this.textures.roughness.bind(gl.TEXTURE0+3);
    }
    else
      this.textures.roughness.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+3);

  // bump
  if(this.textures.bump){
    if(this.textures.bump.complete){
      shader.f('u_TextureDeltaX', 1/this.textures.bump.width);
      shader.f('u_TextureDeltaY', 1/this.textures.bump.height);
      this.textures.bump.bind(gl.TEXTURE0+4);
    }
    else
      this.textures.bump.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+4);

  // cube map
  if(this.textures.cubeMap){
    if(this.textures.cubeMap.complete){
      this.textures.cubeMap.bind(gl.TEXTURE0+5);
    }
    else
      this.textures.cubeMap.unbind();
  }
  else
    Texture.unbind(gl.TEXTURE0+5);

  shader.i('u_AlbedoTexture', 0);
  shader.i('u_SpecularTexture', 1);
  shader.i('u_NormalTexture', 2);
  shader.i('u_RoughnessTexture', 3);
  shader.i('u_BumpTexture', 4);
  shader.i('u_CubeMapTexture', 5);

  shader.fv3('u_AmbientColor', this.ambientColor);
  shader.fv3('u_AlbedoColor', this.albedoColor);
  shader.fv3('u_SpecularColor', this.specularColor);
  shader.fv3('u_EmissionColor', this.emissionColor);
  shader.f('u_Roughness', this.roughness);
}

Material.id = 0;

return Material;
});