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


var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');


var dbExt = gl.getExtension("WEBGL_draw_buffers");
var dtExt = gl.getExtension("WEBGL_depth_texture");
var vaoExt = gl.getExtension("OES_vertex_array_object");

// Library.init();
// Library.load().then(function(resources){
//   console.log('resources loaded', resources);
// })

var shader = new Shader();
shader.defines = {
  test: '10'
}
shader.compile(require('text!shader/test.vert'), require('text!shader/test.frag'));

});
