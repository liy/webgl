"use strict";

// requirejs configurations.
require.config({
  paths: {
    // requirejs text plugin, for loading shader code.
    "text" : "../lib/text"
  }
});

define(function(require){

var DeferredRenderer = require('core/DeferredRenderer');
var Scene = require('object/Scene');
var PerspectiveCamera = require('object/camera/PerspectiveCamera');
var DirectionalLight = require('object/light/DirectionalLight');
var PointLight = require('object/light/PointLight');
var ObjectFile = require('assets/loader/ObjectFile');
var SkyBox = require('object/SkyBox');

var Shader = require('assets/resource/Shader');
var NativeLoader = require('assets/loader/NativeLoader');
var ImageResource = require('assets/resource/ImageResource');
var Library = require('assets/Library');
var TextureCube = require('texture/TextureCube');
var LightProbe = require('object/LightProbe');


var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);


var renderer = new DeferredRenderer();

var scene = new Scene();
var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.01, 50);
camera.z = 0.5;
scene.add(camera);

var dirLight = new DirectionalLight();
scene.add(dirLight);

var p = new PointLight();
scene.add(p);
p.x = -0.3;
vec3.set(p.color, 1, 0, 0);

var probe = new LightProbe();
probe.x = 1;
scene.add(probe);

var loader = new ObjectFile();
loader.load('../webgl-meshes/head/head.obj').then(function(){
  scene.add(loader.object);
});

var skybox = new SkyBox([
  {resource: Library.get('../webgl-meshes/cube_map/posx.jpg'), target: gl.TEXTURE_CUBE_MAP_POSITIVE_X},
  {resource: Library.get('../webgl-meshes/cube_map/negx.jpg'), target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
  {resource: Library.get('../webgl-meshes/cube_map/posy.jpg'), target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
  {resource: Library.get('../webgl-meshes/cube_map/negy.jpg'), target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
  {resource: Library.get('../webgl-meshes/cube_map/posz.jpg'), target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
  {resource: Library.get('../webgl-meshes/cube_map/negz.jpg'), target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z}
]);
scene.add(skybox);

function loop(){
  stats.begin();

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(loop);
}
loop();


});
