function Vec3(x, y, z){
  this.x = x;
  this.y = y;
  this.z = z;
}
var p = Vec3.prototype = Object.create(null);

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

p.setLen = function(l){

}