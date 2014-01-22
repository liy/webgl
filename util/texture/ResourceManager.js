function ResourceManager(){
  this.loaderMap = Object.create(null);
  this.loaders = [];
}
var p = ResourceManager.prototype;

p.add = function(url){
  var loader = this.loaderMap[url];
  // if this resource does not exist in the memory, load it.
  if(!loader){
    loader = this._createLoader(url);
    this.loaders.push(loader);
    this.loaderMap[url] = loader;
  }

  return loader;
}

p.load = function(callback){
  var len = this.loaders.length;
  for(var i=0; i<len; ++i){
    this.loaders[i].load(function(){
      if(--len==0 && callback)
        callback();
    });
  }
}

p.getResource = function(url){
  var loader = this.loaderMap[url];
  if(loader)
    return loader.data;
  return null;
}

p.getLoader = function(url){
  return this.loaderMap[url];
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
      console.error("Unknown type:", type);
      break;
  }
}

ResourceManager.instance = new ResourceManager();