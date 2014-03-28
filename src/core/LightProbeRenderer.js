define(function(require){
"use strict"

var LightProbeRenderer = function(framebuffer){
  this.framebuffer = framebuffer;
}
var p = LightProbeRenderer.prototype;

p.render = function(scene){
  var len = scene.lightProbes.length;
  for(var i=0; i<len; ++i){
    scene.lightProbes[i].capture(scene);
  }
}

return LightProbeRenderer;
})