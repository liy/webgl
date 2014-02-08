function Library(){
  this.resourceMap = Object.create(null);
}
var p = Library.prototype;

p.get = function(url){
  var resource = this.resourceMap[url];

  if(!resource){
    resource = this.resourceMap[url] = this.createResource(url);
  }

  return resource;
}

p.createResource = function(url){
  var resource;
  var ext = url.substring(url.lastIndexOf(".")+1);
  switch(ext.toLowerCase()){
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "tga":
      resource = new ImageResource(url);
      break;
    default:
      console.error("Unknown extension:", ext);
      break;
  }

  return resource;
}

Library.instance = new Library();

// p.load = function(callback){
//   var len = this.loaders.length;
//   for(var i=0; i<len; ++i){
//     this.loaders[i].load(function(){
//       if(--len==0 && callback)
//         callback();
//     });
//   }
// }