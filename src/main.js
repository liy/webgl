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


var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );



});