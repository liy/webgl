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

  this.outerRadian = Math.PI/9;
  this.innerRadian = Math.PI/10;

  // shadow map requires the view matrix from the light
  this._viewMatrix = mat4.create();
  this._projectionMatrix = mat4.create();

  this._camera = new PerspectiveCamera(this._outerRadian*2, 1);
  this.add(this._camera);

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
  // TODO: scale

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();

  // camera's matrix will be updated by this._updateChildrenMatrix()
  // this.camera.updateMatrix();
  // apply the current transformation to the direction first.
  vec3.transformMat4(this._transformedDirection, this.direction, this.matrix);
  mat4.lookAt(this._viewMatrix, this.position, this._transformedDirection, [0, 1, 0]);
  // override the perspective camera matrix to be the light's view matrix.
  this._camera.matrix = this._viewMatrix;
  this._camera.perspective(this._outerRadian*2, 1);

  // console.log(this._viewMatrix);
}

p.shadow = function(shader){
  // shadow map related
  if(this.castShadow){
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.framebufferSize, this.framebufferSize);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // console.log(this._camera.worldMatrix);

    gl.uniformMatrix4fv(shader.uniform['u_LightViewMatrix'], false, this._camera.worldMatrix);
    gl.uniformMatrix4fv(shader.uniform['u_LightProjectionMatrix'], false, this._camera.projectionMatrix);
  }
}

p.lit = function(shader, camera){
  // calculate model view matrix
  mat4.mul(this._modelViewMatrix, camera.matrix, this.matrix);

  // transform direction to eye coordinate
  var directionMatrix = mat3.create();
  mat3.normalFromMat4(directionMatrix, this._modelViewMatrix);
  vec3.transformMat3(this._transformedDirection, this.direction, directionMatrix);

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
  gl.uniform1f(shader.uniform['u_Light.cosOuter'], this._cosOuter);
  gl.uniform1f(shader.uniform['u_Light.cosFalloff'], this._cosOuter - this._cosInner);
  gl.uniform1i(shader.uniform['u_Light.enabled'], this.enabled);
}

p.getProjectionMatrix = function(near, far){
  ma4.perspective(this._projectionMatrix, this._outerRadian*2, 1, near, far);
  return this._projectionMatrix;
}

Object.defineProperty(p, "viewMatrix", {
  get: function(){

    return this._viewMatrix;
  }
});

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