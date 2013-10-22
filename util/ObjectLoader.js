function Face(indices){
  this.indices = indices;
}

var COMMENT = 35;

var MATERIAL_NAME = 'usemtl';
var MATERIAL_LIBRARY = 'mtllib';

var V = 118;
var T = 116;
var N = 110;

var P = 112;

var L = 108;
var F = 102;

var G = 103;

var SLASH = 47;

var NEW_LINE = 10;

var SPACE = 32;

var EMPTY = 13;

function ObjectLoader(path, callback){
  this.path = path;
  this.callback = callback;

  this.materialName = '';
  this.materialLibrary = '';

  this._vertices = new Array();
  this._texCoords = new Array();
  this._normals = new Array();
  this._faces = new Array();

  this._indices = new Array();

  this._type = null;

  var xhr = new XMLHttpRequest();
  xhr.responseType = "arraybuffer";
  xhr.open('GET', path, true);
  xhr.onload = bind(this, this.onload);
  xhr.send();
}
var p = ObjectLoader.prototype;

p.onload = function(e){
  this.data = e.target.response;
  this.stream = new DataStream(this.data, 0, DataStream.LITTLE_ENDIAN);

  var counter = 0;

  // temp vertex texture coordinate index
  var vtIndices = [];
  // temp vertex normal index
  var vnIndices = [];

  // temp texture coordinates
  var texCoords = [];
  // temp normals
  var normals = [];

  var i;
  while(!this.stream.isEof()){
    var line = this.readLine();
    if(line.trim() == '' || line.charAt(0) == '#')
      continue;
    else{
      switch(line.charAt(0)){
        // vertex related
        case 'v':
          var chunks;
          var secondChar = line.charAt(1);
          // texture coordinate
          if(secondChar == 't'){
            chunks = line.substring(2).trim().split(' ');
            for(i=0; i<3; ++i){
              texCoords.push(Number(chunks[i]));
            }
          }
          // normal
          else if(secondChar == 'n'){
            chunks = line.substring(2).trim().split(' ');
            for(i=0; i<3; ++i){
              normals.push(Number(chunks[i]));
            }
          }
          // vertex
          else{
            chunks = line.substring(1).trim().split(' ');
            for(i=0; i<3; ++i){
              this._vertices.push(Number(chunks[i]));
            }
          }
        break;
        // faces
        case 'f':
          var faceIndices = [];
          chunks = line.substring(1).trim().split(' ');
          for(i=0; i<chunks.length; ++i){
            var parts = chunks[i].split('/');

            faceIndices.push(parseInt(parts[0])-1);
            this._indices.push(parseInt(parts[0])-1);

            vtIndices.push(parseInt(parts[1])-1);
            if(parts.length === 3)
              vnIndices.push(parseInt(parts[2])-1);
          }
          var face = new Face(faceIndices)
          this._faces.push(face);
        break;
      }
    }
  }

  // whether the file has normal information
  var hasNormals = (vnIndices.length != 0);

  if(!hasNormals){
    this.generateNormals();
  }

  // fix up the vertex, texture and normal index, so they match together using same index that vertex uses.
  for(i=0; i<this._indices.length; ++i){
    // x
    this._texCoords[i*3] = texCoords[(vtIndices[i])*3];
    // y
    this._texCoords[i*3+1] = texCoords[(vtIndices[i])*3 + 1];
    // w
    this._texCoords[i*3+2] = texCoords[(vtIndices[i])*3 + 2];

    if(hasNormals){
      this._normals[i*3] = normals[(vtIndices[i])*3];
      this._normals[i*3+1] = normals[(vtIndices[i])*3 + 1];
      this._normals[i*3+2] = normals[(vtIndices[i])*3 + 2];
    }
  }

  console.log(this._indices.length);
  // console.log(this._texCoords);
  // console.log(this._faces);

  this.callback();
}

p.generateNormals = function(){

  var v0 = vec3.fromValues(face.indices[0]);
  var v0 = vec3.fromValues(face.indices[0]);
  var v0 = vec3.fromValues(face.indices[0]);
  var n = face.indices[1]
}

p.readLine = function(){
  var string = '';
  while(true){
    if(this.stream.isEof())
      return string;

    var byte = this.stream.readUint8Array(1)[0];

    if(byte == NEW_LINE)
      break;

    string += String.fromCharCode(byte);
  }
  return string;
}

p.nextLine = function(){
  while(this.stream.readUint8Array(1)[0] != NEW_LINE && !this.stream.isEof()){};
}

p.skipSpaces = function(){
  while(true){
    var byte = this.stream.readUint8Array(1)[0];
    if(this.stream.isEof() || (byte != SPACE && byte != EMPTY))
      return;
  }
}

p.getTriangleIndices = function(){
  var indices = new Array();
  for(var i=0; i<this._faces.length; ++i){
    var face = this._faces[i];
    indices.push(face.indices[0]);
    indices.push(face.indices[1]);
    indices.push(face.indices[2]);
    if(face.indices.length > 3){
      indices.push(face.indices[0]);
      indices.push(face.indices[2]);
      indices.push(face.indices[3]);
    }
  }
  return indices;
}