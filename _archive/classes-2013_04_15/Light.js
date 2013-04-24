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
    this.cosFalloff = Math.cos(Math.PI/4) - Math.cos(Math.PI/8);


    this.point = new Cube();
    this.point.rotationX = 0;
    this.point.rotationY = 0;
    this.point.material.emission = [1, 1, 1, 1];
    this.point.set(0.03, 0.03, 0.03);
    this.createBuffers();
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

  p.createBuffers = function(){
    this.vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.point.vertices), gl.STATIC_DRAW);
    this.ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.point.indices), gl.STATIC_DRAW);
  }

  p.draw = function(){
    // material
    this.point.material.setUniforms(preShader.uniform);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // enable vertex pointer ect.
    gl.vertexAttribPointer(preShader.attribute.a_Vertex, 3, gl.FLOAT, false, 48, 0);
    gl.vertexAttribPointer(preShader.attribute.a_TexCoord, 2, gl.FLOAT, false, 48, 12);
    gl.vertexAttribPointer(preShader.attribute.a_Normal, 3, gl.FLOAT, false, 48, 20);
    gl.vertexAttribPointer(preShader.attribute.a_Color, 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(preShader.attribute.a_Vertex);
    gl.enableVertexAttribArray(preShader.attribute.a_TexCoord);
    gl.enableVertexAttribArray(preShader.attribute.a_Normal);
    gl.enableVertexAttribArray(preShader.attribute.a_Color);

    this.point.rotationX += 0.1;
    this.point.rotationY -= 0.1;
    mat4.identity(modelViewMatrix);
    mat4.translate(modelViewMatrix, modelViewMatrix, this.position);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.point.rotationX, [1, 0, 0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, this.point.rotationY, [0, 1, 0]);
    gl.uniformMatrix4fv(preShader.uniform['u_ModelViewMatrix'], false, modelViewMatrix);

    // light
    light.setUniforms(preShader.uniform);
    // transform model normal
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(preShader.uniform['u_NormalMatrix'], false, normalMatrix);

    // console.log(this.point.indices.length);
    gl.drawElements(gl.POINTS, this.point.indices.length, gl.UNSIGNED_SHORT, 0);
  }

window.Light = Light;
})(window);