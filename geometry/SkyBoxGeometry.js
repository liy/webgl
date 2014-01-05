function SkyboxGeometry(width, height, depth){
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
    -hw, -hh,  hd,
     hw, -hh,  hd,
     hw,  hh,  hd,
    -hw,  hh,  hd,
    // back
     hw, -hh, -hd,
    -hw, -hh, -hd,
    -hw,  hh, -hd,
     hw,  hh, -hd,
    // top
    -hw,  hh,  hd,
     hw,  hh,  hd,
     hw,  hh, -hd,
    -hw,  hh, -hd,
    // bottom
    -hw, -hh, -hd,
     hw, -hh, -hd,
     hw, -hh,  hd,
    -hw, -hh,  hd,
    // left
    -hw, -hh, -hd,
    -hw, -hh,  hd,
    -hw,  hh,  hd,
    -hw,  hh, -hd,
    // right
     hw, -hh,  hd,
     hw, -hh, -hd,
     hw,  hh, -hd,
     hw,  hh,  hd,
  ];

  this.texCoords = [
    // x y z   nx ny nz
    // front
     hw, -hh,  hd,
    -hw, -hh,  hd,
    -hw,  hh,  hd,
     hw,  hh,  hd,
    // back
    -hw, -hh, -hd,
     hw, -hh, -hd,
     hw,  hh, -hd,
    -hw,  hh, -hd,
    // top
     hw,  hh,  hd,
    -hw,  hh,  hd,
    -hw,  hh, -hd,
     hw,  hh, -hd,
    // bottom
     hw, -hh, -hd,
    -hw, -hh, -hd,
    -hw, -hh,  hd,
     hw, -hh,  hd,
    // left
     hw, -hh, -hd,
     hw, -hh,  hd,
     hw,  hh,  hd,
     hw,  hh, -hd,
    // right
    -hw, -hh,  hd,
    -hw, -hh, -hd,
    -hw,  hh, -hd,
    -hw,  hh,  hd,
  ];

  // index information
  this.indices = [
    0,  1,  2,   0,  2,  3,  // front
    4,  5,  6,   4,  6,  7,  // back
    8,  9,  10,  8,  10, 11, // top
    12, 13, 14,  12, 14, 15, // bottom
    16, 17, 18,  16, 18, 19, // left
    20, 21, 22,  20, 22, 23  // right
  ];
}
var p = SkyboxGeometry.prototype = Object.create(Geometry.prototype);