function TextureManager(){
  this.loaders = new Array();
  this.map = Object.create(null);

  this.boundTextureMap = Object.create(null);
}
var p = TextureManager.prototype;

p.add = function(url, key){
  if(!this.map[key]){
    var loader = new TextureLoader(url)
    this.loaders.push(loader);
    if(!key)
      key = url;
    this.map[key] = loader;
  }
  return this.map[key];
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

  // if(this.boundTextureMap[unit] !== texture){
    gl.activeTexture(unit);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    this.boundTextureMap[unit] = texture;
  // }
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