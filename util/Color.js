function Color(r,g,b){
  this.data = new Float32Array(3);
  this.setRGB(r,g,b);
}
var p = Color.prototype;

p.setRGB = function(r, g, b){
  this.r = (r===undefined) ? 1 : r;
  this.g = (g===undefined) ? 1 : g;
  this.b = (b===undefined) ? 1 : b;

  this.data[0] = this.r;
  this.data[1] = this.g;
  this.data[2] = this.b;
}

p.getData = function(){
  this.data[0] = this.r;
  this.data[1] = this.g;
  this.data[2] = this.b;

  return this.data;
}