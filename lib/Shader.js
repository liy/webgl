(function(window){

function Shader(program, vertex_shader_path, fragment_shader_path){
  this.attribute = {};
  this.uniform = {};

  var vertLoader = new ShaderLoader(vertex_shader_path, gl.VERTEX_SHADER);
  var fragLoader = new ShaderLoader(fragment_shader_path, gl.FRAGMENT_SHADER);

  gl.attachShader(program, vertLoader.data);
  gl.attachShader(program, fragLoader.data);
  gl.linkProgram(program);
  
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success)
    throw ("shader failed to link:" + gl.getProgramInfoLog(program));
}
var p = Shader.prototype;

p.bindAttributes = function(program){
  var count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  for (i = 0; i < count; i++) {
    var attrib = gl.getActiveAttrib(program, i);
    this.attribute[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }
  // console.log(this.attribute);
}

p.bindUniforms = function(program){
  var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (i = 0; i < count; i++) {
    var uniform = gl.getActiveUniform(program, i);
    var name = uniform.name.replace("[0]", "");
    this.uniform[name] = gl.getUniformLocation(program, uniform.name);
    // console.log(name);
    // console.log(uniform.name);
  }
  // console.log(this.uniform);
}

window.Shader = Shader;
})(window);