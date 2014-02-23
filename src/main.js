define(function(require){

var DeferredRenderer = require('core/DeferredRenderer');
var Scene = require('object/Scene');
var PerspectiveCamera = require('object/camera/PerspectiveCamera');
var DirectionalLight = require('object/light/DirectionalLight');
var PointLight = require('object/light/PointLight');
var ObjectFile = require('library/loader/ObjectFile');
var SkyBox = require('object/SkyBox');

"use strict"
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.01, 5);
var cameraRadian = 0.0;
var rotationRadius = 1.75;
// camera.y = -0.07;
camera.z = rotationRadius;
function rotateCamera(){
  cameraRadian += 0.003;
  camera.x = Math.cos(cameraRadian) * rotationRadius;
  camera.z = Math.sin(cameraRadian) * rotationRadius;
}
camera.lookTarget = vec3.fromValues(0, camera.y, 0);
scene.add(camera);

var p3 = new DirectionalLight();
p3.z = 1;
p3.x = 1;
p3.y = 1;
scene.add(p3);

// var p1 = new PointLight();
// p1.x = 0.2;
// p1.z = 0.2;
// p1.color = vec3.fromValues(1.0, 0.2, 0.0);

// var p2 = new PointLight();
// p2.x = -0.2;
// p2.z = 0.2;
// p2.color = vec3.fromValues(0.0, 0.8, 1.0);

// scene.add(p1);
// scene.add(p2);


var loader = new ObjectFile();
loader.load("../webgl-meshes/head/head.obj");
var obj = loader.object;
obj.x = 0.6;
scene.add(obj);


// var probe = new LightProbe();
// scene.add(probe);

var skyBox = new SkyBox([
  {url: "../webgl-meshes/cube_map/posx.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_X},
  {url: "../webgl-meshes/cube_map/negx.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
  {url: "../webgl-meshes/cube_map/posy.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
  {url: "../webgl-meshes/cube_map/negy.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
  {url: "../webgl-meshes/cube_map/posz.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
  {url: "../webgl-meshes/cube_map/negz.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z}
]);
scene.add(skyBox);

function render(){
  stats.begin();

  rotateCamera();

  // obj.rotationY += 0.003;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();

});