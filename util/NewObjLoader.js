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

  var result, line;
  var vertices = new Array(3);
  var normals = new Array(3);
  var texCoords = new Array(3);

  function createFace(vi1, vi2, vi3){
    var face = new Face3(vi1, vi2, vi3);
  }

  function createMesh(){
    var geometry = new Geometry();
    geometry.vertices = vertices;

    var mesh = new Mesh(geometry, material);
  }

  function processFaceLine(vIndices, tIndices, nIndices){
    // triangle face
    if(vIndices[3] === undefined){
      var face = createFace(parseInt(vIndices[0]), parseInt(vIndices[1]), parseInt(vIndices[2]));
    }
    // quad face
    else{
      // create 2 triangle faces
      var face = createFace(parseInt(vIndices[0]), parseInt(vIndices[1]), parseInt(vIndices[3]));

      face = createFace(parseInt(vIndices[1]), parseInt(vIndices[2]), parseInt(vIndices[3]));
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
      vertices.push(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]));
    }
    else if((result = normal_pattern.exec(line)) !== null) {
      // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
      normals.push(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]));
    }
    else if((result = texCoord_pattern.exec(line)) !== null){
      // ["vt 0.1 0.2 0.3", "0.1", "0.2", "0,3"]
      texCoords.push(parseInt(result[1]), parseInt(result[2]), parseInt(result[3]));
    }
    else if((result = face_pattern1.exec(line)) !== null){
      // ["f 1 2 3", "1", "2", "3", undefined]
      processFaceLine(
        [result[2], result[6], result[10], result[14]], // vertex indices
        [], // texture coordinate indices
        []  // normal indices
      );
    }
    else if((result = face_pattern2.exec(line)) !== null){
      // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
      processFaceLine(
        [result[2], result[6], result[10], result[14]], // vertex indices
        [result[3], result[7], result[11], result[15]], // texture coordinate indices
        []  // normal indices
      );
    }
    else if((result = face_pattern3.exec(line)) !== null){
      // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
      processFaceLine(
        [result[2], result[6], result[10], result[14]], // vertex indices
        [result[3], result[7], result[11], result[15]], // texture coordinate indices
        [result[4], result[8], result[12], result[16]]  // normal indices
      );
    }
    else if((result = face_pattern4.exec(line)) !== null){
      // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
      processFaceLine(
        [result[2], result[6], result[10], result[14]], // vertex indices
        [], // texture coordinate indices
        [result[4], result[8], result[12], result[16]]  // normal indices
      );
    }
    else if(/^o /.test(line)){
      // object
    }
    else if(/^g /.test( line)){
      // group
    }
    else if(/^usemtl /.test(line)){
      // material
    }
    else if(/^mtllib /.test(line)){
      // mtl file
    }
    else if(/^s /.test(line)){
      // Smooth shading
    }
    else{
      console.warn("ObjLoader: Unhandled line " + line);
    }
  }
  console.timeEnd('regexp start');
}