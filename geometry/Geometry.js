function Geometry(){
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.faces = [];

  this.id = Geometry.id++;
}

Geometry.id = 0;