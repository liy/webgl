// by default position directional light, from (1, 1, 1)
function Light(){
  Object3D.call(this);

  this.enabled = true;

  // whether this light cast shadow or not
  this._castShadow = false;
  this.framebufferSize = 512;

  // vec4
  this.ambient = vec4.fromValues(0.1, 0.1, 0.1, 1.0);
  // vec4
  this.diffuse = vec4.fromValues(0.95, 0.95, 0.95, 1.0);
  // vec4
  this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec3, constant, linear and quadratic
  this.attenuation = vec3.fromValues(1, 0, 0);
  // vec3
  // if any of x, y, z are non-zero, it is spot light
  this.direction = vec3.create();
  this._transformedDirection = vec3.create();

  // shadow map requires the view matrix from the light
  this._viewMatrix = mat4.create();
  this._projectionMatrix = mat4.create();
  this._camera = new PerspectiveCamera(this._outerRadian*2, 1);

  this._modelViewMatrix = mat4.create();

  // if 0, then this light is a directional, if it 1, it is a point or spot light
  this.directional = 1;
}
var p = Light.prototype = Object.create(Object3D.prototype);

p.lit = function(shader, camera){
  // transform light position to eye coordinate
  this._trasnformedPosition = vec3.create();
  // vec3.transformMat4(this._trasnformedPosition, [0, 0, 0], this._modelViewMatrix);
  vec3.transformMat4(this._trasnformedPosition, this.position, camera.matrix);

  gl.uniform4fv(shader.uniform['u_Light.position'], [this._trasnformedPosition[0], this._trasnformedPosition[1], this._trasnformedPosition[2], this.directional]);
  gl.uniform4fv(shader.uniform['u_Light.ambient'], this.ambient);
  gl.uniform4fv(shader.uniform['u_Light.diffuse'], this.diffuse);
  gl.uniform4fv(shader.uniform['u_Light.specular'], this.specular);
  gl.uniform3fv(shader.uniform['u_Light.attenuation'], this.attenuation);
  gl.uniform3fv(shader.uniform['u_Light.direction'], this._transformedDirection);
  gl.uniform1i(shader.uniform['u_Light.enabled'], this.enabled);
}

Object.defineProperty(p, "castShadow", {
  set: function(value){
    // do nothing if not state changes.
    if(this._castShadow == value) return;

    // if cast shadow, create related depth texture and framebuffer
    if(value){
      // depth texture
      this.depthTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.framebufferSize, this.framebufferSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

      // color texture is required by framebuffer by default.
      this.colorTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.framebufferSize, this.framebufferSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // delete original texture and framebuffer
    else{
      gl.deleteTexture(this.depthTexture);
      gl.deleteFramebuffer(this.framebuffer);
    }

    this._castShadow = value;
  },
  get: function(){
    return this._castShadow;
  }
});

Object.defineProperty(p, "viewMatrix", {
  get: function(){
    // apply the current transformation to the direction first.
    vec3.transformMat4(this._transformedDirection, this.direction, this.matrix);
    mat4.lookAt(this._viewMatrix, this.position, this._transformedDirection, [0, 1, 0]);
    return this._viewMatrix;
  }
});