// TODO: make it base class of 2 types of camera, perspective and orthogonal
function PerspectiveCamera(fieldOfView, aspectRatio, near, far){
  Camera.call(this);

  this.perspective(fieldOfView, aspectRatio, near, far);
}
var p = PerspectiveCamera.prototype = Object.create(Camera.prototype);

p.perspective = function(fieldOfView, aspectRatio, near, far){
  this.fieldOfView = fieldOfView || Math.PI/3;
  this.aspectRatio = aspectRatio || window.innerWidth/window.innerHeight;
  this.near = near || 0.1;
  this.far = far || 400;

  mat4.perspective(this.projectionMatrix, this.fieldOfView, this.aspectRatio, this.near, this.far);
  mat4.invert(this.invertProjectionMatrix, this.projectionMatrix);
}

p.uploadUniforms = function(shader){
  Camera.prototype.uploadUniforms.call(this, shader);

  // Extra properties pass to shader. Used by directional light shader.
  gl.uniform1f(shader.uniforms['u_FieldOfView'], this.fieldOfView);
  gl.uniform1f(shader.uniforms['u_AspectRatio'], this.aspectRatio);
  gl.uniform1f(shader.uniforms['u_Near'], this.near);
  gl.uniform1f(shader.uniforms['u_Far'], this.far);

  // console.log(this.near);
}