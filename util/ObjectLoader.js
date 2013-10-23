function TriangleFace(i1, i2, i3){
  // vertex indices
  this.indices = [i1, i2, i3];
  this.normal = vec3.create();
}
TriangleFace.prototype.calculateNormal = function(loader){
  var vertices = loader.vertices;
  var m = vec3.fromValues(
    vertices[this.indices[1]]   - vertices[this.indices[0]],
    vertices[this.indices[1]+1] - vertices[this.indices[0]+1],
    vertices[this.indices[1]+2] - vertices[this.indices[0]+2]);
  var n = vec3.fromValues(
    vertices[this.indices[2]]   - vertices[this.indices[0]],
    vertices[this.indices[2]+1] - vertices[this.indices[0]+1],
    vertices[this.indices[2]+2] - vertices[this.indices[0]+2]);
  vec3.cross(this.normal, m, n);
  vec3.normalize(this.normal, this.normal);

  // accumulate the normals. Needs normalization when all faces' normals are generated
  for(var i=0; i<3; ++i){
    var vertexNormal = loader._vertexNormals[this.indices[i]];
    if(vertexNormal)
      vec3.add(loader._vertexNormals[this.indices[i]], vertexNormal, this.normal);
    else
      loader._vertexNormals[this.indices[i]] = this.normal;
  }
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

  this.vertices = new Array();
  this.texCoords = new Array();
  this.normals = new Array();

  var texCoords_temp = new Array();
  var normals_temp = new Array();

  var vertexIndices = new Array();
  var texCoordIndices = new Array();
  var normalIndices = new Array();

  var faces = new Array();

  // keeping values of the line
  var values;
  // for loop index
  var i,j,k,len;

  // number of texture coordinate components
  var texCoordsCompSize = 3;

  // for WebGL drawElements
  this.indices = new Array();

  // every time a face normal is generated, the normal will be added against corresponding vertex's _vertexNormals.
  // When all the face normals generation completed, all the vertices's _vertexNormals will be normalized
  this._vertexNormals = new Array();

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
          this.vertices.push(Number(values[j]));
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
        var faceVertexIndices = new Array();

        values = line.substr(1).trim().split(' ');
        for(j=0; j<values.length; ++j){
          var parts = values[j].split('/');

          faceVertexIndices.push(parseInt(parts[0])-1);
          vertexIndices.push(parseInt(parts[0])-1);
          texCoordIndices.push(parseInt(parts[1])-1);
          normalIndices.push(parseInt(parts[2])-1);
        }

        // face
        this.indices.push(faceVertexIndices[0]);
        this.indices.push(faceVertexIndices[1]);
        this.indices.push(faceVertexIndices[2]);
        faces.push(new TriangleFace(faceVertexIndices[0], faceVertexIndices[1], faceVertexIndices[2]));
        if(faceVertexIndices.length > 3){
          this.indices.push(faceVertexIndices[0]);
          this.indices.push(faceVertexIndices[1]);
          this.indices.push(faceVertexIndices[2]);
          faces.push(new TriangleFace(faceVertexIndices[2], faceVertexIndices[0], faceVertexIndices[3]));
        }
        break;
    }
  }

  // fix up the indices.
  // len = vertexIndices.length;
  // for(i=0; i<len; ++i){
  //   for(j=0; j<texCoordsCompSize; ++j){
  //     this.texCoords[i*texCoordsCompSize + j] = texCoords_temp[texCoordIndices[i]*texCoordsCompSize + j];
  //    }
  // }
  this.texCoords = texCoords_temp;

  if(normals_temp.length == 0){
    // calculate normals
    for(i=0; i<faces.length; ++i){
      faces[i].calculateNormal(this);
    }
    // normalize vertex normal
    for(i=0; i<this._vertexNormals.length; ++i){
      vec3.normalize(this._vertexNormals[i], this._vertexNormals[i]);
      this.normals[i*3] = this._vertexNormals[i][0];
      this.normals[i*3+1] = this._vertexNormals[i][1];
      this.normals[i*3+2] = this._vertexNormals[i][2];
    }
  }
  else
    this.normals = normals_temp;

  console.log(this.normals.length, this.vertices.length, this.indices.length);
  console.log(this.texCoords);
  console.log(this.vertices);
  console.log(this.indices);

  console.timeEnd('split');
  this.callback();
}