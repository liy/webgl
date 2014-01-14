function Vec3(x, y, z){
  this.x = x;
  this.y = y;
  this.z = z;
}
var p = Vec3.prototype = Object.create(null);

p.add = function(vec3){
  this.x += vec3.x;
  this.y += vec3.y;
  this.z += vec3.z;
  return this;
}