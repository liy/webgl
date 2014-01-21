function TextureManager(){
  this.loaders = new Array();
  this.textureMap = Object.create(null);
  this.boundTextures = Object.create(null);

  this.textureID = 0;
}
var p = TextureManager.prototype;

p.add = function(data, key){
  var texture;
  if(data instanceof Array)
    texture = this.addTextureCube(data, key);
  else
    texture = this.addTexture2D(data, key);
  return texture;
}

// TODO: needs return opengl texture
p.addTexture2D = function(url, key){
  var texture = this.textureMap[key];
  if(!texture){
    texture = gl.createTexture();
    texture.id = this.textureID++;
    this.textureMap[key||texture.id] = texture;

    var loader = this._createLoader(url);
    this.loaders.push(loader);

    loader.onComplete = (function(loader, texture){
      return function(){
        gl.bindTexture(gl.TEXTURE_2D, texture);
        TextureManager.instance.setTextureData(loader, texture, gl.TEXTURE_2D);
      }
    }(loader, texture));

  }
  return texture;
}

p.addTextureCube = function(data, key){
  var texture = this.textureMap[key];
  if(!texture){
    texture = gl.createTexture();
    texture.id = this.textureID++;
    this.textureMap[key||texture.id] = texture;

    for(var i=0; i<data.length; ++i){
      var loader = this._createLoader(data[i][0]);
      this.loaders.push(loader);

      loader.onComplete = (function(loader, texture, target){
        return function(){
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
          TextureManager.instance.setTextureData(loader, texture, target);
        }
      }(loader, texture, data[i][1]));
    }
  }
  return texture;
}

p._createLoader = function(url){
  var index = url.lastIndexOf(".");
  var type = url.substring(index+1);
  switch(type.toLowerCase()){
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return new ImageLoader(url);
    case "tga":
      return new TGALoader(url);
    default:
      console.error("Unknown image type:", type);
      break;
  }
}

p.load = function(callback){
  var len = this.loaders.length;
  for(var i=0; i<len; ++i){

    this.loaders[i].load(function(loader){
      return function(){
        // load data to gpu
        loader.onComplete();

        if(--len==0){
          if(callback) callback();
        }
          
      }
    }(this.loaders[i]));

  }
}

p.setTextureData = function(loader, texture, target, generateMipmap){
  // texture is ready to use
  texture.ready = true;
  if(loader instanceof ImageLoader)
    gl.texImage2D(target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
  else if(loader instanceof TGALoader)
    gl.texImage2D(target, 0, gl.RGBA, loader.width, loader.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
}

p.bindTexture = function(key, unit, target){
  target = target || gl.TEXTURE_2D;
  unit = unit || gl.TEXTURE0;

  if(!key)
    return false;

  if(key instanceof Object)
    key = key.id;

  var texture = this.textureMap[key];
  if(!texture)
    return false;

  if(this.boundTextures[unit] !== texture || this.boundTextures[unit] === undefined){
    gl.activeTexture(unit);
    gl.bindTexture(target, texture);
    this.boundTextures[unit] = texture;

    // console.log('bind: ', texture, unit);
  }
  else{
    // console.log('bound: ', texture, unit);
  }

  return true;
}

p.unbindTexture = function(key, unit, target){
  target = target || gl.TEXTURE_2D;
  unit = unit || gl.TEXTURE0;

  console.log('unbind: ' + unit);

  gl.activeTexture(unit);
  gl.bindTexture(target, null);
  this.boundTextures[unit] = undefined;
}

p.clear = function(){
  this.loaders.length = 0;
  this.textureMap = Object.create(null);
  this.boundTextures = Object.create(null);
}

TextureManager.instance = new TextureManager();