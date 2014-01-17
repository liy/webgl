function Geometry(){
  // holding the vec3 objects
  this._vertices = [];
  this._normals = [];
  this._texCoords = [];

  this.faces = [];
  this.indices = [];

  this.id = Geometry.id++;
}
var p = Geometry.prototype;

p.flatData = function(){
  this.vertices = []
  this.normals = []
  this.texCoords = []

  var i, len;
  len = this._vertices.length;
  for(i=0; i<len; ++i){
    this.vertices.push(this._vertices[i].x);
    this.vertices.push(this._vertices[i].y);
    this.vertices.push(this._vertices[i].z);
  }

  len = this._normals.length;
  for(i=0; i<len; ++i){
    this.normals.push(this._normals[i].x);
    this.normals.push(this._normals[i].y);
    this.normals.push(this._normals[i].z);
  }

  len = this._texCoords.length;
  for(i=0; i<len; ++i){
    this.texCoords.push(this._texCoords[i].x);
    this.texCoords.push(this._texCoords[i].y);
    this.texCoords.push(this._texCoords[i].z);
  }
}

p.computeFaceNormal = function(){
  var e1 =
}

p.computeVertexNormal = function(){

}

Geometry.id = 0;