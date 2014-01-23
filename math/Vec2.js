function Vec2(x, y){
  this.x = x||0;
  this.y = y||0;
}
var p = Vec2.prototype;

p.add = function(v){
  this.x += v.x;
  this.y += v.y;
  return this;
}

p.sub = function(v){
  this.x -= v.x;
  this.y -= v.y;
  return this;
}

p.scale = function(s){
  this.x *= s;
  this.y *= s;
  return this;
}

p.dot = function(v){
  return this.x*v.x + this.y*v.y;
}

p.cross = function(v){
  return this.x*v.y - this.y*v.x;
}

p.equals = function(v){
  return this.x===v.x && this.y===v.y;
}

p.len = function(){
  return Math.sqrt(this.x*this.x + this.y*this.y);
}

p.len2 = function(){
  return this.x*this.x + this.y*this.y;
}

p.setLen = function(l){
  this.scale(l/this.len);
  return this;
}

p.normalize = function(){
  var s = 1/this.len();
  this.x *= s;
  this.y *= s;
  return this;
}

p.clone = function(){
  return new Vec2(this.x, this.y);
}