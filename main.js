"use strict"
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var renderer = new DeferredRenderer();

var file = new ObjectFile();
file.load('../webgl-meshes/head/head.obj').then(function(loader){
  console.log('loaded', loader)
}).catch(function(error){
  console.log('error');
})