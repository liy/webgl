function RenderTarget(renderer){
  this.program = gl.createProgram();

  this.renderer = renderer;
  this.shader = null;
  this.framebuffer = null;
}
var p = RenderTarget.prototype;

p.render = function(scene, camera){
}