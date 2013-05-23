function Renderer(){
  this.canvas = document.createElement('canvas');
  gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  this.ext = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.resize(window.innerWidth, window.innerHeight);

  // always have a scene target
  this.sceneTarget = new SceneTarget(this);

  // render targets
  this.targets = [new NormalTarget(this), new AlbedoTarget(this)];

  this.mrtDebugger = new MRTDebugger(this);
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
  // update matrix
  this.update(scene, camera);

  // draw to render target, normal, depth, albedo, etc.
  var len = this.targets.length;
  for(var i=0; i<len; ++i){
    this.targets[i].render(scene, camera);
  }

  // draw to screen.
  this.sceneTarget.render(scene, camera);

  // debug mrt
  this.mrtDebugger.draw();
}

p.resize = function(width, height){
  this.canvas.width = width;
  this.canvas.height = height;
  gl.viewport(0, 0, width, height);
}