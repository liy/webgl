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
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0
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


  // calculate tangent, 12 faces
  this.tangents = Array.apply(null, new Array(96)).map(Number.prototype.valueOf, 0);
  this.bitangents = Array.apply(null, new Array(72)).map(Number.prototype.valueOf, 0);
  for(var i=0; i<12; ++i){
    var i0 = this.indices[i*3];
    var i1 = this.indices[i*3+1];
    var i2 = this.indices[i*3+2];

    // edge 1
    var x1 = this.vertices[i1*3] - this.vertices[i0*3];
    var y1 = this.vertices[i1*3+1] - this.vertices[i0*3+1];
    var z1 = this.vertices[i1*3+2] - this.vertices[i0*3+2];
    // edge 2
    var x2 = this.vertices[i2*3] - this.vertices[i0*3];
    var y2 = this.vertices[i2*3+1] - this.vertices[i0*3+1];
    var z2 = this.vertices[i2*3+2] - this.vertices[i0*3+2];

    var s1 = this.texCoords[i1*2] - this.texCoords[i0*2];
    var t1 = this.texCoords[i1*2+1] - this.texCoords[i0*2+1];
    var s2 = this.texCoords[i2*2] - this.texCoords[i0*2];
    var t2 = this.texCoords[i2*2+1] - this.texCoords[i0*2+1];

    var det = 1/(s1*t2 - s2*t1);

    var Tx = det * (t2*x1 - t1*x2);
    var Ty = det * (t2*y1 - t1*y2);
    var Tz = det * (t2*z1 - t1*z2);

    var Bx = det * (s1*x2 - s2*x1);
    var By = det * (s1*y2 - s2*y1);
    var Bz = det * (s1*z2 - s2*z1);

    this.tangents[i0*4] += Tx;
    this.tangents[i0*4+1] += Ty;
    this.tangents[i0*4+2] += Tz;

    this.tangents[i1*4] += Tx;
    this.tangents[i1*4+1] += Ty;
    this.tangents[i1*4+2] += Tz;

    this.tangents[i2*4] += Tx;
    this.tangents[i2*4+1] += Ty;
    this.tangents[i2*4+2] += Tz;

    this.bitangents[i0*3] += Bx;
    this.bitangents[i0*3+1] += By;
    this.bitangents[i0*3+2] += Bz;

    this.bitangents[i1*3] += Bx;
    this.bitangents[i1*3+1] += By;
    this.bitangents[i1*3+2] += Bz;

    this.bitangents[i2*3] += Bx;
    this.bitangents[i2*3+1] += By;
    this.bitangents[i2*3+2] += Bz;
  }

  for(var i=0; i<this.vertices.length/3; ++i){
    var n = vec3.fromValues(this.normals[i*3], this.normals[i*3+1], this.normals[i*3+2]);
    var t = vec3.fromValues(this.tangents[i*4], this.tangents[i*4+1], this.tangents[i*4+2]);
    var b = vec3.fromValues(this.bitangents[i*3], this.bitangents[i*3+1], this.bitangents[i*3+2]);

    t = vec3.sub(t, t, vec3.scale(vec3.create(), n, vec3.dot(n, t)));


    // Testing =======
    // t = vec3.fromValues(1, 0, 0);
    // b = vec3.fromValues(0, 1, 0);
    // =============


    vec3.normalize(t, t);
    this.tangents[i*4] = t[0];
    this.tangents[i*4+1] = t[1];
    this.tangents[i*4+2] = t[2];
    this.tangents[i*4+3] = (vec3.dot(vec3.cross(vec3.create(), n, t), b) < 0) ? -1 : 1;

    vec3.normalize(b, b);
    this.bitangents[i*3] = b[0];
    this.bitangents[i*3+1] = b[1];
    this.bitangents[i*3+2] = b[2];
  }
}
var p = CubeGeometry.prototype = Object.create(Geometry.prototype);

p.room = function(){
  for(var i=0; i<this.normals.length; ++i){
    this.normals[i] *= -1;
  }
}