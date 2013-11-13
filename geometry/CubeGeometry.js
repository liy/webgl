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

  this.texCoords = [
    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0,

    0.0, 1.0,
    1.0, 1.0,
    1.0, 0.0,
    0.0, 0.0
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



  this._tempTangent = [
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,

    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
    1, 0, 0,
  ];
  this.tangents = [];
  // calculate handedness
  for(var i=0; i<this.vertices.length/3; ++i){
    var n = vec3.fromValues(this.normals[i*3], this.normals[i*3+1], this.normals[i*3+2]);
    var t = vec3.fromValues(this._tempTangent[i*3], this._tempTangent[i*3+1], this._tempTangent[i*3+2]);
    // T = normalize(T - dot(T, N) * N);
    vec3.sub(t, t, vec3.scale(n, n, vec3.dot(t, n)));
    vec3.normalize(t, t);

    this.tangents.push(t[0]);
    this.tangents.push(t[1]);
    this.tangents.push(t[2]);
    // FIXME: fix the handedness
    this.tangents.push(1);
  }
}
var p = CubeGeometry.prototype = Object.create(Geometry.prototype);

p.room = function(){
  for(var i=0; i<this.normals.length; ++i){
    this.normals[i] *= -1;
  }
}