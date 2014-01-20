function TextureCubeCreator(parameterFunc){
  this.texture = gl.createTexture();
  this.parameterFunc = parameterFunc;
}
var p = TextureCubeCreator.prototype;

p.setup = function(loader){
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);
  this.parameterFunc(gl.TEXTURE_CUBE_MAP, this.texture);

  if(loader instanceof ImageLoader){
    gl.texImage2D(loader.face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
  }
  else{
    gl.texImage2D(loader.face, 0, gl.RGBA, loader.width, loader.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
  }

  gl.bindTexture(this.target, null);
}