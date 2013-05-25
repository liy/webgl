// TODO: make it base class of 2 types of camera, perspective and orthogonal
function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
}
var p = Camera.prototype = Object.create(Object3D.prototype);

// camera use look at method to update its matrix, so its 'worldMatrix' is actually the view worldMatrix.
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

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}

// set projection matrix uniform
p.project = function(shader){
  // set shadow mapping projection matrix, for rendering the shadow map
  gl.uniformMatrix4fv(shader.uniform['u_ProjectionMatrix'], false, this.projectionMatrix);
}