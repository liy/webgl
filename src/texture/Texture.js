define(function(require){

"use strict"

var Texture = function(target){
  this.glTexture = gl.createTexture();

  this.target = target;
  this.unit = gl.TEXTURE0;

  this.id = Texture.id++;
}
var p = Texture.prototype = Object.create(null);

// key is the unit
Texture.boundTextures = {};

p.bind = function(unit){
  unit = unit || gl.TEXTURE0;

  if(Texture.boundTextures[unit] !== this){
    gl.activeTexture(unit);
    gl.bindTexture(this.target, this.glTexture);

    this.unit = unit;
    Texture.boundTextures[this.unit] = this;
    // console.log('bind: ', this);
  }
  else{
    // console.log('bound: ', this);
  }
}

p.unbind = function(){
  if(!isNaN(this.unit)){
    // console.log('unbind: ', this);
    gl.activeTexture(this.unit);
    gl.bindTexture(this.target, null);

    Texture.boundTextures[this.unit] = null;
    this.unit = NaN;
  }
}

p.isBound = function(){
  return isNaN(this.unit);
}

Texture.unbind = function(unit){
  if(!isNaN(unit)){
    var texture = Texture.boundTextures[unit];
    if(texture)
      texture.unbind();
  }
}

// id
Texture.id = 0;

return Texture;

});
