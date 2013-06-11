function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  this.lookTarget = vec3.fromValues(0,0,-1);
}
var p = Camera.prototype = Object.create(Object3D.prototype);

// TODO: camera update matrix needs more work
// camera's 'worldMatrix' is actually the view matrix.
// I've temporarily removed lookAt method to apply the rotation, just for simplicity reason
p.updateMatrix = function(){
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
  mat4.invert(this.worldMatrix, this.worldMatrix);

  mat4.lookAt(this.worldMatrix, this._position, this.lookTarget, [0, 1, 0]);

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}

// set projection matrix uniform
p.setUniforms = function(uniforms){
  // set shadow mapping projection matrix, for rendering the shadow map
  gl.uniformMatrix4fv(uniforms['u_ProjectionMatrix'], false, this.projectionMatrix);
  gl.uniformMatrix4fv(uniforms['u_ViewMatrix'], false, this.worldMatrix);
}