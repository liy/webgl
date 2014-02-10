function LightPass(){
  RenderPass.call(this);
}
var p = LightPass.prototype = Object.create(RenderPass.prototype);

p.render = function(){
  
}