function DirectionalLight(){
  Light.prototype.call(this);
  
}
var p = DirectionalLight.prototype = Object.create(Light.prototype);