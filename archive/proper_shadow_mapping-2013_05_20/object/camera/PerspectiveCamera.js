// TODO: make it base class of 2 types of camera, perspective and orthogonal
function PerspectiveCamera(viewAngle, aspectRatio, near, far){
  Camera.call(this);

  this.perspective(viewAngle, aspectRatio, near, far)
}
var p = PerspectiveCamera.prototype = Object.create(Camera.prototype);

p.perspective = function(viewAngle, aspectRatio, near, far){
  viewAngle = viewAngle || Math.PI/3;
  aspectRatio = aspectRatio || window.innerWidth/window.innerHeight;
  near = near || 0.1;
  far = far || 400;
  mat4.perspective(this.projectionMatrix, viewAngle, aspectRatio, near, far);
}