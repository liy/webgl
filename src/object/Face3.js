define(function(require){

"use strict"
/**
 * 3D face
 * @param {[type]} a 1st vertex index of the geometry
 * @param {[type]} b 2nd vertex index of the geometry
 * @param {[type]} c 3rd vertex index of the geometry
 */
var Face3 = function(a, b, c){
  this.a = a;
  this.b = b;
  this.c = c;

  this.normal = vec3.create();
}
var p = Face3.prototype;

return Face3;

});