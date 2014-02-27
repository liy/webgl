define(function(require){

require('util/utils')

var ShaderLoader = function(path, type){
  this.path = path;
  this.type = type;
  this.xhr = new XMLHttpRequest();
}
var p = ShaderLoader.prototype;

p.load = function(path){
  this.path = path || this.path;
  this.xhr.open('GET', this.path, true);
  return new Promise(this.resolver.bind(this));
}

p.resolver = function(resolve, reject){
  this.resolve = resolve;

  this.xhr.onload = bind(this, function(){
    if(this.xhr.status === 200){
      this.source = this.xhr.responseText;

      this.data = gl.createShader(this.type);
      gl.shaderSource(this.data, this.source);
      gl.compileShader(this.data);

      console.log('shader created', this)

      // Check if it compiled
      // var success = gl.getShaderParameter(this.data, gl.COMPILE_STATUS);
      // if (!success)
      //   console.error("could not compile shader:" + gl.getShaderInfoLog(this.data));

      this.resolve(this);
    }
    else
      reject(new Error(this.xhr.statusText));
  });

  this.xhr.onerror = function(error){
    reject(new Error('Network error', error))
  }

  this.xhr.send();
}

return ShaderLoader;

});