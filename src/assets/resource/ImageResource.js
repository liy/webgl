define(function(require){

var NativeLoader = require('assets/loader/NativeLoader');
var TGALoader = require('assets/loader/TGALoader');
var Resource = require('assets/resource/Resource');

"use strict"
var ImageResource = function(url){
  Resource.call(this);

  this.url = url;
  var loader = this.createLoader(this.url);
  this.ready = loader.ready.then(function(loader){
    this.width = loader.width;
    this.height = loader.height;
    this.data = loader.data;

    return this;
  }.bind(this)).catch(function(err){
    console.error(err);
  });
}
var p = ImageResource.prototype = Object.create(Resource.prototype);

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

return ImageResource;

});