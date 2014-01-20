function Texture2DCreator(parameterFunc){
  this.texture = gl.createTexture();
  this.parameterFunc = parameterFunc;
}
var p = Texture2DCreator.prototype;

p.setup = function(loader){
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  this.parameterFunc(gl.TEXTURE_2D, this.texture);

  if(loader instanceof ImageLoader){
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
  }
  else{
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, loader.width, loader.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, loader.data);
  }

  gl.bindTexture(gl.TEXTURE_2D, null);

}