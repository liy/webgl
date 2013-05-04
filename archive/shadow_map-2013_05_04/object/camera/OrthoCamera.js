function OrthoCamera(){
  Camera.call(this);

  mat4.ortho(this.projectionMatrix, -1, 1, 1, -1, 0.1, 100);
}
var p = OrthoCamera.prototype = Object.create(Camera.prototype);

// camera use look at method to update its matrix, so its matrix is actually the view matrix.
p.updateMatrix = function(){
  // TODO: do nothing.
}