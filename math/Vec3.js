function Vec3(x, y, z){
  this.x = x||0;
  this.y = y||0;
  this.z = z||0;
}
var p = Vec3.prototype;

p.add = function(v){
  this.x += v.x;
  this.y += v.y;
  this.z += v.z;
  return this;
}

p.sub = function(v){
  this.x -= v.x;
  this.y -= v.y;
  this.z -= v.z;
  return this;
}

p.scale = function(s){
  this.x *= s;
  this.y *= s;
  this.z *= s;
  return this;
}

p.dot = function(v){
  return this.x*v.x + this.y*v.y + this.z*v.z;
}

p.cross = function(v, out){
  if(out === undefined)
    out = new Vec3();

  out.x = this.y*v.z-this.z*v.y;
  out.y = this.z*v.x-this.x*v.z;
  out.z = this.x*v.y-this.y*v.x;
  return out;
}

p.applyMat3 = function(mat3){
  var x = this.x;
  var y = this.y;
  var z = this.z;

  this.x = mat3.m[0]*x + mat3.m[3]*y + mat3.m[6]*z;
  this.y = mat3.m[1]*x + mat3.m[4]*y + mat3.m[7]*z;
  this.z = mat3.m[2]*x + mat3.m[5]*y + mat3.m[8]*z;

  return this;
}

p.applyMat4 = function(mat4){
  var x=this.x, y=this.y, z=this.z;

  this.x = mat4.m[0]*x + mat4.m[4]*y + mat4.m[8]*z + mat4.m[12];
  this.y = mat4.m[1]*x + mat4.m[5]*y + mat4.m[9]*z + mat4.m[13];
  this.z = mat4.m[2]*x + mat4.m[6]*y + mat4.m[10]*z + mat4.m[14];

  return this;
}

p.transformAsDirection = function(mat4){
  // vector interpreted as a direction
  var x = this.x, y = this.y, z = this.z;

  this.x = mat4.m[0]*x + mat4.m[4]*y + mat4.m[8]*z;
  this.y = mat4.m[1]*x + mat4.m[5]*y + mat4.m[9]*z;
  this.z = mat4.m[2]*x + mat4.m[6]*y + mat4.m[10]*z;

  this.normalize();

  return this;
}

p.equals = function(v){
  return this.x===v.x && this.y===v.y && this.z===v.z;
}

p.len = function(){
  return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
}

p.len2 = function(){
  return this.x*this.x + this.y*this.y + this.z*this.z;
}

p.setLen = function(l){
  this.scale(l/this.len);
  return this;
}

p.normalize = function(){
  var s = 1/this.len();
  this.x *= s;
  this.y *= s;
  this.z *= s;
  return this;
}

p.clone = function(){
  return new Vec3(this.x, this.y, this.z);
}