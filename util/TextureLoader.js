function TextureLoader(){
  this.id = TextureLoader.id++;
}
var p = TextureLoader.prototype;

p.load = function(url, callback){
  var image = new Image();
  image.onload = bind(this, function(){
    this.create(image);
    callback();
  });
  image.src = url;
}

p.create = function(image){
  this.image = image;

  this.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
}

TextureLoader.bind = function(texture){
  // if(TextureLoader.boundTexture != texture){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    TextureLoader.boundTexture = texture;
  // }
}

// load multiple textures
TextureLoader.load = function(urls, callback){
  var textureLoaders = [];
  var imagesToLoad = urls.length;

  var onload = function(){
    --imagesToLoad;
    if(imagesToLoad == 0)
      callback(textureLoaders);
  }

  for(var i=0; i<urls.length; ++i){
    textureLoaders[i] = new TextureLoader();
    textureLoaders[i].load(urls[i], onload);
  }
}

TextureLoader.id = 0;