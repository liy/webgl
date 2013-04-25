(function(window){
  function Cube(width, height, depth){
    this.material = new Material();
    
    this.set(width, height, depth);
  }
  var p = Cube.prototype;

  p.set = function(width, height, depth){
    this.width = width ? width : 1;
    this.height = height ? height : 1;
    this.depth = depth ? depth : 1;

    var hw = this.width/2;
    var hh = this.height/2;
    var hd = this.depth/2;

    var e = this.material.emission;
    console.log(e);
    this.vertices = [
      // x y z   u v  nx ny nz  r g b a
      // front
      -hw, -hh,  hd,   0.0, 1.0,    0,  0,  1,  e[0], e[1], e[2], e[3],
       hw, -hh,  hd,   1.0, 1.0,    0,  0,  1,  e[0], e[1], e[2], e[3],
       hw,  hh,  hd,   1.0, 0.0,    0,  0,  1,  e[0], e[1], e[2], e[3],
      -hw,  hh,  hd,   0.0, 0.0,    0,  0,  1,  e[0], e[1], e[2], e[3],
      // back
       hw, -hh, -hd,   0.0, 1.0,    0,  0, -1,  e[0], e[1], e[2], e[3],
      -hw, -hh, -hd,   1.0, 1.0,    0,  0, -1,  e[0], e[1], e[2], e[3],
      -hw,  hh, -hd,   1.0, 0.0,    0,  0, -1,  e[0], e[1], e[2], e[3],
       hw,  hh, -hd,   0.0, 0.0,    0,  0, -1,  e[0], e[1], e[2], e[3],
      // top
      -hw,  hh,  hd,   0.0, 1.0,    0,  1,  0,  e[0], e[1], e[2], e[3],
       hw,  hh,  hd,   1.0, 1.0,    0,  1,  0,  e[0], e[1], e[2], e[3],
       hw,  hh, -hd,   1.0, 0.0,    0,  1,  0,  e[0], e[1], e[2], e[3],
      -hw,  hh, -hd,   0.0, 0.0,    0,  1,  0,  e[0], e[1], e[2], e[3],
      // bottom
      -hw, -hh, -hd,   0.0, 1.0,    0, -1,  0,  e[0], e[1], e[2], e[3],
       hw, -hh, -hd,   1.0, 1.0,    0, -1,  0,  e[0], e[1], e[2], e[3],
       hw, -hh,  hd,   1.0, 0.0,    0, -1,  0,  e[0], e[1], e[2], e[3],
      -hw, -hh,  hd,   0.0, 0.0,    0, -1,  0,  e[0], e[1], e[2], e[3],
      // left
      -hw, -hh, -hd,   0.0, 1.0,   -1,  0,  0,  e[0], e[1], e[2], e[3],
      -hw, -hh,  hd,   1.0, 1.0,   -1,  0,  0,  e[0], e[1], e[2], e[3],
      -hw,  hh,  hd,   1.0, 0.0,   -1,  0,  0,  e[0], e[1], e[2], e[3],
      -hw,  hh, -hd,   0.0, 0.0,   -1,  0,  0,  e[0], e[1], e[2], e[3],
      // right
       hw, -hh,  hd,   0.0, 1.0,    1,  0,  0,  e[0], e[1], e[2], e[3],
       hw, -hh, -hd,   1.0, 1.0,    1,  0,  0,  e[0], e[1], e[2], e[3],
       hw,  hh, -hd,   1.0, 0.0,    1,  0,  0,  e[0], e[1], e[2], e[3],
       hw,  hh,  hd,   0.0, 0.0,    1,  0,  0,  e[0], e[1], e[2], e[3],
    ];

    this.indices = [
      0,  1,  2,   0,  2,  3,  // front
      4,  5,  6,   4,  6,  7,  // back
      8,  9,  10,  8,  10, 11, // top
      12, 13, 14,  12, 14, 15, // bottom
      16, 17, 18,  16, 18, 19, // left
      20, 21, 22,  20, 22, 23  // right
    ];
  }

  p.room = function(){
    for(var i=0; i<24; ++i){
      this.vertices[12*i + 5] *= -1;
      this.vertices[12*i + 6] *= -1;
      this.vertices[12*i + 7] *= -1;
    }
    this.indices = this.indices.reverse();
  }

window.Cube = Cube;
})(window);