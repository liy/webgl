function Camera(){
  Object3D.call(this);

  this.projectionMatrix = mat4.create();
  mat4.perspective(this.projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 400);

  this.viewMatrix = mat4.create();
}
var p = Camera.prototype = Object.create(Object3D.prototype);

p.setUniform = function(uniform){
  gl.uniformMatrix4fv(uniform['u_ProjectionMatrix'], false, this.projectionMatrix);
}

p.lookAt = function(target){
  mat4.lookAt(this.viewMatrix, this.position, target, [0, 1, 0]);
}