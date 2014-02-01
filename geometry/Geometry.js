function Geometry(){
  // holding the vec3 objects
  this.vertices = [];
  this.normals = [];
  this.texCoords = [];
  this.tangents = [];
  this.bitangents = [];

  this.faces = [];

  this.indexData = [];

  this.id = Geometry.id++;
}
var p = Geometry.prototype;

p.computeFaceNormal = function(){
  var len = this.faces.length;
  for(var i=0; i<len; ++i){
    var face = this.faces[i];
    var v1 = this.vertices[face.a];
    var v2 = this.vertices[face.b];
    var v3 = this.vertices[face.c];

    // var e1 = v2.clone().sub(v1);
    var e1 = vec3.sub(vec3.create(), v2, v1);
    // var e2 = v3.clone().sub(v1);
    var e2 = vec3.sub(vec3.create(), v3, v1);
    // this.faces[i].normal = e1.cross(e2).normalize();
    vec3.normalize(this.faces[i].normal, vec3.cross(vec3.create(), e1, e2));
  }
}

p.computeVertexNormal = function(useFaceNormal){
  var i;

  // set all vertex normal to 0
  var len = this.vertices.length;
  if(useFaceNormal){
    for(i=0; i<len; ++i){
      // this.normals[i] = new Vec3(0,0,0);
      this.normals[i] = vec3.create();
    }  
  }

  len = this.faces.length;
  for(var i=0; i<len; ++i){
    var face = this.faces[i];

    var v1 = this.vertices[face.a];
    var v2 = this.vertices[face.b];
    var v3 = this.vertices[face.c];

    // var e1 = v2.clone().sub(v1);
    var e1 = vec3.sub(vec3.create(), v2, v1);
    // var e2 = v3.clone().sub(v1);
    var e2 = vec3.sub(vec3.create(), v3, v1);
    // var n = e1.cross(e2);
    var n = vec3.cross(vec3.create(), e1, e2);

    // this.normals[face.a].add(n);
    vec3.add(this.normals[face.a], this.normals[face.a], n);
    // this.normals[face.b].add(n);
    vec3.add(this.normals[face.b], this.normals[face.b], n);
    // this.normals[face.c].add(n);
    vec3.add(this.normals[face.c], this.normals[face.c], n);
  }

  // TODO: do I need to normalize this? It would be normalized in the vertex shader or fragment shader...
  for(var i=0; i<this.normals.length; ++i){
    // this.normals[i].normalize();
    vec3.normalize(this.normals[i], this.normals[i]);
  }
}


p.computeTangent = function(){
  // initialze the tangents and bitangents.
  for(var i=0; i<this.vertices.length; ++i){
    // this.tangents[i] = new Vec3(0, 0, 0);
    this.tangents[i] = vec3.create();
    // this.bitangents[i] = new Vec3(0,0,0);
    this.bitangents[i] = vec3.create();
  }

  for(var i=0; i<this.faces.length; ++i){
    var face = this.faces[i];

    // edge 1,2 in model space
    // var e1 = this.vertices[face.b].clone().sub(this.vertices[face.a]);
    var e1 = vec3.sub(vec3.create(), this.vertices[face.b], this.vertices[face.a]);
    // var e2 = this.vertices[face.c].clone().sub(this.vertices[face.a]);
    var e2 = vec3.sub(vec3.create(), this.vertices[face.c], this.vertices[face.a]);

    // edges in texture space, m means map...
    // var m1 = this.texCoords[face.b].clone().sub(this.texCoords[face.a]);
    var m1 = vec2.sub(vec2.create(), this.texCoords[face.b], this.texCoords[face.a]);
    // var m2 = this.texCoords[face.c].clone().sub(this.texCoords[face.a]);
    var m2 = vec2.sub(vec2.create(), this.texCoords[face.c], this.texCoords[face.a]);

    // determinant of the 2x2 matrix
    // var det = 1/(m1.x*m2.y - m2.x*m1.y);
    var det = 1/(m1[0]*m2[1] - m2[0]*m1[1]);


    // tangent
    // var T = new Vec3(
    //   (e1.x*m2.y - e2.x*m1.y) * det,
    //   (e1.y*m2.y - e2.y*m1.y) * det,
    //   (e1.z*m2.y - e2.z*m1.y) * det);
    var T = vec3.fromValues(
      (e1[0]*m2[1] - e2[0]*m1[1]) * det,
      (e1[1]*m2[1] - e2[1]*m1[1]) * det,
      (e1[2]*m2[1] - e2[2]*m1[1]) * det);

    // bitangent
    // var B = new Vec3(
    //   (e2.x*m1.x - e1.x*m2.x) * det,
    //   (e2.y*m1.x - e1.y*m2.x) * det,
    //   (e2.z*m1.x - e1.z*m2.x) * det);
    var B = vec3.fromValues(
      (e2[0]*m1[0] - e1[0]*m2[0]) * det,
      (e2[1]*m1[0] - e1[1]*m2[0]) * det,
      (e2[2]*m1[0] - e1[2]*m2[0]) * det);


    // this.tangents[face.a].add(T);
    // this.tangents[face.b].add(T);
    // this.tangents[face.c].add(T);
    vec3.add(this.tangents[face.a], this.tangents[face.a], T);
    vec3.add(this.tangents[face.b], this.tangents[face.b], T);
    vec3.add(this.tangents[face.c], this.tangents[face.c], T);

    // this.bitangents[face.a].add(B);
    // this.bitangents[face.b].add(B);
    // this.bitangents[face.c].add(B);
    vec3.add(this.bitangents[face.a], this.bitangents[face.a], B);
    vec3.add(this.bitangents[face.b], this.bitangents[face.b], B);
    vec3.add(this.bitangents[face.c], this.bitangents[face.c], B);
  }

  for(var i=0; i<this.tangents.length; ++i){
    // this.tangents[i].normalize();
    // this.bitangents[i].normalize();
    vec3.normalize(this.tangents[i], this.tangents[i]);
    vec3.normalize(this.bitangents[i], this.bitangents[i]);
  }

  // console.log(this.bitangents);

  // for(var i=0; i<this.vertices.length/3; ++i){
  //   var n = vec3.fromValues(this.normals[i*3], this.normals[i*3+1], this.normals[i*3+2]);
  //   var t = vec3.fromValues(this.tangents[i*4], this.tangents[i*4+1], this.tangents[i*4+2]);
  //   var b = vec3.fromValues(this.bitangents[i*3], this.bitangents[i*3+1], this.bitangents[i*3+2]);

  //   t = vec3.sub(t, t, vec3.scale(vec3.create(), n, vec3.dot(n, t)));


  //   // Testing =======
  //   // t = vec3.fromValues(1, 0, 0);
  //   // b = vec3.fromValues(0, 1, 0);
  //   // =============


  //   vec3.normalize(t, t);
  //   this.tangents[i*4] = t[0];
  //   this.tangents[i*4+1] = t[1];
  //   this.tangents[i*4+2] = t[2];
  //   this.tangents[i*4+3] = (vec3.dot(vec3.cross(vec3.create(), n, t), b) < 0) ? -1 : 1;

  //   vec3.normalize(b, b);
  //   this.bitangents[i*3] = b[0];
  //   this.bitangents[i*3+1] = b[1];
  //   this.bitangents[i*3+2] = b[2];
  // }
}

Geometry.id = 0;