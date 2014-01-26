function Texture(target, glTexture){
  this.target = target || gl.TEXTURE_2D;
  this.glTexture = glTexture || gl.createTexture();

  // image or bytes
  this.data = null;

  this.id = Texture.id++;

  // function to setup paramters
  this.setParameters = null;
}
var p = Texture.prototype;

p.load = function(url){
  var loader = ResourceManager.instance.add(url);
  if(loader.data){
    this.width = loader.width;
    this.height = loader.height;
    // console.log('set data straight away')
    this.setData(loader.data)
  }
  else{
    loader.addEventListener(Event.COMPLETE, bind(this, function(e){
      // console.log('set data in listener: ' + loader.data)
      if(loader.data){
        this.setData(loader.data);
        this.width = loader.width;
        this.height = loader.height;
      }
    }));
    loader.load();
  }
}

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

  if(this.setParameters)
    this.setParameters(this);

  TextureManager.instance.unbindTexture(gl.TEXTURE0);

  this.data = data;
}

p.bind = function(unit, target){
  TextureManager.instance.bindTexture(this, unit, target);
}

p.unbind = function(){
  if(this.isBound)
    TextureManager.instance.unbindTexture(unit, target);
}

p.isBound = function(unit){
  return TextureManager.instance.boundTextures[unit] === this;
}

Texture.id = 0;