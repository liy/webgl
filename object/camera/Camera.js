function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  this.lookTarget = vec3.fromValues(0,0,-1);
  this.viewMatrix = mat4.create();
}
var p = Camera.prototype = Object.create(Object3D.prototype);

// TODO: camera update matrix needs more work
// camera's 'worldMatrix' is actually the view matrix.
// I've temporarily removed lookAt method to apply the rotation, just for simplicity reason
p.update = function(camera){
  if(this.autoMatrix){
    mat4.identity(this._matrix);
    mat4.translate(this._matrix, this._matrix, this._position);
    mat4.rotateX(this._matrix, this._matrix, this._rotationX);
    mat4.rotateY(this._matrix, this._matrix, this._rotationY);
    mat4.rotateZ(this._matrix, this._matrix, this._rotationZ);
  }

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // invert the translation, since this is the view matrix, move camera left means move object right
  mat4.invert(this.viewMatrix, this.worldMatrix);

  mat4.lookAt(this.viewMatrix, this._position, this.lookTarget, [0, 1, 0]);

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix(camera);
}

// set projection matrix uniform
p.setUniforms = function(shader){
  // set shadow mapping projection matrix, for rendering the shadow map
  gl.uniformMatrix4fv(shader.uniforms['u_ProjectionMatrix'], false, this.projectionMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_ViewMatrix'], false, this.viewMatrix);
}