"use strict";

// requirejs configurations.
({
  paths: {

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


var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );



// crytek-sponzatextures/background.tga
var jpg = new ImageResource('../webgl-meshes/cube_map/posx.jpg');
var tga = new ImageResource('../webgl-meshes/crytek-sponza/textures/background.tga');



var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');


var dbExt = gl.getExtension("WEBGL_draw_buffers");
var dtExt = gl.getExtension("WEBGL_depth_texture");
var vaoExt = gl.getExtension("OES_vertex_array_object");

var shader = new Shader('src/shader/geometry.vert', 'src/shader/geometry.frag');

var p = Promise.all([jpg.ready, tga.ready, shader.ready]).then(function(arr){
  console.log('all loaded', arr[0].width, arr[1].width, arr[2]);
});

});