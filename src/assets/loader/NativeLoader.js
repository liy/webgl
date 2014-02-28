define(function(require){

"use strict"
var NativeLoader = function(url){
  this.url = url;
  this.data = null;

  this.ready = new Promise(function(resolve, reject){

    var image = this.data = new Image();
    image.onload = function(e){
      this.width = image.width;
      this.height = image.height;

      resolve(this);
    }.bind(this);
    image.onerror = function(err){
      reject(this);
    }.bind(this);

    image.src = this.url;
  }.bind(this));
}
var p = NativeLoader.prototype;

return NativeLoader;

});