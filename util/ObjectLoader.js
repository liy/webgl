function Face(chunks){
  this.vi = [];
  this.ti = [];
  this.ni = [];
  for(var i=0; i<chunks.length; ++i){
    var parts = chunks[i].split('/');
    this.vi.push(parseInt(parts[0]));
    this.ti.push(parseInt(parts[1]));
    if(parts.length == 3)
      this.ni.push(parseInt(parts[1]));
  }
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

  console.log('onl9');
  // var header = this.stream.readUint8Array(200);
  // for(var i=0; i<header.length; ++i){
  //   var char = String.fromCharCode(header[i]);

  //   switch(char){
  //     case '\n':
  //     case '#':
  //     case 'v':
  //     case 't':

  //       // console.log(char, header[i]);
  //       break;
  //   }
  //   console.log(char)
  // }
  
  var counter = 0;


  var i;
  while(!this.stream.isEof()){
  // while(++counter <= 10){
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
              this._texCoords.push(Number(chunks[i]));
            }
          }
          // normal
          else if(secondChar == 'n'){
            chunks = line.substring(2).trim().split(' ');
            for(i=0; i<3; ++i){
              this._normals.push(Number(chunks[i]));
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
          chunks = line.substring(1).trim().split(' ');
          this._faces.push(new Face(chunks));
        break;
      }
    }
  }

  // console.log(this._faces.length);

  this.callback();
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

p.getIndices = function(){
  var indices = new Array();
  for(var i=0; i<this._faces.length; ++i){
    indices = indices.concat(this._faces[i].vi);
  }
  console.log(indices.length, this._vertices.length);
  return indices;
}