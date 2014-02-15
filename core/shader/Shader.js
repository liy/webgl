function Shader(vertPath, fragPath){
  this.attributes = {};
  this.uniforms = {};

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
}
var p = Shader.prototype;

p.locateAttributes = function(){
  var count = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
  for (i = 0; i < count; i++) {
    var attrib = gl.getActiveAttrib(this.program, i);
    this.attributes[attrib.name] = gl.getAttribLocation(this.program, attrib.name);
  }
  // console.log(this.attributes);
}

p.locateUniforms = function(){
  var count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
  for (var i = 0; i<count; i++){
    uniform = gl.getActiveUniform(this.program, i);
    // console.log(this.uniforms);
    if(uniform.size === 1)
      this.uniforms[uniform.name] = gl.getUniformLocation(this.program, uniform.name);
    else{
      var name = uniform.name.replace("[0]", "");
      this.uniforms[name] = [];
      for(var j=0; j<uniform.size; ++j){
        this.uniforms[name].push(gl.getUniformLocation(this.program, name+"["+j+"]"));
      }
    }
  }
}