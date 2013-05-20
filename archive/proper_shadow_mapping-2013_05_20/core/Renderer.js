function Renderer(){
  this.canvas = document.createElement('canvas');
  gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  this.ext = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // render targets
  this.targets = [];
  // shadow target, render depth texture
  this.targets.push(new ShadowMapTarget(this));
  // final scene render target, renders the final scene using the depth texture
  this.targets.push(new SceneTarget(this));

  this.resize(window.innerWidth, window.innerHeight);
}
var p = Renderer.prototype;

p.update = function(scene, camera){
  var len = scene.children.length;
  for(var i=0; i<len; ++i){
    // update all objects, to world space.
    scene.children[i].updateMatrix();
  }

  // TODO: sort the list first.
  scene.sort();
}

p.render = function(scene, camera){
  this.update(scene, camera);

  // draw shadow, scene, etc.
  var len = this.targets.length;
  for(var i=0; i<len; ++i){
    this.targets[i].render(scene, camera);
  }
}

p.resize = function(width, height){
  this.canvas.width = width;
  this.canvas.height = height;
  gl.viewport(0, 0, width, height);
}