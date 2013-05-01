function Renderer(){
}
var p = Renderer.prototype;

// TODO: remove shader from the parameter
p.render = function(scene, shader, camera){
  var len = scene.children.length;
  var i;
  for(i=0; i<len; ++i){
    // update all objects, to world space.
    scene.children[i].updateMatrix();
  }

  // TODO: sort the list first.
  scene.sort();

  len = scene.sortList.length;
  for(i=0; i<len; ++i){
    scene.sortList[i].render(shader, camera);
  }
}