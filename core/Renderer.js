function Renderer(){
  this.canvas = document.createElement('canvas');
  gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  this.depthTextureExt = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  this.resize(window.innerWidth, window.innerHeight);

  // the depth buffer shared by all the passes
  this.depthBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.canvas.width, this.canvas.height);

  // multiple render passes, since no multiple render target support in WebGL
  this.passes = [new DepthPass(this), new NormalPass(this), new AlbedoPass(this), new PositionalLightPass(this)];

  // this.lighting = new PositionalLightPass(this);

  // Final composition, probably include post processing?
  // this.composition = new Composition(this);

  this.mrtDebugger = new MRTDebugger(this);
}
var p = Renderer.prototype;

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

  // calculate extra normal, model view matrix and view space position of the meshes
  len = scene.meshes.length;
  for(i=0; i<len; ++i){
    // update to model view matrix
    mat4.mul(scene.meshes[i].modelViewMatrix, camera.worldMatrix, scene.meshes[i].worldMatrix);
    // console.log(scene.meshes[i].modelViewMatrix);
    // normal matrix, it is inverse transpose of the model view matrix
    mat3.normalFromMat4(scene.meshes[i].modelViewMatrixInverseTranspose, scene.meshes[i].modelViewMatrix);
    // calculate the view space position of the meshes, for states sorting
    vec3.transformMat4(scene.meshes[i]._viewSpacePosition, Object3D.origin, scene.meshes[i].modelViewMatrix);
  }

  // update lights' extra matrix
  len = scene.lights.length;
  for(i=0; i<len; ++i){
    mat4.mul(scene.lights[i].modelViewMatrix, camera.worldMatrix, scene.lights[i].worldMatrix);
    vec3.transformMat4(scene.lights[i]._viewSpacePosition, Object3D.origin, scene.lights[i].modelViewMatrix);
  }

  // do the state sorting
  scene.meshes.sort(sortFunc);

  // Fill G-Buffer, draw to render target, normal, depth, albedo, etc.
  len = this.passes.length;
  for(i=0; i<len; ++i){
    this.passes[i].render(scene, camera);
  }

  // do lighting
  // this.lighting.render(scene, camera);

  // combine all the textures rendered by different passes into final screen image
  // this.composition.render(scene, camera);

  // debug mrt
  this.mrtDebugger.render();
}

p.resize = function(width, height){
  this.canvas.width = width;
  this.canvas.height = height;
  gl.viewport(0, 0, width, height);
}

function sortFunc(a, b){
  // if(a.translucent != b.translucent){
  //   if(b.translucent)
  //     return 1;
  //   else
  //     return -1;
  // }

  // if(a.texture != b.texture){
  //   if(a.texture < b.texture)
  //     return 1;
  //   else
  //     return -1;
  // }

  // if(a.depth != b.depth){
  //   if(a.depth < b.depth)
  //     return (a.translucent) ? -1 : 1;
  //   else if(a.depth == b.depth)
  //     return 0;
  //   else
  //     return (!a.translucent) ? -1 : 1;
  // }

  // return 0;

  if(a._viewSpacePosition[2] < b._viewSpacePosition[2])
    return 1;
  else if(a._viewSpacePosition[2] > b._viewSpacePosition[2])
    return -1
  else
    return 0;
}