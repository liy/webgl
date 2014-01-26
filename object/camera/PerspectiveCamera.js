// TODO: make it base class of 2 types of camera, perspective and orthogonal
function PerspectiveCamera(viewAngle, aspectRatio, near, far){
  Camera.call(this);

  this.perspective(viewAngle, aspectRatio, near, far);
}
var p = PerspectiveCamera.prototype = Object.create(Camera.prototype);

p.perspective = function(viewAngle, aspectRatio, near, far){
  this.viewAngle = viewAngle || Math.PI/3;
  this.aspectRatio = aspectRatio || window.innerWidth/window.innerHeight;
  this.near = near || 0.1;
  this.far = far || 400;

  mat4.perspective(this.projectionMatrix, this.viewAngle, this.aspectRatio, this.near, this.far);
  mat4.invert(this.invertProjectionMatrix, this.projectionMatrix);
}