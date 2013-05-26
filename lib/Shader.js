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
  for (var i = 0; i<count; i++){
    uniform = gl.getActiveUniform(program, i);
    if(uniform.size === 1)
      this.uniforms[uniform.name] = gl.getUniformLocation(program, uniform.name);
    else{
      var name = uniform.name.replace("[0]", "");
      this.uniforms[name] = [];
      for(var j=0; j<uniform.size; ++j){
        this.uniforms[name].push(gl.getUniformLocation(program, name+"["+j+"]"));
      }
    }
  }
}

window.Shader = Shader;
})(window);