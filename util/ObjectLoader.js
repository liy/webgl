function Face(){
  this.vi = new Array();
  this.ti = new Array();
  this.ni = new Array();

  this.normal = vec3.create();
}

Face.prototype.addIndices = function(vi, ti, ni){
  this.vi.push(vi);

  if(!isNaN(ti)){
    this.ti.push(ti);
  }

  if(!isNaN(ni)){
    this.ni.push(ni);
  }
}

Face.prototype.correction = function(numVertices, numTexCoords, numNormals){
  var i;
  for(i=0; i<this.vi.length; ++i){
    if(this.vi[i] < 0)
      this.vi[i] = numVertices + this.vi[i];
    else
      this.vi[i]--;
  }

  for(i=0; i<this.ti.length; ++i){
    if(this.ti[i] < 0)
      this.ti[i] = numTexCoords + this.ti[i];
    else
      this.ti[i]--;
  }

  for(i=0; i<this.ni.length; ++i){
    if(this.ni[i] < 0)
      this.ni[i] = numNormals + this.ni[i];
    else
      this.ni[i]--;
  }
}

Face.prototype.calculateNormal = function(loader){
  var vertices = loader.vertices;
  var m = vec3.fromValues(
    vertices[this.vi[1]*3]   - vertices[this.vi[0]*3],
    vertices[this.vi[1]*3+1] - vertices[this.vi[0]*3+1],
    vertices[this.vi[1]*3+2] - vertices[this.vi[0]*3+2]);
  var n = vec3.fromValues(
    vertices[this.vi[2]*3]   - vertices[this.vi[0]*3],
    vertices[this.vi[2]*3+1] - vertices[this.vi[0]*3+1],
    vertices[this.vi[2]*3+2] - vertices[this.vi[0]*3+2]);
  vec3.cross(this.normal, m, n);
  vec3.normalize(this.normal, this.normal);

  // accumulate the normals. Needs normalization when all faces' normals are generated
  for(var i=0; i<3; ++i){
    var vertexNormal = loader._vertexNormals[this.vi[i]];
    if(vertexNormal)
      vec3.add(loader._vertexNormals[this.vi[i]], vertexNormal, this.normal);
    else
      loader._vertexNormals[this.vi[i]] = this.normal;
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

  // keeping token string of the line
  var tokens, parts;
  // for loop index
  var i,j,k,len;

  // vertex, texture coordinates, normals and faces
  this.vertices = new Array();
  this.texCoords = new Array();
  this.normals = new Array();
  var faces = new Array();

  // indices
  this.indices = new Array();

  // temporary look up array
  var texCoordsLookup = new Array();
  var normalsLookup = new Array();

  // texture coordinate component size.
  var t_size = 2;

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
        tokens = line.substr(1).trim().split(' ');
        for(j=0; j<3; ++j){
          this.vertices.push(Number(tokens[j]));
        }
        break;
      case 'vt':
        tokens = line.substr(2).trim().split(' ');
        t_size = tokens.length;
        for(j=0; j<t_size; ++j){
          texCoordsLookup.push(Number(tokens[j]));
        }
        break;
      case 'vn':
        tokens = line.substr(2).trim().split(' ');
        for(j=0; j<3; ++j){
          normalsLookup.push(Number(tokens[j]));
        }
        break;
      case 'f ':
        var face = new Face();
        tokens = line.substr(1).trim().split(' ');
        for(j=0; j<tokens.length; ++j){
          parts = tokens[j].split('/');
          face.addIndices(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
        }
        faces.push(face);
        break;
    }
  }

  var numVertices = this.vertices.length/3;
  var numTexCoords = texCoordsLookup.length/t_size;
  var numNormals = normalsLookup.length/3;

  // face's indices correction
  len = faces.length;
  for(i=0; i<len; ++i){
    faces[i].correction(numVertices, numTexCoords, numNormals);
  }

  // re-organize the texCoords and normals(if any)
  for(i=0; i<faces.length; ++i){
    var face = faces[i];

    if(face.ti.length !== 0){
      for(j=0; j<face.vi.length; ++j){

        // ******** the texCoords index is
        this.texCoords[ face.vi[j]*t_size ] = texCoordsLookup[ face.ti[j]*t_size ];
        this.texCoords[ face.vi[j]*t_size+1 ] = texCoordsLookup[ face.ti[j]*t_size+1 ];

        // console.log(texCoordsLookup);
        console.log(face.ti);
        // console.log(face.ti[j]*t_size, face.ti[j]*t_size+1)
        // console.log(texCoordsLookup[ face.ti[j]*t_size ], texCoordsLookup[ face.ti[j]*t_size+1 ])
        // if(t_size === 3)
        //   this.texCoords[ face.vi[j]*t_size+2 ] = texCoordsLookup[ face.ti[j]*t_size+2 ];
      }
    }

    if(face.ni.length !== 0){
      for(j=0; j<face.ni.length; ++j){
        this.normals[ face.ni[j]*3 ] = normalsLookup[ face.ni[j]*3 ];
        this.normals[ face.ni[j]*3+1 ] = normalsLookup[ face.ni[j]*3+1 ];
        this.normals[ face.ni[j]*3+2 ] = normalsLookup[ face.ni[j]*3+2 ];
      }
    }
  }

  // calculate normals if no normals are given
  if(this.normals.length === 0){
    // calculate normals
    for(i=0; i<faces.length; ++i){
      faces[i].calculateNormal(this);
    }
    // normalize vertex normal
    for(i=0; i<this._vertexNormals.length; ++i){
      if(!this._vertexNormals[i])
        continue;
      vec3.normalize(this._vertexNormals[i], this._vertexNormals[i]);
      this.normals[i*3] = this._vertexNormals[i][0];
      this.normals[i*3+1] = this._vertexNormals[i][1];
      this.normals[i*3+2] = this._vertexNormals[i][2];
    }
  }

  // indices
  for(i=0; i<faces.length; ++i){
    var face = faces[i];
    this.indices.push(face.vi[0]);
    this.indices.push(face.vi[1]);
    this.indices.push(face.vi[2]);

    if(face.vi.length > 3){
      this.indices.push(face.vi[0]);
      this.indices.push(face.vi[2]);
      this.indices.push(face.vi[3]);
    }
  }

  // console.log(this.texCoords);

  // console.log(this.vertices, this.texCoords);

  // console.log(this.indices);

  console.timeEnd('split');
  this.callback();
}