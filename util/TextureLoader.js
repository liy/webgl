function TextureLoader(url){
  this.url = url;
  this.id = TextureLoader.id++;

  this.loaded = false;

  this.loader = new TextureUtil.TextureLoader(gl);
}
var p = TextureLoader.prototype;

p.load = function(callback){
  // var image = new Image();
  // image.onload = bind(this, function(){
  //   this.loaded = true;
  //   this.create(image);
  //   callback();
  // });
  // image.src = this.url;

  console.log('loading texture: ' + this.url);

  this.loader.load(this.url, bind(this, function(texture) {
    this.loaded = true;
    this.texture = texture;
    console.log('%ctexture loaded: ' + this.url, 'color: green');
    callback();
  }));
}

p.create = function(image){
  this.image = image;

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
}

p.bind = function(){
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  return this.texture;
}

TextureLoader.id = 0;