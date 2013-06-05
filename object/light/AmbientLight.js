function AmbientLight(){
  Light.call(this);

}
var p = AmbientLight.prototype = Object.create(Light.prototype);