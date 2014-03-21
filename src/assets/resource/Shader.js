define(function(require){
"use strict"

require('util/utils');
var Resource = require('assets/resource/Resource');

// (?:) is non-capturing group, which does not introduce parameter to the replace callback function.
var uniformRegex = /uniform +(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube) +(\w+)(?:\[(.+)\])? *(?:: *(.+))?;/g;
var attributeRegex = /attribute +(float|int|vec2|vec3|vec4) +(\w+) *(?:: *(.+))?;/g;

// preload all the shared glsl includes here... work for now. Maybe future should be put into grunt task
var includes = {
  'common.glsl': require('text!shader/lib/common.glsl')
}

var Shader = function(){
  // whether to validate undefined uniform location
  this.validateLocation = false;
  // store the error of the undefined uniform location, so it only trace out once.
  this.logs = Object.create(null);

  this.a = this.attributes = Object.create(null);
  this.u = this.uniforms = Object.create(null);

  // map semantic to uniform names
  this.semanticUniformNames = Object.create(null);
  this.semanticAttributeNames = Object.create(null);
  // map semantic uniform to specific function
  this.semantics = Object.create(null);

  this.program = gl.createProgram();
  this.vertexShader = gl.createShader(gl.VERTEX_SHADER);
  this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  // stores runtime defines
  this.defines = Object.create(null);
}
var p = Shader.prototype = Object.create(Resource.prototype);

p.compile = function(source){
  // preprocess the source, separate it into line array and corresponding info
  var lineInfo = this.preprocess(source);

  var runtimeDefines = [];
  // add defines for both vertex and fragment shaders.
  for(var key in this.defines){
    runtimeDefines.push('#define ' + key + ' ' + this.defines[key]);
  }

  this.compileShader(this.vertexShader, lineInfo, runtimeDefines.concat(['#define VERTEX_SHADER']));
  this.compileShader(this.fragmentShader, lineInfo, runtimeDefines.concat(['#define FRAGMENT_SHADER']));

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

p.preprocess = function(source, type){
  // do not include same file
  var uniqueInclude = {};
  // keep track of all the lines, and corresponding information, such as line index and which file it belongs.
  var lineInfo = { lines: [], info: [] }

  // TODO: semantic glsl
  function parseUniform(str, type, name, array, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |array| ' + array + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticUniformNames[semantic] = name;

    return ["uniform", type, name, array].join(" ")+";";
  }

  // TODO: semantic glsl
  function parseAttribute(str, type, name, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticAttributeNames[semantic] = name;

    return ["attribute", type, name].join(" ")+";";
  }

  function expandIncludeLine(source, currentFile, lines, info){
    var sourceLines = source.split(/\r?\n/);
    var result;

    var len = sourceLines.length;
    for(var i=0; i<len; ++i){
      // get the #include define
      result = /^\s*#include +([\w\.\/]+)/g.exec(sourceLines[i]);

      // an include statement
      if(result){
        var file = result[1];

        // duplicate include is ignored
        if(uniqueInclude[file])
          continue;
        uniqueInclude[file] = true;

        if(!includes[file])
          throw new Error('#include ' + file + ' does not exist');
        else {
          expandIncludeLine(includes[file], file, lines, info);
        }
      }
      // keep track of current line's index and which file it belongs, if not an include statement
      else{
        lines.push(sourceLines[i]);
        info.push({ file: currentFile, index: i })
      }
    }
  }

  // TODO: semantic glsl conversion
  source = source.replace(uniformRegex, parseUniform.bind(this))
                 .replace(attributeRegex, parseAttribute.bind(this));

  // TODO: try to find a way to get the root shader file name
  expandIncludeLine(source, null, lineInfo.lines, lineInfo.info);

  return lineInfo;
}

p.compileShader = function(shader, lineInfo, runtimeDefines){
  var source = runtimeDefines.join('\n') + '\n' + lineInfo.lines.join('\n');
  // console.log(source);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success){
    var errorLineRegex = /(\w+):\s+(\d+):(\d+):\s*(.*)/;
    var error = gl.getShaderInfoLog(shader);
    // [dummy, level, sourceID, lineno, message]
    // http://immersedcode.org/2012/1/12/random-notes-on-webgl/
    var result = errorLineRegex.exec(error);
    var level = result[1];
    // since there are runtime defines added, we need to offset the error line by minus the number of runtime defines, and -1 to get the index
    var errorLineIndex = result[3] - runtimeDefines.length - 1;
    var message = result[4];

    var errorLineInfo = lineInfo.info[errorLineIndex];
    throw new Error(level + ' ' + errorLineInfo.file + ' ' + (errorLineInfo.index+1) + ':' + message);
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

  gl.uniformMatrix2fv(location, false, value);
}

p.mat3 = function(locationName, value){
  var location = this.getUniformLocation(locationName);

  if(value === null || value === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + value);

  gl.uniformMatrix3fv(location, false, value);
}

p.mat4 = function(locationName, value){
  var location = this.getUniformLocation(locationName);

  if(value === null || value === undefined)
    console.error('location %c' + locationName, 'color: blue', 'array invalid: ' + value);

  gl.uniformMatrix4fv(location, false, value);
}

return Shader;

});