function OrthoCamera(left, right, bottom, top){
  Camera.call(this);

  left = left || -1;
  right = right || 1;
  bottom = bottom || -1;
  top = top || 1;

  mat4.ortho(this.projectionMatrix, left, right, bottom, top, -10, 10);
}
var p = OrthoCamera.prototype = Object.create(Camera.prototype);

// camera use look at method to update its matrix, so its matrix is actually the view matrix.
// p.updateMatrix = function(){
//   // TODO: do nothing.
// }

p.ortho = function(left, right, bottom, top){
  mat4.ortho(this.projectionMatrix, left, right, bottom, top, -10, 10);
}