function TextureManager(){
  this.loaders = new Array();
  this.textureMap = Object.create(null);
  this.boundTextures = Object.create(null);

  this.textureID = 0;
}
var p = TextureManager.prototype;

p.add = function(data, key){
  var texture;
  if(data instanceof Array)
    // texture = this.addTextureCube(data, key);
    console.warn('not implemented yet')
  else
    texture = this.addTexture2D(data);
  return texture;
}

// TODO: needs return opengl texture
p.addTexture2D = function(url){
  console.log('add texture 2d', url);
  var texture = this.textureMap[url];
  if(!texture){
    var loader = ResourceManager.instance.load(url);
    texture = new Texture(gl.TEXTURE_2D);
    this.textureMap[url] = texture;
    if(loader.data){
      console.log('set data straight away')
      texture.setData(loader.data)
    }
    else{
      loader.addEventListener(Event.COMPLETE, bind(this, function(e){
        console.log('set data in listener: ' + loader.data)
        texture.setData(loader.data)
      }));
    }
  }
  return texture;
}

p.bindTexture = function(texture, unit, target){
  target = target || gl.TEXTURE_2D;
  unit = unit || gl.TEXTURE0;

  // for now, always bind
  // if(this.boundTextures[unit] !== texture){
    gl.activeTexture(unit);
    gl.bindTexture(target, texture.core);
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

p.clear = function(){
  this.loaders.length = 0;
  this.textureMap = Object.create(null);
  this.boundTextures = Object.create(null);
}

TextureManager.instance = new TextureManager();