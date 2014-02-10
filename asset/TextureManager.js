function TextureManager(){
  this.loaders = new Array();
  this.boundTextures = Object.create(null);
}
var p = TextureManager.prototype;

p.bindTexture = function(texture, unit, target){
  target = target || gl.TEXTURE_2D;
  unit = unit || gl.TEXTURE0;

  // for now, always bind
  // if(this.boundTextures[unit] !== texture){
    gl.activeTexture(unit);
    gl.bindTexture(target, texture.glTexture);
    this.boundTextures[unit] = texture;

  //   // console.log('bind: ', texture.core, unit);
  // }
  // else{
  //   // console.log('bound: ', texture, unit);
  // }

  return true;
}

p.unbindTexture = function(unit, target){
  target = target || gl.TEXTURE_2D;
  unit = unit || gl.TEXTURE0;

  // console.log('unbind: ' + unit);

  gl.activeTexture(unit);
  gl.bindTexture(target, null);
  this.boundTextures[unit] = null;
}

TextureManager.instance = new TextureManager();