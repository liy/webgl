define(function(require){

  var ImageResource = require('assets/resource/ImageResource');
  var Shader = require('assets/resource/Shader');

  "use strict"
  var Library = {};

  // default resourceStore
  Library.resourceStore = {};

  Library.resourceStore = {
    'posx.jpg': new ImageResource('../webgl-meshes/cube_map/posx.jpg'),
    'negx.jpg': new ImageResource('../webgl-meshes/cube_map/negx.jpg'),
    'posy.jpg': new ImageResource('../webgl-meshes/cube_map/posy.jpg'),
    'negy.jpg': new ImageResource('../webgl-meshes/cube_map/negy.jpg'),
    'posz.jpg': new ImageResource('../webgl-meshes/cube_map/posz.jpg'),
    'negz.jpg': new ImageResource('../webgl-meshes/cube_map/negz.jpg'),
  };

  Library.get = function(url){
    return this.resourceStore[url] || this._createResource(url);
  }

  Library.load = function(){
    var resources = [];
    for(var key in Library.resourceStore){
      resources.push(Library.resourceStore[key]);
    }
    console.log(resources);
    return Promise.all(resources);
  }

  Library._createResource = function(url){
    var index = url.lastIndexOf(".");
    var ext = url.substring(index+1);
    var name = url.substring(0, index);

    switch(ext.toLowerCase()){
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "tga":
        return new ImageResource(url);
    }
  }

  return Library;
});