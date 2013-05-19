// by default position directional light, from (1, 1, 1)
function SpotLight(){
  Light.call(this);

  // vec3
  // if any of x, y, z are non-zero, it is spot light
  this.direction = vec3.fromValues(0, 0, -1);
  this._transformedDirection = vec3.create();

  // internal spot fall off
  this._cosOuter = 0;
  this._cosInner = 0;
  this._outerRadian = 0;
  this._innerRadian = 0;

  this.outerRadian = Math.PI/4;
  this.innerRadian = Math.PI/10;

  // light camera's matrix will be the view matrix.
  // It also contains projection matrix.
  this.shadowCamera = new PerspectiveCamera(this._outerRadian*2, 1);

  this._modelViewMatrix = mat4.create();

  // if 0, then this light is a directional, if it 1, it is a point or spot light
  this.directional = 1;

  this.framebufferSize = 512;
}
var p = SpotLight.prototype = Object.create(Light.prototype);

p.updateMatrix = function(){
  // transform this matrix
  mat4.identity(this.matrix);
  mat4.translate(this.matrix, this.matrix, this.position);
  mat4.rotateX(this.matrix, this.matrix, this.rotationX);
  mat4.rotateY(this.matrix, this.matrix, this.rotationY);
  mat4.rotateZ(this.matrix, this.matrix, this.rotationZ);

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();

  // sync camera view matrix and projection matrix
  vec3.transformMat4(this._transformedDirection, this.direction, this.matrix);
  mat4.lookAt(this.shadowCamera.matrix, this.position, this._transformedDirection, [0, 1, 0]);
  this.shadowCamera.perspective(this._outerRadian*2, 1);
}

// active the correct texture and setup view and projection matrix for shadow
p.shadowMapping = function(shader, index){
  if(this.castShadow){
    gl.activeTexture(gl.TEXTURE1 + index);
    gl.uniform1i(shader.uniform['u_ShadowMap'], 1+index);
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);

    // setup light view and projection matrix for shadow mapping
    gl.uniformMatrix4fv(shader.uniform['u_LightViewMatrix'], false, this.shadowCamera.matrix);
    gl.uniformMatrix4fv(shader.uniform['u_LightProjectionMatrix'], false, this.shadowCamera.projectionMatrix);

    // reset to texture 0
    gl.activeTexture(gl.TEXTURE0);
  }
}

p.lit = function(shader, camera){
  // calculate model view matrix
  mat4.mul(this._modelViewMatrix, camera.matrix, this.matrix);

  // transform light direction to eye coordinate
  var directionMatrix = mat3.create();
  mat3.normalFromMat4(directionMatrix, this._modelViewMatrix);
  vec3.transformMat3(this._transformedDirection, this.direction, directionMatrix);

  // transform light position to eye coordinate
  this._trasnformedPosition = vec3.create();
  vec3.transformMat4(this._trasnformedPosition, this.position, camera.matrix);

  gl.uniform4fv(shader.uniform['u_Light.position'], [this._trasnformedPosition[0], this._trasnformedPosition[1], this._trasnformedPosition[2], this.directional]);
  gl.uniform4fv(shader.uniform['u_Light.ambient'], this.ambient);
  gl.uniform4fv(shader.uniform['u_Light.diffuse'], this.diffuse);
  gl.uniform4fv(shader.uniform['u_Light.specular'], this.specular);
  gl.uniform3fv(shader.uniform['u_Light.attenuation'], this.attenuation);
  gl.uniform3fv(shader.uniform['u_Light.direction'], this._transformedDirection);
  gl.uniform1f(shader.uniform['u_Light.cosOuter'], this._cosOuter);
  gl.uniform1f(shader.uniform['u_Light.cosFalloff'], this._cosOuter - this._cosInner);
  gl.uniform1i(shader.uniform['u_Light.enabled'], this.enabled);
}

Object.defineProperty(p, "outerRadian", {
  set: function(value){
    this._outerRadian = value;
    this._cosOuter = Math.cos(this._outerRadian);
  },
  get: function(){
    return this._outerRadian;
  }
});

Object.defineProperty(p, "innerRadian", {
  set: function(value){
    this._innerRadian = value;
    this._cosInner = Math.cos(this._innerRadian);
  },
  get: function(){
    return this._innerRadian;
  }
});