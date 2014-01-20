function TextureLoader(url){
  this.url = url;
  this.data = null;
  this.width = NaN;
  this.height = NaN;
}
var p = TextureLoader.prototype;

p.load = function(callback){
  var image = new Image();
  image.onload = bind(this, function(){
    this.data = image;
    this.width = image.width;
    this.height = image.width;
    
    if(callback)
      callback();
  });
  image.src = this.url;
}

// p.create = function(image){
//   this.image = image;

//   this.texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, this.texture);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
// }