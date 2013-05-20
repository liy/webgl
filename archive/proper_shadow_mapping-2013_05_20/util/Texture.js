function Texture(){
  this.id = Texture.id++;
}
var p = Texture.prototype;

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

  this.textureID = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, this.textureID);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
}

Texture.bind = function(textureID){
  // if(Texture.boundID != textureID){
    gl.bindTexture(gl.TEXTURE_2D, textureID);
    Texture.boundID = textureID;
  // }
}

// load multiple textures
Texture.load = function(urls, callback){
  var textures = [];
  var imagesToLoad = urls.length;

  var onload = function(){
    --imagesToLoad;
    if(imagesToLoad == 0)
      callback(textures);
  }

  for(var i=0; i<urls.length; ++i){
    textures[i] = new Texture();
    textures[i].load(urls[i], onload);
  }
}

Texture.id = 0;