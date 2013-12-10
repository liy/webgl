function SphereGeometry(radius, latitudeBands, longitudeBands){
  Geometry.call(this);

  this.radius = radius || 0.5;
  this.latitudeBands = latitudeBands || 10;
  this.longitudeBands = longitudeBands || 10;

  var theta = Math.PI/2;
  var phi = Math.PI/2;
  var x = 0;
  var y = 0;
  var z = 0;
  for(var i=0; i<=this.latitudeBands; ++i){
    theta = Math.PI/2 - i * (Math.PI/this.latitudeBands);
    cosTheta = Math.cos(theta);
    sinTheta = Math.sin(theta);
    for(var j=0; j<=this.longitudeBands; ++j){
      phi = -j * (Math.PI*2 / this.longitudeBands);

      x = cosTheta * Math.cos(phi);
      y = sinTheta;
      z = cosTheta * Math.sin(phi);

      // normals
      this.normals.push(x);
      this.normals.push(y);
      this.normals.push(z);

      this.vertices.push(x * this.radius);
      this.vertices.push(y * this.radius);
      this.vertices.push(z * this.radius);

      this.texCoords.push(j/this.longitudeBands);
      this.texCoords.push(i/this.latitudeBands);
    }
  }

  // indices
  this.indices = [];
  for(var i=0; i<this.latitudeBands; ++i){
    for(var j=0; j<this.longitudeBands; ++j){
      var topLeft = i * this.longitudeBands + i + j;
      var bottomLeft = topLeft + this.longitudeBands + 1;

      this.indices.push(topLeft);
      this.indices.push(bottomLeft);
      this.indices.push(bottomLeft + 1);
      this.indices.push(bottomLeft + 1);
      this.indices.push(topLeft + 1);
      this.indices.push(topLeft);
    }
  }

  this.numVertices = this.indices.length;

  // calculate tangent, 12 faces
  this.tangents = Array.apply(null, new Array(this.longitudeBands*this.latitudeBands*2*4)).map(Number.prototype.valueOf, 0);
  this.bitangents = Array.apply(null, new Array(this.longitudeBands*this.latitudeBands*2*3)).map(Number.prototype.valueOf, 0);
  for(var i=0; i<this.longitudeBands*this.latitudeBands*2; ++i){
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
var p = SphereGeometry.prototype = Object.create(Geometry.prototype);