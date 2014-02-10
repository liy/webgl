function ImageResource(url){
  Resource.call(this, url);

  this.loader.addEventListener(Event.COMPLETE, bind(this, this.onComplete));
}
var p = ImageResource.prototype = Object.create(Resource.prototype);

p.onComplete = function(e){
  this.width = this.loader.width;
  this.height = this.loader.height;
}