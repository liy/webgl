function RenderPass(renderer){
  this.program = gl.createProgram();

  this.renderer = renderer;
  this.shader = null;
  this.framebuffer = null;
}
var p = RenderPass.prototype;

p.render = function(scene, camera){
}