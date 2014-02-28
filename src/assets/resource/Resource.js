
define(function(require){

"use strict"
var Resource = function(url){

}
var p = Resource.prototype;

p.ready = function(){
  // return back a promise
}

p.refresh = function(){
  this.loader.load();
}

return Resource;

});