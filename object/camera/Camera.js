function Camera(){
  Node.call(this);

  this.projectionMatrix = mat4.create();
  this.invertProjectionMatrix = mat4.create();
  this.lookTarget = null;
  this.viewMatrix = mat4.create();
  this.invertViewMatrix = mat4.create();
}
var p = Camera.prototype = Object.create(Node.prototype);

// TODO: camera update matrix needs more work
p.update = function(){
  if(this.autoMatrix){
    mat4.identity(this._matrix);
    mat4.translate(this._matrix, this._matrix, this._position);
    mat4.rotateX(this._matrix, this._matrix, this._rotationX);
    mat4.rotateY(this._matrix, this._matrix, this._rotationY);
    mat4.rotateZ(this._matrix, this._matrix, this._rotationZ);
  }
  // update the world matrix apply to this object
  this._updateWorldMatrix();

  if(this.lookTarget){
    // Use look at target to control camera's view matrix
    mat4.lookAt(this.viewMatrix, this._position, this.lookTarget, [0, 1, 0]);

    mat4.invert(this.invertViewMatrix, this.viewMatrix);
  }
  else{
    // Normal camera control, invert the translation, since this is the view matrix, move camera left means move object right
    mat4.invert(this.viewMatrix, this.worldMatrix);

    mat4.copy(this.invertViewMatrix, this.viewMatrix);
  }

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}

p.uploadUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ProjectionMatrix'], false, this.projectionMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_InvProjectionMatrix'], false, this.invertProjectionMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_ViewMatrix'], false, this.viewMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_InvViewMatrix'], false, this.invertViewMatrix);
}