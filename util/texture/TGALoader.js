function TGALoader(url){
  this.url = url;
  this.data = null;
  this.width = NaN;
  this.height = NaN;
}
var p = TGALoader.prototype;

p.load = function(callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', src, true);
  xhr.responseType = "arraybuffer";
  xhr.onload = bind(this, function(e){
    if(e.target.status == 200)
      this._decodeTGA(e.target.response);

    if(callback)
      callback();
  });
  xhr.send(null);
}

p._decodeTGA = function(arrayBuffer) {
  var content = new Uint8Array(arrayBuffer),
      contentOffset = 18 + content[0],
      imagetype = content[2], // 2 = rgb, only supported format for now
      width = content[12] + (content[13] << 8),
      height = content[14] + (content[15] << 8),
      bpp = content[16], // should be 8,16,24,32
      
      bytesPerPixel = bpp / 8,
      bytesPerRow = width * 4,
      data, i, j, x, y;

  if(!width || !height) {
    console.error("Invalid dimensions");
    return null;
  }

  if (imagetype != 2) {
    console.error("Unsupported TGA format:", imagetype);
    return null;
  }

  data = new Uint8Array(width * height * 4);
  i = contentOffset;

  // Oy, with the flipping of the rows...
  for(y = height-1; y >= 0; --y) {
    for(x = 0; x < width; ++x, i += bytesPerPixel) {
      j = (x * 4) + (y * bytesPerRow);
      data[j] = content[i+2];
      data[j+1] = content[i+1];
      data[j+2] = content[i+0];
      data[j+3] = (bpp === 32 ? content[i+3] : 255);
    }
  }

  this.width = width;
  this.height = height;
  this.data = data;
}

p.setTextureData = function(target, texture){
  gl.bindTexture(target, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(target, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
  gl.texIm
}