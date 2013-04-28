function Material(){
  this.id = Material.id++;

  this.color = vec4.fromValues(0.7, 0.7, 0.7, 1);
}
var p = Material.prototype;

Material.id = 0;