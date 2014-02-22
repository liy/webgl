"use strict"
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var loader = new Loader();
loader.load('shader/geometry.frag').then(function(rep){
  console.log(rep)
}, function(err){
  console.log(err)
})