/**
 * [CubeLoader description]
 * @param {[type]} loaders posx, negx, posy, negy, posz, negz.
 */
function CubeLoader(loaders){
// var faces = [["posx.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
//              ["negx.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
//              ["posy.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
//              ["negy.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
//              ["posz.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
//              ["negz.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];

  this.loaders = loaders;
}

CubeLoader.prototype.load = function(callback){
  var toLoad = this.loaders.length;
  var onload = function(){
    --toLoad;
    if(toLoad === 0)
      callback();
  }

  for(var i=0; i<this.loaders.length; ++i){
    this.loaders[i].load(onload);
  }
}

function TextureManager(){
  this.loaders = new Array();
  this.textureMap = Object.create(null);
  this.loaderMap = Object.create(null);

  this.boundTextureMap = new Array();
}
var p = TextureManager.prototype;

// TODO: needs return opengl texture
p.addTexture2D = function(texture, url, key){
  if(!this.textureMap[key]){
    var loader = this._createLoader(url);
    this.loaders.push(loader);
    loaderMap[key] = loader;
    this.textureMap[key] = texture;
  }
  return this.textureMap[key];
}

p.addTextureCube = function(texture, urls, key){
  if(!this.textureMap[key]){
    var loaders = [];
    for(var i=0; i<urls.length; ++i){
      var loader = this._createLoader(url);
      loaders.push(loader);
    }
    var cubeLoader = new CubeLoader(loaders);
    this.loaders.push(cubeLoader);
    loaderMap[key] = cubeLoader;
    this.textureMap[key] = texture;
  }
  return this.textureMap[key];
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
  var toLoad = this.loaders.length;
  var onload = function(){
    --toLoad;
    if(toLoad === 0)
      callback();
  }

  for(var i=0; i<this.loaders.length; ++i){
    this.loaders[i].load(onload);
  }
}

p.bindTexture = function(key, unit){
  if(isNaN(unit)) unit = 0;
  var texture = null;

  if(this.map[key])
    texture = this.map[key].texture;

  if(this.boundTextureMap[unit] !== texture){
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    this.boundTextureMap[unit] = texture;
  }
}

p.unbindTexture = function(key, unit){
  if(isNaN(unit)) unit = 0;

  gl.activeTexture(unit);
  gl.bindTexture(gl.TEXTURE_2D, null);
  this.boundTextureMap[unit] = null;
}

p.clear = function(){
  this.loaders.length = 0;
  this.map = Object.create(null);
  this.boundTexture = null;
}

TextureManager.instance = new TextureManager();