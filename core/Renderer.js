function Renderer(){
}
var p = Renderer.prototype;

p.render = function(scene, shader, camera){
  // TODO: sort the list first.

  var len = scene.sortList.length;
  for(var i=0; i<len; ++i){
    scene.sortList[i].render(shader, camera);
  }
}