define(function(require){

require('util/utils');
var Resource = require('assets/resource/Resource');


"use strict"
var Shader = function(vertPath, fragPath){
  this.a = this.attributes = {};
  this.u = this.uniforms = {};

  this.validateLocation = false;
  this.logs = Object.create(null);

  this.program = gl.createProgram();
  this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
  this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  this.vertexShader.url = vertPath;
  this.fragmentShader.url = fragPath;
}
var p = Shader.prototype = Object.create(Resource.prototype);

p.load = function(vertPath, fragPath){
  this.vertexShader.url = vertPath || this.vertexShader.url;
  this.fragmentShader.url = fragPath || this.fragmentShader.url;

  // first load vertex and fragment shader, then link the program
  return Promise.all([get(this.vertexShader.url), get(this.fragmentShader.url)])
                .then(this.compile.bind(this))
                .then(this.link.bind(this));
}

p.compile = function(responses){
  this.vertexShader.source = responses[0];
  gl.shaderSource(this.vertexShader, responses[0]);
  gl.compileShader(this.vertexShader);

  var success = gl.getShaderParameter(this.vertexShader, gl.COMPILE_STATUS);
  if (!success)
    throw "Could not compile vertex shader:" + gl.getShaderInfoLog(this.vertexShader);

  this.fragmentShader.source = responses[1];
  gl.shaderSource(this.fragmentShader, responses[1]);
  gl.compileShader(this.fragmentShader);

  success = gl.getShaderParameter(this.fragmentShader, gl.COMPILE_STATUS);
  if (!success)
    throw "Could not compile fragment shader:" + gl.getShaderInfoLog(this.fragmentShader);

  // pass to link function
  return [this.vertexShader, this.fragmentShader];
}

p.link = function(shaders){
  gl.attachShader(this.program, shaders[0]);
  gl.attachShader(this.program, shaders[1]);
  gl.linkProgram(this.program);

  var success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
  if (!success)
    throw "Failed to link shader:" + gl.getProgramInfoLog(this.program);

  this.locateAttributes();
  this.locateUniforms();

  // this is not a asynchronous call just return a value.
  return this;
}

p.locateAttributes = function(){
  var count = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < count; i++) {
    var attrib = gl.getActiveAttrib(this.program, i);
    this.attributes[attrib.name] = gl.getAttribLocation(this.program, attrib.name);
  }
  // console.log(this.attributes);
}

p.locateUniforms = function(){
  var count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i<count; i++){
    var info = gl.getActiveUniform(this.program, i);
    // console.log(this.uniforms);
    if(info.size === 1)
      this.uniforms[info.name] = gl.getUniformLocation(this.program, info.name);
    else{
      var name = info.name.replace("[0]", "");
      this.uniforms[name] = [];
      for(var j=0; j<info.size; ++j){
        var location = gl.getUniformLocation(this.program, name+"["+j+"]");
        this.uniforms[name].push(location);
        // two ways to access the array, either by using index or string
        this.uniforms[name+"["+j+"]"] = location;
      }
    }
  }

  // console.log(this.uniforms);
}

p.getUniformLocation = function(locationName){
  var location = this.uniforms[locationName];

  if(this.validateLocation){
    if(!location){
      if(!this.logs[locationName]){
        console.groupCollapsed('location %c' + locationName, 'color: blue', 'is invalid');
        console.error('uniform location %c' + locationName, 'color: blue', 'is invalid');
        console.info(this.vertPath);
        console.groupEnd();
        this.logs[locationName] = true;
      }
    }
  }

  return location;
}


p.f = function(locationName, x){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);

  gl.uniform1f(location, x);
}

p.fv = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 1)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform1fv(location, v);
}


p.i = function(locationName, x){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);

  gl.uniform1i(location, x);
}

p.iv = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 1)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform1iv(location, v);
}

p.f2 = function(locationName, x, y){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);

  gl.uniform2f(location, x, y);
}

p.fv2 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 2)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform2fv(location, v)
}

p.i2 = function(locationName, x, y){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);

  gl.uniform2i(location, x, y);
}

p.iv2 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 2)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform2iv(location, v);
}

p.f3 = function(locationName, x, y, z){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);
  else if(z === null || z === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + z);

  gl.uniform3f(location, x, y, z);
}

p.fv3 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 3)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform3fv(location, v);

}

p.i3 = function(locationName, x, y, z){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);
  else if(z === null || z === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + z);

  gl.uniform3i(location, x, y, z);
}

p.iv3 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 3)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform3iv(location, v);
}

p.f4 = function(locationName, x, y, z, w){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);
  else if(z === null || z === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + z);
  else if(w === null || w === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + w);

  gl.uniform4f(location, x, y, z, w);
}

p.fv4 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 4)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform4fv(location, v);
}

p.i4 = function(locationName, x, y, z, w){
  var location = this.getUniformLocation(locationName);

  if(x === null || x === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + x);
  else if(y === null || y === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + y);
  else if(z === null || z === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + z);
  else if(w === null || w === undefined)
    console.error('location %c' + locationName, 'color: blue', 'value invalid: ' + w);

  gl.uniform4i(location, x, y, z, w);
}

p.iv4 = function(locationName, v){
  var location = this.getUniformLocation(locationName);

  if(v === null || v === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + v);
  else if(v.length !== 4)
    console.error('location %c' + locationName, 'color: blue', 'array length invalid: ' + v.length);

  gl.uniform4iv(location, v);
}

p.mat2 = function(locationName, value){
  var location = this.getUniformLocation(locationName);

  if(value === null || value === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + value);

  gl.uniformMatrix2fv(location, gl.FALSE, value);
}

p.mat3 = function(locationName, value){
  var location = this.getUniformLocation(locationName);

  if(value === null || value === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + value);

  gl.uniformMatrix3fv(location, gl.FALSE, value);
}

p.mat4 = function(locationName, value){
  var location = this.getUniformLocation(locationName);

  if(value === null || value === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + value);

  gl.uniformMatrix4fv(location, gl.FALSE, value);
}

return Shader;

});