/**
 * 3D face
 * @param {[type]} a 1st vertex index of the geometry
 * @param {[type]} b 2nd vertex index of the geometry
 * @param {[type]} c 3rd vertex index of the geometry
 */
function Face3(a, b, c){
  this.a = a;
  this.b = b;
  this.c = c;

  this.normal = null;
}
var p = Face3.prototype;