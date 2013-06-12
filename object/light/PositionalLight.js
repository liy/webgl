// abstract class
function PositionalLight(){
  Light.call(this);

  // vec3, constant, linear and quadratic
  this.attenuation = vec3.fromValues(0, 0, 0);
}
var p = PositionalLight.prototype = Object.create(Light.prototype);

// draw the light volume of the light, so it has less pixels to draw
p.draw = function(shader, camera){

}