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