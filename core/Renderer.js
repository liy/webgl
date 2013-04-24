function Renderer(){
}
var p = Renderer.prototype;

// TODO: remove shader from the parameter
p.render = function(scene, shader, camera){
  // TODO: sort the list first.
  scene.sort();

  var len = scene.sortList.length;
  for(var i=0; i<len; ++i){
    scene.sortList[i].render(shader, camera);
  }
}