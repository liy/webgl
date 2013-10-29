function TextureManager(){
  this.loaders = new Array();
  this.map = new Object();

  this.boundTexture = null;
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

p.bind = function(key){
  var loader = this.map[key];
  if(!loader){
    gl.bindTexture(gl.TEXTURE_2D, null);
    this.boundTexture = null;
    return;
  }

  if(loader && this.boundTexture !== loader.texture){
    this.boundTexture = loader.bind();
  }
}