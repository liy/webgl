function Mat3(m11, m12, m13, m21, m22, m23, m31, m32, m33){
  var m = this.m = new Float32Array(9);

  m[0] = m11; m[4] = m12; m[8]  = m13;
  m[1] = m21; m[5] = m22; m[9]  = m23;
  m[2] = m31; m[6] = m32; m[10] = m33;

  for(var i=0; i<9; ++i){
    if(isNaN(m[i])){
      this.identity();
      break;
    }
  }

}
var p = Mat3.prototype = Object.create(null);

p.set = function(m11, m12, m13, m21, m22, m23, m31, m32, m33){
  this.m[0] = m11; this.m[4] = m12; this.m[8]  = m13;
  this.m[1] = m21; this.m[5] = m22; this.m[9]  = m23;
  this.m[2] = m31; this.m[6] = m32; this.m[10] = m33;

  return this;
}

p.identity = function(){
  this.set(
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
  );

  return this;
}

/*
 Copied form gl-matrix: http://glmatrix.net/
 A inverse transpose matrix for normal transformation.
 */
p.normalFromMat4 = function(m){
  var m11 = m.m[0], m21 = m.m[1], m31 = m.m[2], m41 = m.m[3],
      m12 = m.m[4], m22 = m.m[5], m32 = m.m[6], m42 = m.m[7],
      m13 = m.m[8], m23 = m.m[9], m33 = m.m[10], m43 = m.m[11],
      m14 = m.m[12], m24 = m.m[13], m34 = m.m[14], m44 = m.m[15],

      b00 = m11 * m22 - m21 * m12,
      b01 = m11 * m32 - m31 * m12,
      b02 = m11 * m42 - m41 * m12,
      b03 = m21 * m32 - m31 * m22,
      b04 = m21 * m42 - m41 * m22,
      b05 = m31 * m42 - m41 * m32,
      b06 = m13 * m24 - m23 * m14,
      b07 = m13 * m34 - m33 * m14,
      b08 = m13 * m44 - m43 * m14,
      b09 = m23 * m34 - m33 * m24,
      b10 = m23 * m44 - m43 * m24,
      b11 = m33 * m44 - m43 * m34,

      // Calculate the determinant
      det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (!det)
    return null; 
  det = 1.0 / det;

  this.m[0] = (m22 * b11 - m32 * b10 + m42 * b09) * det;
  this.m[1] = (m32 * b08 - m12 * b11 - m42 * b07) * det;
  this.m[2] = (m12 * b10 - m22 * b08 + m42 * b06) * det;

  this.m[3] = (m31 * b10 - m21 * b11 - m41 * b09) * det;
  this.m[4] = (m11 * b11 - m31 * b08 + m41 * b07) * det;
  this.m[5] = (m21 * b08 - m11 * b10 - m41 * b06) * det;

  this.m[6] = (m24 * b05 - m34 * b04 + m44 * b03) * det;
  this.m[7] = (m34 * b02 - m14 * b05 - m44 * b01) * det;
  this.m[8] = (m14 * b04 - m24 * b02 + m44 * b00) * det;

  return this;
}