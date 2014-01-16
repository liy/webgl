function Geometry(){
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.faces = [];
  this.indices = [];

  this.id = Geometry.id++;
}

Geometry.id = 0;