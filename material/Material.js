function Material(){
  this.id = Material.id++;

  this.color = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

  // stores the actual webgl texture object.
  this.texture = {};
}
var p = Material.prototype;

Material.id = 0;