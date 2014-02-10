function ScreenPass(){
  RenderPass.call(this);
}
var p = ScreenPass.prototype = Object.create(RenderPass.prototype)

p.render = function(){
  
}