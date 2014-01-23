function Texture(target, webglTexture){
  this.target = target || gl.TEXTURE_2D;
  this.core = webglTexture || gl.createTexture();

  // image or bytes
  this.data = null;

  this.id = Texture.id++;
}
var p = Texture.prototype;

p.setData = function(data){
  TextureManager.instance.bindTexture(this);
  // flip the texture content in y direction.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if(data instanceof Image){
    gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  else{
    gl.texImage2D(this.target, 0, gl.RGBA, data.width, data.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }

  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.generateMipmap(gl.TEXTURE_2D);
  TextureManager.instance.unbindTexture(gl.TEXTURE0);

  this.data = data;
}

Texture.id = 0;