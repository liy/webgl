function CubeGeometry(width, height, depth){
  Geometry.call(this);

  this.width = width ? width : 1;
  this.height = height ? height : 1;
  this.depth = depth ? depth : 1;

  var hw = this.width/2;
  var hh = this.height/2;
  var hd = this.depth/2;

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

  this.normals = [
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,
     0,  0,  1,

     0,  0, -1,
     0,  0, -1,
     0,  0, -1,
     0,  0, -1,

     0,  1,  0,
     0,  1,  0,
     0,  1,  0,
     0,  1,  0,

     0, -1,  0,
     0, -1,  0,
     0, -1,  0,
     0, -1,  0,

    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,
    -1,  0,  0,

     1,  0,  0,
     1,  0,  0,
     1,  0,  0,
     1,  0,  0
  ];
}
var p = CubeGeometry.prototype = Object.create(Geometry.prototype);

p.room = function(){
  for(var i=0; i<this.normals.length; ++i){
    this.normals[i] *= -1;
  }
}