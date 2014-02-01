/**
 * Based on Three.js math library
 * 
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://exocortex.com
 * @author WestLangley / http://github.com/WestLangley
 */
function Mat4(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44){
  var m = this.m = new Float32Array(16);

  m[0] = m11; m[4] = m12; m[8]  = m13; m[12] = m14;
  m[1] = m21; m[5] = m22; m[9]  = m23; m[13] = m24;
  m[2] = m31; m[6] = m32; m[10] = m33; m[14] = m34;
  m[3] = m41; m[7] = m42; m[11] = m43; m[15] = m44;

  // TODO: do I need to do the checking?
  for(var i=0; i<16; ++i){
    if(isNaN(m[i])){
      this.identity();
      break;
    }
  }
}
var p = Mat4.prototype = Object.create(null);

p.set = function(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44){
  this.m[0] = m11; this.m[4] = m12; this.m[8]  = m13; this.m[12] = m14;
  this.m[1] = m21; this.m[5] = m22; this.m[9]  = m23; this.m[13] = m24;
  this.m[2] = m31; this.m[6] = m32; this.m[10] = m33; this.m[14] = m34;
  this.m[3] = m41; this.m[7] = m42; this.m[11] = m43; this.m[15] = m44;

  return this;
}
/*
  | m11  m12  m13  m14 |    | n11 n12 n13 n14 |
  | m21  m22  m23  m24 | *  | n21 n22 n23 n24 |
  | m31  m32  m33  m34 |    | n31 n32 n33 n34 |
  | m41  m42  m43  m44 |    | n41 n42 n43 n44 |
 */
p.multiply = function(n){
  // if(n.isIdentity())
  //   return this;

  var m11 = this.m[0], m12 = this.m[4], m13 = this.m[8],  m14 = this.m[12];
  var m21 = this.m[1], m22 = this.m[5], m23 = this.m[9],  m24 = this.m[13];
  var m31 = this.m[2], m32 = this.m[6], m33 = this.m[10], m34 = this.m[14];
  var m41 = this.m[3], m42 = this.m[7], m43 = this.m[11], m44 = this.m[15];

  var n11 = n.m[0], n12 = n.m[4], n13 = n.m[8],  n14 = n.m[12];
  var n21 = n.m[1], n22 = n.m[5], n23 = n.m[9],  n24 = n.m[13];
  var n31 = n.m[2], n32 = n.m[6], n33 = n.m[10], n34 = n.m[14];
  var n41 = n.m[3], n42 = n.m[7], n43 = n.m[11], n44 = n.m[15];

  this.m[0]  = m11*n11 + m12*n21 + m13*n31 + m14*n41;
  this.m[4]  = m11*n12 + m12*n22 + m13*n32 + m14*n42;
  this.m[8]  = m11*n13 + m12*n23 + m13*n33 + m14*n43;
  this.m[12] = m11*n14 + m12*n24 + m13*n34 + m14*n44;

  this.m[1]  = m21*n11 + m22*n21 + m23*n31 + m24*n41;
  this.m[5]  = m21*n12 + m22*n22 + m23*n32 + m24*n42;
  this.m[9]  = m21*n13 + m22*n23 + m23*n33 + m24*n43;
  this.m[13] = m21*n14 + m22*n24 + m23*n34 + m24*n44;

  this.m[2]  = m31*n11 + m32*n21 + m33*n31 + m34*n41;
  this.m[6]  = m31*n12 + m32*n22 + m33*n32 + m34*n42;
  this.m[10] = m31*n13 + m32*n23 + m33*n33 + m34*n43;
  this.m[14] = m31*n14 + m32*n24 + m33*n34 + m34*n44;

  this.m[3]  = m41*n11 + m42*n21 + m43*n31 + m44*n41;
  this.m[7]  = m41*n12 + m42*n22 + m43*n32 + m44*n42;
  this.m[11] = m41*n13 + m42*n23 + m43*n33 + m44*n43;
  this.m[15] = m41*n14 + m42*n24 + m43*n34 + m44*n44;

  return this;
}

p.setPosition = function(x, y, z){
  this.m[12] = x;
  this.m[13] = y;
  this.m[14] = z;

  return this;
}

p.translate = function(v) {
  var m11 = this.m[0], m12 = this.m[4], m13 = this.m[8],  m14 = this.m[12];
  var m21 = this.m[1], m22 = this.m[5], m23 = this.m[9],  m24 = this.m[13];
  var m31 = this.m[2], m32 = this.m[6], m33 = this.m[10], m34 = this.m[14];
  var m41 = this.m[3], m42 = this.m[7], m43 = this.m[11], m44 = this.m[15];
  
  this.m[0] = m11 + m41*v.x;
  this.m[1] = m21 + m41*v.y;
  this.m[2] = m31 + m41*v.z;
  this.m[3] = m41;

  this.m[4] = m12 + m42*v.x;
  this.m[5] = m22 + m42*v.y;
  this.m[6] = m32 + m42*v.z;
  this.m[7] = m42;

  this.m[8] = m13 + m43*v.x;
  this.m[9] = m23 + m43*v.y;
  this.m[10] = m33 + m43*v.z;
  this.m[11] = m43;
  this.m[12] = m14 + m44*v.x;
  this.m[13] = m24 + m44*v.y;
  this.m[14] = m34 + m44*v.z;
  this.m[15] = m44;

  return this;
};

p.setRotationX = function(radian){
  var c = Math.cos(radian);
  var s = Math.sin(radian);

  this.set(
    1, 0,  0, 0,
    0, c, -s, 0,
    0, s,  c, 0,
    0, 0,  0, 1
  );

  return this;
}

p.setRotationY = function(radian){
  var c = Math.cos(radian);
  var s = Math.sin(radian);

  this.set(
     c, 0, s, 0,
     0, 1, 0, 0,
    -s, 0, c, 0,
     0, 0, 0, 1
  );

  return this;
}

p.setRotationZ = function(radian){
  var c = Math.cos(radian);
  var s = Math.sin(radian);

  this.set(
    c, -s, 0, 0,
    s,  c, 0, 0,
    0,  0, 1, 0,
    0,  0, 0, 1
  );

  return this;
}

p.rotateX = function(radian){
  var s = Math.sin(radian),
      c = Math.cos(radian),
      m12 = this.m[4],
      m22 = this.m[5],
      m32 = this.m[6],
      m42 = this.m[7],
      m13 = this.m[8],
      m23 = this.m[9],
      m33 = this.m[10],
      m43 = this.m[11];

  this.m[4] = m12*c + m13*s;
  this.m[5] = m22*c + m23*s;
  this.m[6] = m32*c + m33*s;
  this.m[7] = m42*c + m43*s;
  this.m[8] = m13*c - m12*s;
  this.m[9] = m23*c - m22*s;
  this.m[10] = m33*c - m32*s;
  this.m[11] = m43*c - m42*s;

  return this;
};

p.rotateY = function(radian){
  var s = Math.sin(radian),
      c = Math.cos(radian),
      m11 = this.m[0],
      m21 = this.m[1],
      m31 = this.m[2],
      m41 = this.m[3],
      m13 = this.m[8],
      m23 = this.m[9],
      m33 = this.m[10],
      m43 = this.m[11];

  this.m[0] = m11*c - m13*s;
  this.m[1] = m21*c - m23*s;
  this.m[2] = m31*c - m33*s;
  this.m[3] = m41*c - m43*s;
  this.m[8] = m11*s + m13*c;
  this.m[9] = m21*s + m23*c;
  this.m[10] = m31*s + m33*c;
  this.m[11] = m41*s + m43*c;

  return this;
};

p.rotateZ = function(radian) {
  var s = Math.sin(radian),
      c = Math.cos(radian),
      m11 = this.m[0],
      m21 = this.m[1],
      m31 = this.m[2],
      m41 = this.m[3],
      m12 = this.m[4],
      m22 = this.m[5],
      m32 = this.m[6],
      m42 = this.m[7];

  this.m[0] = m11*c + m12*s;
  this.m[1] = m21*c + m22*s;
  this.m[2] = m31*c + m32*s;
  this.m[3] = m41*c + m42*s;
  this.m[4] = m12*c - m11*s;
  this.m[5] = m22*c - m21*s;
  this.m[6] = m32*c - m31*s;
  this.m[7] = m42*c - m41*s;

  return this;
};

p.multiplyScalar = function(s){
  this.m[0] *= s; this.m[4] *= s; this.m[8] *= s; this.m[12] *= s;
  this.m[1] *= s; this.m[5] *= s; this.m[9] *= s; this.m[13] *= s;
  this.m[2] *= s; this.m[6] *= s; this.m[10] *= s; this.m[14] *= s;
  this.m[3] *= s; this.m[7] *= s; this.m[11] *= s; this.m[15] *= s;

  return this;
}

p.setScale = function(x, y, z){
  this.set(
    x, 0, 0, 0,
    0, y, 0, 0,
    0, 0, z, 0,
    0, 0, 0, 1
  );

  return this;
}

p.scale = function(v){
  this.m[0] *= v.x; this.m[4] *= v.y; this.m[8] *= v.z;
  this.m[1] *= v.x; this.m[5] *= v.y; this.m[9] *= v.z;
  this.m[2] *= v.x; this.m[6] *= v.y; this.m[10] *= v.z;
  this.m[3] *= v.x; this.m[7] *= v.y; this.m[11] *= v.z;

  return this;
}

p.frustum = function(left, right, bottom, top, near, far){
  var x = 2*near / (right-left);
  var y = 2*near / (top-bottom);

  var a = (right+left) / (right-left);
  var b = (top+bottom) / (top-bottom);
  var c = -(far+near) / (far-near);
  var d = -2*far*near / (far-near);

  this.set(
    x, 0,  a, 0,
    0, y,  b, 0,
    0, 0,  c, d,
    0, 0, -1, 0
  );

  return this;
}

p.perspective = function(radian, aspectRatio, near, far){
  var ymax = near * Math.tan(radian*0.5);
  var ymin = -ymax;
  var xmin = ymin * aspectRatio;
  var xmax = ymax * aspectRatio;

  return this.frustum(xmin, xmax, ymin, ymax, near, far);
}

p.ortho = function(left, right, top, bottom, near, far){
  var w = right-left;
  var h = top-bottom;
  var p = far-near;

  var x = (right+left) / w;
  var y = (top+bottom) / h;
  var z = (far+near) / p;

  this.set(
    2/w,   0,     0,   -x,
    0,    2/h,    0,   -y,
    0,     0,   -2/p,  -z,
    0,     0,     0,    1
  );

  return this;
}

// FIXME: problems
p.lookAt = function(eye, target, up){
  var x = new Vec3();
  var y = new Vec3();
  var z = new Vec3();

  Vec3.sub(z, eye, target).normalize();

  if(z.len() === 0)
    z.z = 1;

  Vec3.cross(x, up, z ).normalize();

  if(x.len() === 0){
    z.x += 0.0001;
    Vec3.cross(x, up, z).normalize();
  }

  Vec3.cross(y, z, x);

  this.m[0] = x.x; this.m[4] = y.x; this.m[8] = z.x;
  this.m[1] = x.y; this.m[5] = y.y; this.m[9] = z.y;
  this.m[2] = x.z; this.m[6] = y.z; this.m[10] = z.z;

  return this;
};

p.transpose = function(){
  var tmp;

  tmp = this.m[1]; this.m[1] = this.m[4]; this.m[4] = tmp;
  tmp = this.m[2]; this.m[2] = this.m[8]; this.m[8] = tmp;
  tmp = this.m[6]; this.m[6] = this.m[9]; this.m[9] = tmp;

  tmp = this.m[3]; this.m[3] = this.m[12]; this.m[12] = tmp;
  tmp = this.m[7]; this.m[7] = this.m[13]; this.m[13] = tmp;
  tmp = this.m[11]; this.m[11] = this.m[14]; this.m[14] = tmp;

  return this;
}

p.determinant = function(){
    var m11 = this.m[0], m12 = this.m[4], m13 = this.m[8],  m14 = this.m[12];
    var m21 = this.m[1], m22 = this.m[5], m23 = this.m[9],  m24 = this.m[13];
    var m31 = this.m[2], m32 = this.m[6], m33 = this.m[10], m34 = this.m[14];
    var m41 = this.m[3], m42 = this.m[7], m43 = this.m[11], m44 = this.m[15];

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    return (
      m14*m23*m32*m41 - m13*m24*m32*m41 - m14*m22*m33*m41 + m12*m24*m33*m41+
      m13*m22*m34*m41 - m12*m23*m34*m41 - m14*m23*m31*m42 + m13*m24*m31*m42+
      m14*m21*m33*m42 - m11*m24*m33*m42 - m13*m21*m34*m42 + m11*m23*m34*m42+
      m14*m22*m31*m43 - m12*m24*m31*m43 - m14*m21*m32*m43 + m11*m24*m32*m43+
      m12*m21*m34*m43 - m11*m22*m34*m43 - m13*m22*m31*m44 + m12*m23*m31*m44+
      m13*m21*m32*m44 - m11*m23*m32*m44 - m12*m21*m33*m44 + m11*m22*m33*m44
    );
}

p.invert = function(){
  var m11 = this.m[0], m12 = this.m[4], m13 = this.m[8],  m14 = this.m[12];
  var m21 = this.m[1], m22 = this.m[5], m23 = this.m[9],  m24 = this.m[13];
  var m31 = this.m[2], m32 = this.m[6], m33 = this.m[10], m34 = this.m[14];
  var m41 = this.m[3], m42 = this.m[7], m43 = this.m[11], m44 = this.m[15];

  // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
  this.m[0]  = m23*m34*m42 - m24*m33*m42 + m24*m32*m43 - m22*m34*m43 - m23*m32*m44 + m22*m33*m44;
  this.m[4]  = m14*m33*m42 - m13*m34*m42 - m14*m32*m43 + m12*m34*m43 + m13*m32*m44 - m12*m33*m44;
  this.m[8]  = m13*m24*m42 - m14*m23*m42 + m14*m22*m43 - m12*m24*m43 - m13*m22*m44 + m12*m23*m44;
  this.m[12] = m14*m23*m32 - m13*m24*m32 - m14*m22*m33 + m12*m24*m33 + m13*m22*m34 - m12*m23*m34;
  this.m[1]  = m24*m33*m41 - m23*m34*m41 - m24*m31*m43 + m21*m34*m43 + m23*m31*m44 - m21*m33*m44;
  this.m[5]  = m13*m34*m41 - m14*m33*m41 + m14*m31*m43 - m11*m34*m43 - m13*m31*m44 + m11*m33*m44;
  this.m[9]  = m14*m23*m41 - m13*m24*m41 - m14*m21*m43 + m11*m24*m43 + m13*m21*m44 - m11*m23*m44;
  this.m[13] = m13*m24*m31 - m14*m23*m31 + m14*m21*m33 - m11*m24*m33 - m13*m21*m34 + m11*m23*m34;
  this.m[2]  = m22*m34*m41 - m24*m32*m41 + m24*m31*m42 - m21*m34*m42 - m22*m31*m44 + m21*m32*m44;
  this.m[6]  = m14*m32*m41 - m12*m34*m41 - m14*m31*m42 + m11*m34*m42 + m12*m31*m44 - m11*m32*m44;
  this.m[10] = m12*m24*m41 - m14*m22*m41 + m14*m21*m42 - m11*m24*m42 - m12*m21*m44 + m11*m22*m44;
  this.m[14] = m14*m22*m31 - m12*m24*m31 - m14*m21*m32 + m11*m24*m32 + m12*m21*m34 - m11*m22*m34;
  this.m[3]  = m23*m32*m41 - m22*m33*m41 - m23*m31*m42 + m21*m33*m42 + m22*m31*m43 - m21*m32*m43;
  this.m[7]  = m12*m33*m41 - m13*m32*m41 + m13*m31*m42 - m11*m33*m42 - m12*m31*m43 + m11*m32*m43;
  this.m[11] = m13*m22*m41 - m12*m23*m41 - m13*m21*m42 + m11*m23*m42 + m12*m21*m43 - m11*m22*m43;
  this.m[15] = m12*m23*m31 - m13*m22*m31 + m13*m21*m32 - m11*m23*m32 - m12*m21*m33 + m11*m22*m33;

  var det = m11*this.m[0] + m21*this.m[4] + m31*this.m[8] + m41*this.m[12];
  return this.multiplyScalar(1/det);
}

p.clone = function(){
  return new Mat4(
    this.m[0], this.m[4], this.m[8],  this.m[12],
    this.m[1], this.m[5], this.m[9],  this.m[13],
    this.m[2], this.m[6], this.m[10], this.m[14],
    this.m[3], this.m[7], this.m[11], this.m[15]
  );
}

p.copy = function(m){
  this.set(
    m.m[0], m.m[4], m.m[8],  m.m[12],
    m.m[1], m.m[5], m.m[9],  m.m[13],
    m.m[2], m.m[6], m.m[10], m.m[14],
    m.m[3], m.m[7], m.m[11], m.m[15]
  );
  return this;
}

p.identity = function(){
  this.set(
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );

  return this;
}

p.isIdentity = function(){
  return (
    this.m[0]===1 && this.m[4]===0 &&  this.m[8]===0 && this.m[12]===0 &&
    this.m[1]===0 && this.m[5]===1 &&  this.m[9]===0 && this.m[13]===0 &&
    this.m[2]===0 && this.m[6]===0 && this.m[10]===1 && this.m[14]===0 &&
    this.m[3]===0 && this.m[7]===0 && this.m[11]===0 && this.m[15]===1
  );
}

/*
  out = a * b
 */
Mat4.multiply = function(out, a, b){
  var a11 = a.m[0], a12 = a.m[4], a13 = a.m[8],  a14 = a.m[12];
  var a21 = a.m[1], a22 = a.m[5], a23 = a.m[9],  a24 = a.m[13];
  var a31 = a.m[2], a32 = a.m[6], a33 = a.m[10], a34 = a.m[14];
  var a41 = a.m[3], a42 = a.m[7], a43 = a.m[11], a44 = a.m[15];

  var b11 = b.m[0], b12 = b.m[4], b13 = b.m[8],  b14 = b.m[12];
  var b21 = b.m[1], b22 = b.m[5], b23 = b.m[9],  b24 = b.m[13];
  var b31 = b.m[2], b32 = b.m[6], b33 = b.m[10], b34 = b.m[14];
  var b41 = b.m[3], b42 = b.m[7], b43 = b.m[11], b44 = b.m[15];

  out.m[0]  = a11*b11 + a12*b21 + a13*b31 + a14*b41;
  out.m[4]  = a11*b12 + a12*b22 + a13*b32 + a14*b42;
  out.m[8]  = a11*b13 + a12*b23 + a13*b33 + a14*b43;
  out.m[12] = a11*b14 + a12*b24 + a13*b34 + a14*b44;

  out.m[1]  = a21*b11 + a22*b21 + a23*b31 + a24*b41;
  out.m[5]  = a21*b12 + a22*b22 + a23*b32 + a24*b42;
  out.m[9]  = a21*b13 + a22*b23 + a23*b33 + a24*b43;
  out.m[13] = a21*b14 + a22*b24 + a23*b34 + a24*b44;

  out.m[2]  = a31*b11 + a32*b21 + a33*b31 + a34*b41;
  out.m[6]  = a31*b12 + a32*b22 + a33*b32 + a34*b42;
  out.m[10] = a31*b13 + a32*b23 + a33*b33 + a34*b43;
  out.m[14] = a31*b14 + a32*b24 + a33*b34 + a34*b44;

  out.m[3]  = a41*b11 + a42*b21 + a43*b31 + a44*b41;
  out.m[7]  = a41*b12 + a42*b22 + a43*b32 + a44*b42;
  out.m[11] = a41*b13 + a42*b23 + a43*b33 + a44*b43;
  out.m[15] = a41*b14 + a42*b24 + a43*b34 + a44*b44;

  return out;
}


Mat4.invert = function(out, m){
  var m11 = m.m[0], m12 = m.m[4], m13 = m.m[8],  m14 = m.m[12];
  var m21 = m.m[1], m22 = m.m[5], m23 = m.m[9],  m24 = m.m[13];
  var m31 = m.m[2], m32 = m.m[6], m33 = m.m[10], m34 = m.m[14];
  var m41 = m.m[3], m42 = m.m[7], m43 = m.m[11], m44 = m.m[15];

  // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
  out.m[0]  = m23*m34*m42 - m24*m33*m42 + m24*m32*m43 - m22*m34*m43 - m23*m32*m44 + m22*m33*m44;
  out.m[4]  = m14*m33*m42 - m13*m34*m42 - m14*m32*m43 + m12*m34*m43 + m13*m32*m44 - m12*m33*m44;
  out.m[8]  = m13*m24*m42 - m14*m23*m42 + m14*m22*m43 - m12*m24*m43 - m13*m22*m44 + m12*m23*m44;
  out.m[12] = m14*m23*m32 - m13*m24*m32 - m14*m22*m33 + m12*m24*m33 + m13*m22*m34 - m12*m23*m34;
  out.m[1]  = m24*m33*m41 - m23*m34*m41 - m24*m31*m43 + m21*m34*m43 + m23*m31*m44 - m21*m33*m44;
  out.m[5]  = m13*m34*m41 - m14*m33*m41 + m14*m31*m43 - m11*m34*m43 - m13*m31*m44 + m11*m33*m44;
  out.m[9]  = m14*m23*m41 - m13*m24*m41 - m14*m21*m43 + m11*m24*m43 + m13*m21*m44 - m11*m23*m44;
  out.m[13] = m13*m24*m31 - m14*m23*m31 + m14*m21*m33 - m11*m24*m33 - m13*m21*m34 + m11*m23*m34;
  out.m[2]  = m22*m34*m41 - m24*m32*m41 + m24*m31*m42 - m21*m34*m42 - m22*m31*m44 + m21*m32*m44;
  out.m[6]  = m14*m32*m41 - m12*m34*m41 - m14*m31*m42 + m11*m34*m42 + m12*m31*m44 - m11*m32*m44;
  out.m[10] = m12*m24*m41 - m14*m22*m41 + m14*m21*m42 - m11*m24*m42 - m12*m21*m44 + m11*m22*m44;
  out.m[14] = m14*m22*m31 - m12*m24*m31 - m14*m21*m32 + m11*m24*m32 + m12*m21*m34 - m11*m22*m34;
  out.m[3]  = m23*m32*m41 - m22*m33*m41 - m23*m31*m42 + m21*m33*m42 + m22*m31*m43 - m21*m32*m43;
  out.m[7]  = m12*m33*m41 - m13*m32*m41 + m13*m31*m42 - m11*m33*m42 - m12*m31*m43 + m11*m32*m43;
  out.m[11] = m13*m22*m41 - m12*m23*m41 - m13*m21*m42 + m11*m23*m42 + m12*m21*m43 - m11*m22*m43;
  out.m[15] = m12*m23*m31 - m13*m22*m31 + m13*m21*m32 - m11*m23*m32 - m12*m21*m33 + m11*m22*m33;

  var det = m11*out.m[0] + m21*out.m[4] + m31*out.m[8] + m41*out.m[12];
  return out.multiplyScalar(1/det);
}