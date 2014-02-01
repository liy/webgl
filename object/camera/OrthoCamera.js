function OrthoCamera(left, right, bottom, top){
  Camera.call(this);

  left = left || -1;
  right = right || 1;
  bottom = bottom || -1;
  top = top || 1;

  // mat4.ortho(this.projectionMatrix, left, right, bottom, top, -10, 10);
  this.ortho(this.projectionMatrix, left, right, bottom, top, -10, 10)
}
var p = OrthoCamera.prototype = Object.create(Camera.prototype);

p.ortho = function(left, right, bottom, top){
  this.projectionMatrix.ortho(left, right, bottom, top, -10, 10);
}