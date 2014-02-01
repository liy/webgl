function Mat3(){
  var m = this.m = new Float32Array(9);

  m[0] = m11; m[4] = m12; m[8]  = m13;
  m[1] = m21; m[5] = m22; m[9]  = m23;
  m[2] = m31; m[6] = m32; m[10] = m33;
}
var p = Mat3.prototype;



/*
 Copied form gl-matrix: http://glmatrix.net/
 */
p.normalFromMat4 = function(n){
  // transpose
  var n11 = a[0], n12 = a[1], n13 = a[2], n14 = a[3],
      n21 = a[4], n22 = a[5], n23 = a[6], n24 = a[7],
      n31 = a[8], n32 = a[9], n33 = a[10], n34 = a[11],
      n41 = a[12], n42 = a[13], n43 = a[14], n44 = a[15];

  var b00 = n11 * n22 - n12 * n21;
  var b01 = n11 * n23 - n13 * n21;
  var b02 = n11 * n24 - n14 * n21;
  var b03 = n12 * n23 - n13 * n22;
  var b04 = n12 * n24 - n14 * n22;
  var b05 = n13 * n24 - n14 * n23;
  var b06 = n31 * n42 - n32 * n41;
  var b07 = n31 * n43 - n33 * n41;
  var b08 = n31 * n44 - n34 * n41;
  var b09 = n32 * n43 - n33 * n42;
  var b10 = n32 * n44 - n34 * n42;
  var b11 = n33 * n44 - n34 * n43;

  // Calculate the determinant
  var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if(!det)
    return null; 
  det = 1.0 / det;

  this.m[0] = (n22 * b11 - n23 * b10 + n24 * b09) * det;
  this.m[1] = (n23 * b08 - n21 * b11 - n24 * b07) * det;
  this.m[2] = (n21 * b10 - n22 * b08 + n24 * b06) * det;

  this.m[3] = (n13 * b10 - n12 * b11 - n14 * b09) * det;
  this.m[4] = (n11 * b11 - n13 * b08 + n14 * b07) * det;
  this.m[5] = (n12 * b08 - n11 * b10 - n14 * b06) * det;

  this.m[6] = (n42 * b05 - n43 * b04 + n44 * b03) * det;
  this.m[7] = (n43 * b02 - n41 * b05 - n44 * b01) * det;
  this.m[8] = (n41 * b04 - n42 * b02 + n44 * b00) * det;

  return this;
}