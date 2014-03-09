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




var uniformRegex = /uniform\s+(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube)\s+([\w\,]+)?(\[.*?\])?\s*(:\s*([\S\s]+?))?;/g;
var attributeRegex = /attribute\s+(float|int|vec2|vec3|vec4)\s+(\w*)\s*(:\s*(\w+))?;/g;
var defineRegex = /#define\s+(\w+)?(\s+[\w-.]+)?\s*\n/g;

var uniformRegex = /uniform +(bool|float|int|vec2|vec3|vec4|ivec2|ivec3|ivec4|mat2|mat3|mat4|sampler2D|samplerCube) +(\w+)(?:\[(.+)\])? *(?:: *(.+))?;/g;
// attribute vec3 position : POSITION;
var attributeRegex = /attribute +(float|int|vec2|vec3|vec4) +(\w+) *(?:: *(.+))?;/g;
var defineRegex = /#define +(\w+)/

var uniformTypeMap = {
    "bool" : "1i",
    "int" : "1i",
    "sampler2D" : "t",
    "samplerCube" : "t",
    "float" : "1f",
    "vec2" : "2f",
    "vec3" : "3f",
    "vec4" : "4f",
    "ivec2" : "2i",
    "ivec3" : "3i",
    "ivec4" : "4i",
    "mat2" : "m2",
    "mat3" : "m3",
    "mat4" : "m4"
}
var uniformValueConstructor = {
    'bool' : function() {return true;},
    'int' : function() {return 0;},
    'float' : function() {return 0;},
    'sampler2D' : function() {return null;},
    'samplerCube' : function() {return null;},

    'vec2' : function() {return [0, 0];},
    'vec3' : function() {return [0, 0, 0];},
    'vec4' : function() {return [0, 0, 0, 0];},

    'ivec2' : function() {return [0, 0];},
    'ivec3' : function() {return [0, 0, 0];},
    'ivec4' : function() {return [0, 0, 0, 0];},

    'mat2' : function() {return mat2.create();},
    'mat3' : function() {return mat3.create();},
    'mat4' : function() {return mat4.create();},

    'array' : function() {return [];}
}

var testVertSource = require('text!shader/test.vert');

var _uniformList = [];
var _textureStatus = [];

testVertSource.replace(attributeRegex, parseAttribute);

function parseUniform(str, type, symbol, array, semantic){
  console.log(' |str| ' + str + ' |type| ' + type + ' |symbol| ' + symbol + ' |array| ' + array + ' |semantic| ' + semantic);
}

function parseAttribute(str, type, symbol, semantic){
  console.log(' |str| ' + str + ' |type| ' + type + ' |symbol| ' + symbol + ' |semantic| ' + semantic);
}

function parseDefine(str) {

}


console.log(parseFloat('12/3'));



});
