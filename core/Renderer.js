function Renderer(){
  this.canvas = document.createElement('canvas');
  gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  this.ext = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.resize(window.innerWidth, window.innerHeight);

  // always have a scene target
  this.screenPass = new ScreenPass(this);
  // render targets
  this.targets = [new NormalPass(this), new AlbedoPass(this)];
  this.mrtDebugger = new MRTDebugger(this);

  this.vertexBuffer = gl.createBuffer();
  this.texCoordBuffer = gl.createBuffer();
  this.colorBuffer = gl.createBuffer();
  this.normalBuffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();
}
var p = Renderer.prototype;

p.update = function(scene, camera){
  var len = scene.children.length;
  for(var i=0; i<len; ++i){
    // update all objects, to world space.
    scene.children[i].updateMatrix();
  }
}

p.sort = function(scene, camera){
  var len = scene.sortList.length;
  scene.sortList.sort();
}

p.render = function(scene, camera){
  // update matrix
  this.update(scene, camera);

  // TODO: sort the list first.
  this.sort(scene, camera);

  // update buffer
  this.updateBuffer(scene);

  // draw to render target, normal, depth, albedo, etc.
  var len = this.targets.length;
  for(var i=0; i<len; ++i){
    this.targets[i].render(scene, camera);
  }

  // draw to screen.
  this.screenPass.render(scene, camera);

  // debug mrt
  this.mrtDebugger.draw();
}

p.updateBuffer = function(scene){
  if(scene.dirty){
    var vertexData = [];
    var texCoordData =[];
    var colorData = [];
    var normalData = [];
    var indexData = [];

    var len = scene.meshes.length;
    for(var i=0; i<len; ++i){
      // vertices information
      for(var j=0; j<scene.meshes[i].geometry.numVertices; ++j){
        // vertex
        vertexData.push(scene.meshes[i].geometry.vertices[j*3]);
        vertexData.push(scene.meshes[i].geometry.vertices[j*3+1]);
        vertexData.push(scene.meshes[i].geometry.vertices[j*3+2]);

        // uv
        texCoordData.push(scene.meshes[i].geometry.texCoords[j*2]);
        texCoordData.push(scene.meshes[i].geometry.texCoords[j*2+1]);

        // normal
        normalData.push(scene.meshes[i].geometry.normals[j*3]);
        normalData.push(scene.meshes[i].geometry.normals[j*3+1]);
        normalData.push(scene.meshes[i].geometry.normals[j*3+2]);

        // color, rgba
        colorData.push(scene.meshes[i].material.color[0])
        colorData.push(scene.meshes[i].material.color[1])
        colorData.push(scene.meshes[i].material.color[2])
        colorData.push(scene.meshes[i].material.color[3])
      }
    }

    // gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    scene.dirty = false;
  }
}

p.resize = function(width, height){
  this.canvas.width = width;
  this.canvas.height = height;
  gl.viewport(0, 0, width, height);
}