define(function(require){
"use strict"

var ForwardRenderer = function(){

}
var p = ForwardRenderer.prototype;

p.render = function(scene, camera){
  // update the view dependent matrix
  scene.updateModelViewMatrix(camera);

}

return ForwardRenderer;
})

