"use strict"
function SkyBoxGeometry(width, height, depth){
  Geometry.call(this);

  this.vertices = [
    // x y z   nx ny nz
    // front
    vec3.fromValues(-1, -1,  1),
    vec3.fromValues( 1, -1,  1),
    vec3.fromValues( 1,  1,  1),
    vec3.fromValues(-1,  1,  1),
    // back
    vec3.fromValues( 1, -1, -1),
    vec3.fromValues(-1, -1, -1),
    vec3.fromValues(-1,  1, -1),
    vec3.fromValues( 1,  1, -1),
    // top
    vec3.fromValues(-1,  1,  1),
    vec3.fromValues( 1,  1,  1),
    vec3.fromValues( 1,  1, -1),
    vec3.fromValues(-1,  1, -1),
    // bottom
    vec3.fromValues(-1, -1, -1),
    vec3.fromValues( 1, -1, -1),
    vec3.fromValues( 1, -1,  1),
    vec3.fromValues(-1, -1,  1),
    // left
    vec3.fromValues(-1, -1, -1),
    vec3.fromValues(-1, -1,  1),
    vec3.fromValues(-1,  1,  1),
    vec3.fromValues(-1,  1, -1),
    // right
    vec3.fromValues( 1, -1,  1),
    vec3.fromValues( 1, -1, -1),
    vec3.fromValues( 1,  1, -1),
    vec3.fromValues( 1,  1,  1),
  ];

  // revert the ordering
  this.indexData = [
    0,  2,  1,   0,  3,  2,  // front
    4,  6,  5,   4,  7,  6,  // back
    8,  10, 9,   8,  11, 10, // top
    12, 14, 13,  12, 15, 14, // bottom
    16, 18, 17,  16, 19, 18, // left
    20, 22, 21,  20, 23, 22  // right
  ];
}
var p = SkyBoxGeometry.prototype = Object.create(Geometry.prototype);