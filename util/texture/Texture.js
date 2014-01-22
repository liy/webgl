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
  else if(data instanceof ArrayBuffer){
    gl.texImage2D(this.target, 0, gl.RGBA, data.width, data.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  this.data = data;
}

Texture.id = 0;