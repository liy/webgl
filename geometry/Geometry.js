function Geometry(){
  // holding the vec3 objects
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];

  this.faces = [];

  this.indexData = [];

  this.id = Geometry.id++;
}
var p = Geometry.prototype;

p.genData = function(){
  // holding the WebGL friendly, flattened attribute arrays. Pure float in the array.
  this.vertexData = [];
  this.normalData = [];
  this.texCoordData = [];

  var i, len;
  len = this.vertices.length;
  for(i=0; i<len; ++i){
    this.vertexData.push(this.vertices[i].x);
    this.vertexData.push(this.vertices[i].y);
    this.vertexData.push(this.vertices[i].z);
  }

  len = this.normals.length;
  for(i=0; i<len; ++i){
    this.normalData.push(this.normals[i].x);
    this.normalData.push(this.normals[i].y);
    this.normalData.push(this.normals[i].z);
  }

  len = this.texCoords.length;
  for(i=0; i<len; ++i){
    this.texCoordData.push(this.texCoords[i].x);
    this.texCoordData.push(this.texCoords[i].y);
    this.texCoordData.push(this.texCoords[i].z);
  }
}

p.computeFaceNormal = function(){
  var len = this.faces.length;
  for(var i=0; i<len; ++i){
    var face = this.faces[i];
    var v1 = this.vertices[face.a];
    var v2 = this.vertices[face.b];
    var v3 = this.vertices[face.c];
    var e1 = v2.clone().sub(v1);
    var e2 = v3.clone().sub(v1);
    this.faces[i].normal = e1.cross(e2).normalize();
  }
}

p.computeVertexNormal = function(useFaceNormal){
  var i;

  // set all vertex normal to 0
  var len = this.vertices.length;
  for(i=0; i<len; ++i){
    var normal = this.normals[i];
    if(normal===undefined)
      this.normals[i] = new Vec3(0,0,0);
    else
      normal.x = normal.y = normal.z = 0;
  }


  len = this.faces.length;
  if(useFaceNormal){
    for(i=0; i<len; ++i){
      var face = this.faces[i];

      this.normals[face.a] = face.normal.clone();
      this.normals[face.b] = face.normal.clone();
      this.normals[face.c] = face.normal.clone();
    }
  }
  else{
    

    for(i=0; i<len; ++i){
      var face = this.faces[i];

      var v1 = this.vertices[face.a];
      var v2 = this.vertices[face.b];
      var v3 = this.vertices[face.c];
      var e1 = v2.clone().sub(v1);
      var e2 = v3.clone().sub(v1);
      var n = e1.cross(e2);

      this.normals[face.a].add(n);
      this.normals[face.b].add(n);
      this.normals[face.c].add(n);
    }

  }
  

  // normalize vertex normal
  len = this.vertices.length;
  for(i=0; i<len; ++i){
    this.normals[i].normalize();
  }
}

Geometry.id = 0;