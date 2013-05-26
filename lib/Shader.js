(function(window){

function Shader(program, vertex_shader_path, fragment_shader_path){
  this.attributes = {};
  this.uniforms = {};

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
    this.attributes[attrib.name] = gl.getAttribLocation(program, attrib.name);
  }
  // console.log(this.attributes);
}

p.bindUniforms = function(program){
  var count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (i = 0; i < count; i++) {
    var uniforms = gl.getActiveUniform(program, i);
    var name = uniforms.name.replace("[0]", "");
    this.uniforms[name] = gl.getUniformLocation(program, uniforms.name);
    // console.log(name);
    // console.log(uniforms.name);
  }
  // console.log(this.uniforms);
}

window.Shader = Shader;
})(window);