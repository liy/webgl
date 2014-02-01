function Camera(){
  Object3D.call(this);

  this.projectionMatrix = new Mat4();
  this.invertProjectionMatrix = new Mat4();
  this.viewMatrix = new Mat4();

  this.lookTarget = new Vec3();
  this.up = new Vec3(0, 1, 0);
}
var p = Camera.prototype = Object.create(Object3D.prototype);

// TODO: camera update matrix needs more work
p.update = function(){
  if(this.autoMatrix){
    // mat4.identity(this._matrix);
    // mat4.translate(this._matrix, this._matrix, this._position);
    // mat4.rotateX(this._matrix, this._matrix, this._rotationX);
    // mat4.rotateY(this._matrix, this._matrix, this._rotationY);
    // mat4.rotateZ(this._matrix, this._matrix, this._rotationZ);

    this._matrix.identity();
    this._matrix.translate(this._position);
    this._matrix.rotateX(this._rotationX);
    this._matrix.rotateY(this._rotationY);
    this._matrix.rotateZ(this._rotationZ);
  }

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // invert the translation, since this is the view matrix, move camera left means move object right
  Mat4.invert(this.viewMatrix, this.worldMatrix);
  this.viewMatrix.lookAt(this._position, this.lookTarget, this.up);

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}

p.uploadUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ProjectionMatrix'], false, this.projectionMatrix.m);
  gl.uniformMatrix4fv(shader.uniforms['u_InvProjectionMatrix'], false, this.invertProjectionMatrix.m);
  gl.uniformMatrix4fv(shader.uniforms['u_ViewMatrix'], false, this.viewMatrix.m);
}