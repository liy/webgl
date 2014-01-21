function ImageLoader(url){
  EventDispatcher.call(this);

  this.url = url;
  this.data = null;
  this.width = NaN;
  this.height = NaN;
}
var p = ImageLoader.prototype = Object.create(EventDispatcher.prototype);

p.load = function(callback){
  var image = new Image();
  image.onload = bind(this, function(){
    this.data = image;
    this.width = image.width;
    this.height = image.width;

    this.dispatchEvent(new Event(Event.COMPLETE));

    if(callback)
      callback();
  });
  image.src = this.url;
}