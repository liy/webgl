function Face(){
  this.indices = indices;
}

function ObjectLoader(path, callback){
  this.path = path;
  this.callback = callback;

  // keeping track of byte position
  this._position = 0;

  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, true);
  xhr.onload = bind(this, this.onload);
  xhr.send();
}
var p = ObjectLoader.prototype;

p.onload = function(e){
  console.time('split');
  var text = e.target.responseText;
  var lines = text.split('\n');

  var vertices = new Array();
  var texCoords_temp = new Array();
  var normals_temp = new Array();

  var vertexIndices = new Array();
  var texCoordIndices = new Array();

  // keeping values of the line
  var values;
  // for loop index
  var i,j,k,len;

  // number of texture coordinate components
  var texCoordsCompSize = 3;

  // for WebGL drawElements
  this.indices = new Array();
  
  len = lines.length;
  for(var i=0; i<len; ++i){
    var line = lines[i];

    // empty line and comments
    if(line.trim() == '' || line.charAt(0) == '#')
      continue;

    switch(line.substr(0, 2)){
      case 'v ':
        values = line.substr(1).trim().split(' ');
        for(j=0; j<3; ++j){
          vertices.push(Number(values[j]));
        }
        break;
      case 'vt':
        values = line.substr(2).trim().split(' ');
        texCoordsCompSize = values.length;
        for(j=0; j<texCoordsCompSize; ++j){
          texCoords_temp.push(Number(values[j]));
        }
        break;
      case 'vn':
        values = line.substr(2).trim().split(' ');
        for(j=0; j<3; ++j){
          normals_temp.push(Number(values[j]));
        }
        break;
      case 'f ':
        var tempIndices = new Array();

        values = line.substr(1).trim().split(' ');
        for(j=0; j<values.length; ++j){
          var parts = values[j].split('/');

          tempIndices.push(parseInt(parts[0])-1);
          vertexIndices.push(parseInt(parts[0])-1);
          texCoordIndices.push(parseInt(parts[1])-1);
        }

        this.indices.push(tempIndices[0]);
        this.indices.push(tempIndices[1]);
        this.indices.push(tempIndices[2]);
        if(tempIndices.length > 3){
          this.indices.push(tempIndices[0]);
          this.indices.push(tempIndices[2]);
          this.indices.push(tempIndices[3]);
        }
        break;
    }
  }

  // vertices are ready to use straight away.
  this.vertices = vertices;

  this.texCoords = new Array();
  this.normals = new Array();
  // fix up the indices.
  len = vertexIndices.length;
  for(i=0; i<len; ++i){
    for(j=0; j<texCoordsCompSize; ++j){
      this.texCoords[i*texCoordsCompSize + j] = texCoords_temp[texCoordIndices[i]*texCoordsCompSize + j];
    }
  }

  // console.log(this.vertices);
  // console.log(this.texCoords);
  // console.log(this.indices);

  console.timeEnd('split');

  this.callback();
}