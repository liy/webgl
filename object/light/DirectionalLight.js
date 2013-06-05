function DirectionalLight(){
  Light.call(this);
}
var p = DirectionalLight.prototype = Object.create(Light.prototype);

// origin to the light source
Object.defineProperty(p, "direction", {
  get: function(){
    return this._position;
  }
});