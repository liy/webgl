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


var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
window.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

var dbExt = gl.getExtension("WEBGL_draw_buffers");
var dtExt = gl.getExtension("WEBGL_depth_texture");
var vaoExt = gl.getExtension("OES_vertex_array_object");

var supportedNames = gl.getSupportedExtensions();

// include extensions' properties into gl, for convenience reason.
var exts = [dbExt, dtExt, vaoExt];
for(var i=0; i<exts.length; ++i){
  var ext = exts[i];
  for(var name in ext){
    if(gl[name] === undefined){
      if(ext[name] instanceof Function){
        (function(e, n){
          gl[n] = function(){
            return e[n].apply(e, arguments);
          }
        })(ext, name);
      }
      else
        gl[name] = ext[name];
    }
    else
      console.error('gl conflict name in extension: ' + ext +' name: ' + name);
  }
}

var shader = new Shader('src/shader/geometry.vert', 'src/shader/geometry.frag');
shader.load()
      .then(function(s){
        console.log('shader loaded', s);
      });

});