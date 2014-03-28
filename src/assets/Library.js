define(function(require){

  var ImageResource = require('assets/resource/ImageResource');
  var Shader = require('assets/resource/Shader');

  "use strict"
  var Library = {};

  // default resourceStore
  Library.resourceStore = {};

  Library.get = function(url){
    return this.resourceStore[url] || this._createResource(url);
  }

  Library.loaded = function(){
    var resources = [];
    for(var key in this.resourceStore){
      resources.push(Library.resourceStore[key].ready);
    }
    // console.log(resources);
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
        this.resourceStore[url] = new ImageResource(url);
        break;
    }

    return this.resourceStore[url];
  }

  return Library;
});