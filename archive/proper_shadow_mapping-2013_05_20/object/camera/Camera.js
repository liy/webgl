// TODO: make it base class of 2 types of camera, perspective and orthogonal
function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  this.lookAt = vec3.fromValues(0, 0, -1);
}
var p = Camera.prototype = Object.create(Object3D.prototype);

// camera use look at method to update its matrix, so its matrix is actually the view matrix.
p.updateMatrix = function(){
  // transform this matrix
  mat4.identity(this.matrix);
  mat4.translate(this.matrix, this.matrix, this.position);
  // invert the translation, since this is the view matrix, move camera left means move object right
  mat4.invert(this.matrix, this.matrix);
  // apply look at matrix, that is the rotation matrix
  mat4.lookAt(this.matrix, this.position, this.lookAt, [0, 1, 0]);

  // update the world matrix apply to this object
  this._updateWorldMatrix();


  // update the matrix of its children, deep first traversing.
  this._updateChildrenMatrix();
}

// set projection matrix uniform
p.project = function(shader){
  // set shadow mapping projection matrix, for rendering the shadow map
  gl.uniformMatrix4fv(shader.uniform['u_ProjectionMatrix'], false, this.projectionMatrix);
}