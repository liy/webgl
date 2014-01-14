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

  var currentGeometry = new Geometry();
  // root container
  var parent = new Object3D();
  var currentMesh = new Mesh(geometry);

  // if new geometry is generated, the offset must be updated to the last geometry's vertices.length
  var indexOffset = 0;
  

  function addFace(vi1, vi2, vi3){
    // face only use vertex's index for creation
    var face = new Face3(parseInt(vi1)-indexOffset-1, parseInt(vi2)-indexOffset-1, parseInt(vi3)-indexOffset-1);
    currentGeometry.faces.push(face);
  }

  function addTexCoord(ti1, ti2){
    currentGeometry.texCoords.push(
      tLookup[parseInt(ti1)-indexOffset-1],
      tLookup[parseInt(ti2)-indexOffset-1]
    );
  }

  function addNormal(ni1, ni2, ni3){
    currentGeometry.normals.push(
      nLookup[parseInt(ni1)-indexOffset-1],
      nLookup[parseInt(ni2)-indexOffset-1],
      nLookup[parseInt(ni3)-indexOffset-1]
    );
  }

  function createMesh(){
    currentGeometry = new Geometry();
    currentMesh = new Mesh(currentGeometry);
    parent.add(currentMesh);

    // vertex index must be based on current geometry's vertices array.
    indexOffset += currentGeometry.vertices.length;
  }

  function processFaceLine(vi1, vi2, vi3, vi4, 
    ti1, ti2, ti3, ti4, 
    ni1, ni2, ni3, ni4){
    // triangle face
    if(vi4[3] === undefined){
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
      vLookup.push( new Vec3(parseInt(result[1]), parseInt(result[2]), parseInt(result[3])) );
    }
    else if((result = normal_pattern.exec(line)) !== null) {
      // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      nLookup.push( new Vec3(parseInt(result[1]), parseInt(result[2]), parseInt(result[3])) );
    }
    else if((result = texCoord_pattern.exec(line)) !== null){
      // ["vt 0.1 0.2", "0.1", "0.2"]
      tLookup.push( new Vec2(parseInt(result[1]), parseInt(result[2])) );
    }
    else if((result = face_pattern1.exec(line)) !== null){
      // ["f 1 2 3", "1", "2", "3", undefined]
      processFaceLine(
        result[2], result[6], result[10], result[14] // vertex indices
        // texture coordinate indices
        // normal indices
      );
    }
    else if((result = face_pattern2.exec(line)) !== null){
      // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
      processFaceLine(
        result[2], result[6], result[10], result[14], // vertex indices
        result[3], result[7], result[11], result[15] // texture coordinate indices
        // normal indices
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
        result[2], result[6], result[10], result[14], // vertex indices
        undefined, undefined, undefined, undefined, // texture coordinate indices
        result[4], result[8], result[12], result[16]  // normal indices
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
  console.timeEnd('regexp start');
}