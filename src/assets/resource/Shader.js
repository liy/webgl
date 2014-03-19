define(function(require){
"use strict"

require('util/utils');
var Resource = require('assets/resource/Resource');

// (?:) is non-capturing group, which does not introduce parameter to the replace callback function.
var uniformRegex = /uniform +(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube) +(\w+)(?:\[(.+)\])? *(?:: *(.+))?;/g;
var attributeRegex = /attribute +(float|int|vec2|vec3|vec4) +(\w+) *(?:: *(.+))?;/g;

// define all the shared glsl includes here... work for now. Maybe future should be put into grunt task
var includes = {
  'one.glsl': require('text!shader/include/one.glsl'),
  'two.glsl': require('text!shader/include/two.glsl'),
  'three.glsl': require('text!shader/include/three.glsl'),
  'four.glsl': require('text!shader/include/four.glsl')
}

var Shader = function(){
  this.a = this.attributes = Object.create(null);
  this.u = this.uniforms = Object.create(null);

  // map semantic to uniform names
  this.semanticUniformNames = Object.create(null);
  this.semanticAttributeNames = Object.create(null);
  // map semantic uniform to specific function
  this.semantics = Object.create(null);

  this.validateLocation = false;
  this.logs = Object.create(null);

  this.program = gl.createProgram();
  this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
  this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // static defines for the shader
  this.defines = Object.create(null);
}
var p = Shader.prototype = Object.create(Resource.prototype);

p.compile = function(source){
  var lines = [];
  // construct defines for both vertex and fragment shaders.
  for(var key in this.defines){
    lines.push('#define ' + key + ' ' + this.defines[key]);
  }
  lines.concat(this.preprocess(source));

  var vertexSource = lines.map()

  this.compileShader(this.vertexShader, '#define VERTEX_SHADER\n' + lines.join('\n'));
  this.compileShader(this.fragmentShader, '#define FRAGMENT_SHADER\n' + lines.join('\n'));

  gl.attachShader(this.program, this.vertexShader);
  gl.attachShader(this.program, this.fragmentShader);
  gl.linkProgram(this.program);
  var success = gl.getProgramParameter(this.program, gl.LINK_STATUS);
  if (!success)
    throw "Failed to link shader:" + gl.getProgramInfoLog(this.program);

  this.locateAttributes();
  this.locateUniforms();

  return this;
}

p.preprocess = function(source){
  // do not include same file
  var uniqueInclude = {};

  source = source.replace(uniformRegex, parseUniform.bind(this))
                .replace(attributeRegex, parseAttribute.bind(this));

  function parseUniform(str, type, name, array, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |array| ' + array + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticUniformNames[semantic] = name;

    return ["uniform", type, name, array].join(" ")+";";
  }

  function parseAttribute(str, type, name, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticAttributeNames[semantic] = name;

    return ["attribute", type, name].join(" ")+";";
  }

  function processLines(source, currentFile){
    var sourceLines = source.split(/\r?\n/);
    var result;
    var lines = [];

    var len = sourceLines.length;
    for(var i=0; i<len; ++i){
      // get the #include define
      result = /^\s*#include +([\w\.\/]+)/g.exec(sourceLines[i]);

      // an include statement
      if(result){
        var fileName = result[1];

        // duplicate include do nothing
        if(uniqueInclude[fileName])
          continue;
        uniqueInclude[fileName] = true;

        lines = lines.concat(processLines(includes[fileName].text, fileName));
      }
      // not an include statement
      else
        lines.push({
          file: currentFile,
          line: sourceLines[i],
          index: i
        });
    }

    return lines;
  }

  return processLines(source);
}

p.compileShader = function(shader, source){
  var errorLineRegex = /([0-9]+):([0-9])+/g;
  var uniqueInclude = {};
  var result;
  var errorLine, errorColumn;

  var linePointer = 0;


  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success){
    var error = gl.getShaderInfoLog(shader);
    result = errorLineRegex.exec(error);
    // errorColumn = result[1];
    // errorLine = result[2];

    // var data = traverse(shader.rawSource, 0);
    // console.log(data);

    throw "Cannot compile vertex shader:" + error;
  }
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

  console.log(this.uniforms);
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

p.semantic = function(name, value){

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