function SkyBox(faces){
  Mesh.call(this, new SkyBoxGeometry(), new Material());

  this.material.setCubeMap(faces)
}
var p = SkyBox.prototype = Object.create(Mesh.prototype);