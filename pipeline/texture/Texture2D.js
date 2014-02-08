function Texture2D(){
  Texture.call(this, gl.TEXTURE_2D);

  this.ready = false;

  // setup default parameters
  this.bind(gl.TEXTURE0);
  gl.texParameterf(this.target, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameterf(this.target, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameterf(this.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameterf(this.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  this.unbind();
}
var p = Texture2D.prototype = Object.create(Texture.prototype);

p.load = function(url){
  this.resource = Library.instance.get(url);
  this.resource.loader.addEventListener(Event.COMPLETE, bind(this, this.onComplete));
  this.resource.loader.load();
}

p.onComplete = function(e){
  this.bind(gl.TEXTURE0);

  console.log('loaded');


  this.width = this.resource.loader.width;
  this.height = this.resource.loader.height;

  // flip the texture content in y direction.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if(this.resource.loader.data instanceof Image)
    gl.texImage2D(this.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resource.loader.data);
  else
    gl.texImage2D(this.target, 0, gl.RGBA, this.resource.loader.width, this.resource.loader.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.resource.loader.data);

  if(this.setParameters)
    this.setParameters(this);


  this.ready = true;

  this.unbind();
}