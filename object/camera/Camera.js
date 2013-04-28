// TODO: make it base class of 2 types of camera, perspective and orthogonal
function Camera(viewAngle, aspectRatio){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  mat4.perspective(this.projectionMatrix, viewAngle, aspectRatio, 0.1, 400);

  this.lookAt = vec3.fromValues(0, 0, -1);
}
var p = Camera.prototype = Object.create(Object3D.prototype);

p.setUniform = function(uniform){
  gl.uniformMatrix4fv(uniform['u_ProjectionMatrix'], false, this.projectionMatrix);
}

// camera use look at method to update its matrix, so its matrix is actually the view matrix.
p.updateMatrix = function(){
  mat4.lookAt(this.matrix, this.position, this.lookAt, [0, 1, 0]);
}