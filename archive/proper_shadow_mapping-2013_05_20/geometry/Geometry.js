function Geometry(){
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];

  this.id = Geometry.id++;
}

Geometry.id = 0;