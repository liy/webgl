function RenderTarget(renderer){
  this.program = gl.createProgram();

  this.bits = gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT;
}
var p = RenderTarget.prototype;

p.render = function(scene, camera){
}