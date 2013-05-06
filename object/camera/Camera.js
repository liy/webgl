// TODO: make it base class of 2 types of camera, perspective and orthogonal
function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  this.lookAt = vec3.fromValues(0, 0, -1);
}
var p = Camera.prototype = Object.create(Object3D.prototype);

p.projection = function(uniform){
  gl.uniformMatrix4fv(uniform['u_ProjectionMatrix'], false, this.projectionMatrix);
}

// camera use look at method to update its matrix, so its matrix is actually the view matrix.
p.updateMatrix = function(){
  // transform this matrix
  mat4.identity(this.matrix);
  mat4.translate(this.matrix, this.matrix, this.position);
  mat4.lookAt(this.matrix, this.position, this.lookAt, [0, 1, 0]);

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}