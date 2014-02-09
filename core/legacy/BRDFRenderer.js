function BRDFRenderer(){
  this.canvas = document.createElement('canvas');
  gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  this.depthTextureExt = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');

  this._program = gl.createProgram();
  this.shader = new Shader(this._program, 'shader/brdf.vert', 'shader/brdf.frag');
  gl.useProgram(this._program);
  this.shader.locateAttributes(this._program);
  this.shader.locateUniforms(this._program);

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.resize(window.innerWidth, window.innerHeight);
}
var p = BRDFRenderer.prototype;

p.update = function(scene){
  var len = scene.children.length;
  for(var i=0; i<len; ++i){
    // update all objects, to world space.
    scene.children[i].updateMatrix();
  }
}

p.render = function(scene, camera){
  var i, len;

  // update all objects' matrix in the scene, include lights and cameras
  this.update(scene);

  gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.setUniforms(this.shader.uniforms);

  var len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    scene.meshes[i].draw(this.shader, camera);
  }
}

p.resize = function(width, height){
  this.canvas.width = width;
  this.canvas.height = height;
  gl.viewport(0, 0, width, height);
}