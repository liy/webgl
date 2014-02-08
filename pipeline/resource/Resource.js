function Resource(url){
  this.url = url;
  this.loader = this.createLoader(url);
}
var p = Resource.prototype;

p.createLoader = function(url){
  var loader;
  var ext = url.substring(url.lastIndexOf(".")+1);
  switch(ext.toLowerCase()){
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      loader = new NativeLoader(url);
      break;
    case "tga":
      loader = new TGALoader(url);
      break;
    default:
      console.error("Unknown extension:", ext);
      break;
  }

  return loader;
}

p.refresh = function(){
  this.loader.load();
}