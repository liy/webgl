define(function(require){
"use strict"

require('util/utils');
var Resource = require('assets/resource/Resource');

// define all the shared glsl includes here... work for now. Maybe future should be put into grunt task
var includes = (function(){
  var sourceInfo = {
    'one.glsl': {
      text: require('text!shader/include/one.glsl')
    },
    'two.glsl': {
      text: require('text!shader/include/two.glsl')
    },
    'three.glsl': {
      text: require('text!shader/include/three.glsl')
    },
    'four.glsl': {
      text: require('text!shader/include/four.glsl')
    }
  };

  // count number of lines of each include source
  for(var key in sourceInfo){
    sourceInfo[key]['length'] = sourceInfo[key].text.split(/\r\n|\r|\n/).length;
  }

  return sourceInfo;
})();


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

p.compile = function(vertSource, fragSource){
  this.vertexShader.rawSource = vertSource;
  this.fragmentShader.rawSource = fragSource;

  var vertParseResult = this.parse(vertSource);
  var fragParseResult = this.parse(fragSource);

  // construct defines for both vertex and fragment shaders.
  var defineArr = [];
  for(var key in this.defines){
    defineArr.push('#define ' + key + ' ' + this.defines[key]);
  }
  var vertexSource = defineArr.join('\n') + '\n' + vertParseResult.source;
  var fragmentSource = defineArr.join('\n') + '\n' + fragParseResult.source;
  console.log(vertexSource);

  this.compileShader(this.vertexShader, vertexSource, vertParseResult.included);
  this.compileShader(this.fragmentShader, fragmentSource, fragParseResult.included);

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

p.parse = function(source){
  // (?:) is non-capturing group, which does not introduce parameter to the replace callback function.
  var uniformRegex = /uniform +(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube) +(\w+)(?:\[(.+)\])? *(?:: *(.+))?;/g;
  var attributeRegex = /attribute +(float|int|vec2|vec3|vec4) +(\w+) *(?:: *(.+))?;/g;
  // the include regular expression should not be shared by other function, just in case it mess up the iterator.
  var includeRegex = /#include +([\w\.\/]+)(?:\r\n|\r|\n)/g;


  var uniqueInclude = {};
  var included = [];

  source = source.replace(uniformRegex, parseUniform.bind(this))
                  .replace(attributeRegex, parseAttribute.bind(this))
                  .replace(includeRegex, parseInclude.bind(this));

  function parseUniform(str, type, name, array, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |array| ' + array + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticUniformNames[semantic] = name;

    return ["uniform", type, name, array].join(" ")+";\n";
  }

  function parseAttribute(str, type, name, semantic){
    // console.log(' |str| ' + str + ' |type| ' + type + ' |name| ' + name + ' |semantic| ' + semantic);
    if(semantic)
      this.semanticAttributeNames[semantic] = name;

    return ["attribute", type, name].join(" ")+";\n";
  }

  function parseInclude(str, includeName){
    if(uniqueInclude[includeName])
      return ''; // do not return new line
    uniqueInclude[includeName] = true;

    var content = includes[includeName].text+'\n';
    // console.log(content);

    var result = includeRegex.exec(content);
    // nested includes.
    if(result !== null){
      if(result[1] !== includeName)
        content = content.replace(includeRegex, parseInclude.bind(this));
      else
        throw new Error('Recursive include in: ' + includeName);
    }

    // included ordering information, for tracking error line information
    included.push(includes[includeName]);

    return content;
  }

  return {
    source: source,
    included: included
  }
}

p.compileShader = function(shader, source, included){
  var errorLineRegex = /([0-9]+):([0-9])+/g;

  var uniqueInclude = {};
  var idx = 0;


  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success){
    var error = gl.getShaderInfoLog(shader);
    var errorInfo = errorLineRegex.exec(error);

    traverse(shader.rawSource);

    throw "Cannot compile vertex shader:" + error;
  }


  function traverse(includeSource){
    var reg = /#include +([\w\.\/]+)/g;
    var result;

    while(result = reg.exec(includeSource)){
      var includeName = result[1];
      if(uniqueInclude[includeName])
        continue; // do not return new line
      uniqueInclude[includeName] = true;

      var lineNum = includeSource.substring(0, result.index).split(/\r\n|\r|\n/).length;

      traverse(includes[includeName].text);
      console.log(includeName, 'linenum', lineNum, 'length', includes[includeName].length);
    }
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