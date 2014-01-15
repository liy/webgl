function NewObjLoader(){
  //
}
var p = NewObjLoader.prototype;

p.load = function(baseURI, file, callback){
  this.callback = callback;
  this._baseURI = baseURI;

  console.log('loading: ' + this._baseURI + file);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', this._baseURI+file, true);
  xhr.onload = bind(this, this.onload);
  xhr.send();
}

p.onload = function(e){
  console.log('parsing obj file...');

  var lines = e.target.responseText.split( "\n" );
  var result, line;

  // v float float float
  var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
  // vn float float float
  var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
  // vt float float
  var texCoord_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)?/;
  // f v v v ...
  var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;
  // f v/uv v/uv v/uv ...
  var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;
  // f v/uv/n v/uv/n v/uv/n ...
  var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;
  // f v//n v//n v//n ...
  var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/

  var vLookup = [];
  var tLookup = [];
  var nLookup = [];

  var meshes = [];

  // since geometry's face use index to allocate vertex, the index must be related to current mesh geometry.
  // If new mesh geometry is created, the vertex index must minus the number of previous mesh geometry vertex.
  var vertexIndexOffset = 0;

  // If there is no geometry created, this geometry will be used for storing data.
  // However, if createMesh function is called, the new geometry will be used.
  var geometry = new Geometry();

  function addFace(vi1, vi2, vi3){
    var face;

    vi1 = parseInt(vi1);
    vi2 = parseInt(vi2);
    vi3 = parseInt(vi3);
    if(vi1 < 0){
      vi1 += vLookup.length;
      vi2 += vLookup.length;
      vi3 += vLookup.length;
      // face only use vertex's index for creation
      face = new Face3(vi1, vi2, vi3);
    }
    else{
      --vi1;
      --vi2;
      --vi3;
      // face only use vertex's index for creation
      face = new Face3(vi1-vertexIndexOffset, vi2-vertexIndexOffset, vi3-vertexIndexOffset);
    }
    geometry.faces.push(face);

    geometry.vertices.push(vLookup[vi1], vLookup[vi2], vLookup[vi3]);
  }

  function addTexCoord(ti1, ti2){
    ti1 = parseInt(ti1);
    ti2 = parseInt(ti2);
    if(ti1 < 0){
      ti1 += tLookup.length;
      ti2 += tLookup.length;
    }
    else{
      --ti1;
      --ti2;
    }

    geometry.texCoords.push(tLookup[ti1], tLookup[ti2]);
  }

  function addNormal(ni1, ni2, ni3){
    ni1 = parseInt(ni1);
    ni2 = parseInt(ni2);
    ni3 = parseInt(ni3);
    if(ni1 < 0){
      ni1 += tLookup.length;
      ni2 += tLookup.length;
      ni3 += tLookup.length;
    }
    else{
      --ni1;
      --ni2;
      --ni3; 
    }

    geometry.normals.push(nLookup[ni1], nLookup[ni2], nLookup[ni3]);
  }

  function createMesh(){
    // vertex index must be based on current geometry's vertices array.
    vertexIndexOffset += geometry.vertices.length;

    geometry = new Geometry();
    var mesh = new Mesh(geometry);
    meshes.push(mesh);
  }

  function processFaceLine(vi1, vi2, vi3, vi4, 
    ti1, ti2, ti3, ti4, 
    ni1, ni2, ni3, ni4){
    // triangle face
    if(vi4 === undefined){
      addFace(vi1, vi2, vi3);
      
      if(ti1 !== undefined)
        addTexCoord(ti1, ti2, ti3);

      if(ni1 !== undefined)
        addNormal(ni1, ni2, ni3);
    }
    // quad face
    else{
      // create 2 triangle faces
      addFace(vi1, vi2, vi4);
      addFace(vi2, vi3, vi4);

      if(ti1 !== undefined){
        addTexCoord(ti1, ti2, ti3);
        addTexCoord(ti2, ti3, ti4);
      }

      if(ni1 !== undefined){
        addNormal(ni1, ni2, ni3);
        addNormal(ni2, ni3, ni4);
      }
    }
  }

  console.time('regexp start');

  var len = lines.length;
  for(var i=0; i<len; i++) {
    line = lines[i].trim();

    if(line.length === 0 || line.charAt(0) === '#')
      continue;

    if((result = vertex_pattern.exec(line)) !== null){
      // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      vLookup.push( new Vec3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])) );
    }
    else if((result = normal_pattern.exec(line)) !== null) {
      // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      nLookup.push( new Vec3(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3])) );
    }
    else if((result = texCoord_pattern.exec(line)) !== null){
      // ["vt 0.1 0.2", "0.1", "0.2"]
      tLookup.push( new Vec2(parseFloat(result[1]), parseFloat(result[2])) );
    }
    else if((result = face_pattern1.exec(line)) !== null){
      // ["f 1 2 3", "1", "2", "3", undefined]
      processFaceLine(
        result[1], result[2], result[3], result[4] // vertex indices
      );
    }
    else if((result = face_pattern2.exec(line)) !== null){
      // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
      processFaceLine(
        result[2], result[5], result[8], result[11], // vertex indices
        result[3], result[6], result[9], result[12] // texture coordinate indices
      );
    }
    else if((result = face_pattern3.exec(line)) !== null){
      // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
      processFaceLine(
        result[2], result[6], result[10], result[14], // vertex indices
        result[3], result[7], result[11], result[15], // texture coordinate indices
        result[4], result[8], result[12], result[16]  // normal indices
      );
    }
    else if((result = face_pattern4.exec(line)) !== null){
      // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
      processFaceLine(
        result[2], result[5], result[6], result[11], // vertex indices
        undefined, undefined, undefined, undefined,   // texture coordinate indices
        result[3], result[6], result[7], result[12]  // normal indices
      );
    }
    else if(/^o /.test(line)){
      // object
      createMesh();
    }
    else if(/^g /.test( line)){
      // group, ignore for now
    }
    else if(/^usemtl /.test(line)){
      // material
      createMesh();
    }
    else if(/^mtllib /.test(line)){
      // mtl file
    }
    else if(/^s /.test(line)){
      // Smooth shading, ignore for now
    }
    else{
      console.warn("ObjLoader: Unhandled line " + line);
    }
  }

  // if no mesh is created. That means the face definition is still in initial geometry, just create a mesh use that geometry
  if(meshes.length === 0)
    meshes.push(new Mesh(geometry));

  console.timeEnd('regexp start');

  console.log(meshes[0].geometry.vertices.length/3);
}