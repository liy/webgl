function Material(){
  this.id = Material.id++;

  this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
}
var p = Material.prototype;

Material.id = 0;