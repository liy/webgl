(function(window){
function ShaderLoader(path, type){
  this.path = path;
  this.type = type;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, false);
  xhr.onload = bind(this, this.onload);
  xhr.send();
}
var p = ShaderLoader.prototype;

p.onload = function(e){
  this.source = e.target.responseText;

  this.data = gl.createShader(this.type);
  gl.shaderSource(this.data, this.source);
  gl.compileShader(this.data);

  // Check if it compiled
  var success = gl.getShaderParameter(this.data, gl.COMPILE_STATUS);
  if (!success)
    throw "could not compile shader:" + gl.getShaderInfoLog(this.data);
};

window.ShaderLoader = ShaderLoader;
})(window)