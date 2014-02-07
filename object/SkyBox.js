function SkyBox(){
  Mesh.call(this, new SkyBoxGeometry(), new Material());
}
var p = SkyBox.prototype = Object.create(Mesh.prototype);