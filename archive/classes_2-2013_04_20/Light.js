(function(window){
  // by default position directional light, from (1, 1, 1)
  function Light(pos){
    // vec4
    // if w is 0, it is directional light.
    this.position = pos ? pos : vec4.fromValues(0, 0, 1, 0);
    // vec4
    this.ambient = vec4.fromValues(0.1, 0.1, 0.1, 1.0);
    // vec4
    this.diffuse = vec4.fromValues(0.9, 0.9, 0.9, 1.0);
    // vec4
    this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
    // vec3, constant, linear and quadratic
    this.attenuation = vec3.fromValues(1.0, 0, 0);
    // vec3
    // if any of x, y, z are non-zero, it is spot light 
    this.direction = vec3.create();
    // float
    this.cosOuter = Math.cos(Math.PI/4);
    // float, outer cos - inner cos
    this.cosFalloff = this.cosOuter - Math.cos(Math.PI/8);

    this.point = new Cube(0.1, 0.1, 0.1);
    this.point.position = this.position;
  }
  var p = Light.prototype;

  p.setUniforms = function(uniform){
    gl.uniform4fv(uniform['u_Light.position'], this.position);
    gl.uniform4fv(uniform['u_Light.ambient'], this.ambient);
    gl.uniform4fv(uniform['u_Light.diffuse'], this.diffuse);
    gl.uniform4fv(uniform['u_Light.specular'], this.specular);
    gl.uniform3fv(uniform['u_Light.attenuation'], this.attenuation);
    gl.uniform3fv(uniform['u_Light.direction'], this.direction);
    gl.uniform1f(uniform['u_Light.cosOuter'], this.cosOuter);
    gl.uniform1f(uniform['u_Light.cosFalloff'], this.cosFalloff);
  }

  p.isDirectional = function(){
    return this.position.w === 0;
  };

  p.isSpotlight = function(){
    return this.direction.x !== 0 || this.direction.y !== 0 || this.direction.z !== 0;
  };

  p.draw = function(shader){
    gl.uniform1i(shader.uniform['u_UseColor'], 1);
    this.point.draw(shader, this);
    gl.uniform1i(shader.uniform['u_UseColor'], 0);
  }

window.Light = Light;
})(window);