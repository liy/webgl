function CubeGeometry(width, height, depth){
  Geometry.call(this);

  this.width = width ? width : 1;
  this.height = height ? height : 1;
  this.depth = depth ? depth : 1;

  var hw = this.width/2;
  var hh = this.height/2;
  var hd = this.depth/2;

  this.numVertices = 24;

  this.vertices = [
    // x y z   nx ny nz
    // front
    vec3.fromValues(-hw, -hh,  hd),
    vec3.fromValues( hw, -hh,  hd),
    vec3.fromValues( hw,  hh,  hd),
    vec3.fromValues(-hw,  hh,  hd),
    // back
    vec3.fromValues( hw, -hh, -hd),
    vec3.fromValues(-hw, -hh, -hd),
    vec3.fromValues(-hw,  hh, -hd),
    vec3.fromValues( hw,  hh, -hd),
    // top
    vec3.fromValues(-hw,  hh,  hd),
    vec3.fromValues( hw,  hh,  hd),
    vec3.fromValues( hw,  hh, -hd),
    vec3.fromValues(-hw,  hh, -hd),
    // bottom
    vec3.fromValues(-hw, -hh, -hd),
    vec3.fromValues( hw, -hh, -hd),
    vec3.fromValues( hw, -hh,  hd),
    vec3.fromValues(-hw, -hh,  hd),
    // left
    vec3.fromValues(-hw, -hh, -hd),
    vec3.fromValues(-hw, -hh,  hd),
    vec3.fromValues(-hw,  hh,  hd),
    vec3.fromValues(-hw,  hh, -hd),
    // right
    vec3.fromValues( hw, -hh,  hd),
    vec3.fromValues( hw, -hh, -hd),
    vec3.fromValues( hw,  hh, -hd),
    vec3.fromValues( hw,  hh,  hd),
  ];

  this.normals = [
    vec3.fromValues( 0,  0,  1),
    vec3.fromValues( 0,  0,  1),
    vec3.fromValues( 0,  0,  1),
    vec3.fromValues( 0,  0,  1),

    vec3.fromValues( 0,  0, -1),
    vec3.fromValues( 0,  0, -1),
    vec3.fromValues( 0,  0, -1),
    vec3.fromValues( 0,  0, -1),

    vec3.fromValues( 0,  1,  0),
    vec3.fromValues( 0,  1,  0),
    vec3.fromValues( 0,  1,  0),
    vec3.fromValues( 0,  1,  0),

    vec3.fromValues( 0, -1,  0),
    vec3.fromValues( 0, -1,  0),
    vec3.fromValues( 0, -1,  0),
    vec3.fromValues( 0, -1,  0),

    vec3.fromValues(-1,  0,  0),
    vec3.fromValues(-1,  0,  0),
    vec3.fromValues(-1,  0,  0),
    vec3.fromValues(-1,  0,  0),

    vec3.fromValues( 1,  0,  0),
    vec3.fromValues( 1,  0,  0),
    vec3.fromValues( 1,  0,  0),
    vec3.fromValues( 1,  0,  0)
  ];

  this.texCoords = [
    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0),

    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0),

    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0),

    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0),

    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0),

    vec2.fromValues(0.0, 0.0),
    vec2.fromValues(1.0, 0.0),
    vec2.fromValues(1.0, 1.0),
    vec2.fromValues(0.0, 1.0)
  ];

  // index information
  this.indexData = [
    0,  1,  2,   0,  2,  3,  // front
    4,  5,  6,   4,  6,  7,  // back
    8,  9,  10,  8,  10, 11, // top
    12, 13, 14,  12, 14, 15, // bottom
    16, 17, 18,  16, 18, 19, // left
    20, 21, 22,  20, 22, 23  // right
  ];
}
var p = CubeGeometry.prototype = Object.create(Geometry.prototype);