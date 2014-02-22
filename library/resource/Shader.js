"use strict"
function Shader(vertPath, fragPath){
  this.a = this.attributes = {};
  this.u = this.uniforms = {};

  this.vertPath = vertPath;
  this.fragPath = fragPath;

  var vertLoader = new ShaderLoader(vertPath, gl.VERTEX_SHADER);
  var fragLoader = new ShaderLoader(fragPath, gl.FRAGMENT_SHADER);

  this.program = gl.createProgram();
  gl.attachShader(this.program, vertLoader.data);
  gl.attachShader(this.program, fragLoader.data);
  gl.linkProgram(this.program);

  var success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
  if (!success)
    throw ("shader failed to link:" + gl.getProgramInfoLog(this.program));

  this.locateAttributes();
  this.locateUniforms();

  this.validateLocation = false;
  this.logs = Object.create(null);
}
var p = Shader.prototype = Object.create(Resource.prototype);

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