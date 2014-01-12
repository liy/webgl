function ObjFace(){
  this.vi = new Array();
  this.ti = new Array();
  this.ni = new Array();

  this.normal = vec3.create();
  this.tangent = vec3.create();
}

/**
 * Add index information to the face
 * @param {[type]} vi [description]
 * @param {[type]} ti [description]
 * @param {[type]} ni [description]
 */
ObjFace.prototype.addIndices = function(vi, ti, ni){
  this.vi.push(vi);

  if(!isNaN(ti)){
    this.ti.push(ti);
  }

  if(!isNaN(ni)){
    this.ni.push(ni);
  }
}

/**
 * Making sure the index are positive and 0 based
 * @param  {[type]} vLookupSize [description]
 * @param  {[type]} tLookupSize [description]
 * @param  {[type]} nLookupSize [description]
 */
ObjFace.prototype.correction = function(vLookupSize, tLookupSize, nLookupSize){
  var i;
  for(i=0; i<this.vi.length; ++i){
    if(this.vi[i] < 0)
      this.vi[i] = vLookupSize + this.vi[i];
    else
      this.vi[i]--;
  }

  for(i=0; i<this.ti.length; ++i){
    if(this.ti[i] < 0)
      this.ti[i] = tLookupSize + this.ti[i];
    else
      this.ti[i]--;
  }

  for(i=0; i<this.ni.length; ++i){
    if(this.ni[i] < 0)
      this.ni[i] = nLookupSize + this.ni[i];
    else
      this.ni[i]--;
  }
}

ObjFace.prototype.calculateFaceNormal = function(vLookup){
  // cross product and normalization to get the face's normal
  var m = vec3.sub(vec3.create(), vLookup[this.vi[1]], vLookup[this.vi[0]]);
  var n = vec3.sub(vec3.create(), vLookup[this.vi[2]], vLookup[this.vi[0]]);
  vec3.cross(this.normal, m, n);
  vec3.normalize(this.normal, this.normal);
}

ObjFace.prototype.calculateSmoothNormal = function(vLookup, nLookup){
  // generate the face normal
  this.calculateFaceNormal(vLookup)

  // Smooth normal only happens on the vertex shared by faces.
  // This means that one vertex has only ONE normal, therefore, the index of normal
  // can be set as the same as the index of vertex.
  this.ni = this.vi;
  // By scanning all the normal indices of this face, accumulate the normal for every vertex.
  for(var i=0; i<this.ni.length; ++i){
    // Add the face's normal to the face's vertex normal, so we can eventually normalize it to
    // get the smoothed normal of the vertex.
    //
    // Note that we are directly updating nLookup 'library' data.
    var vertexNormal = nLookup[this.ni[i]];
    if(vertexNormal)
      vec3.add(vertexNormal, vertexNormal, this.normal);
    else
      nLookup[this.ni[i]] = vec3.clone(this.normal);
  }
}

ObjFace.prototype.calculateTangent = function(vLookup, tLookup, tangentLookup){
  var e1 = vec3.sub(vec3.create(), vLookup[this.vi[1]], vLookup[this.vi[0]]);
  var e2 = vec3.sub(vec3.create(), vLookup[this.vi[2]], vLookup[this.vi[0]]);

  var dv2 = tLookup[this.ti[2]][1] - tLookup[this.ti[0]][1];
  var dv1 = tLookup[this.ti[1]][1] - tLookup[this.ti[0]][1];

  var du2 = tLookup[this.ti[2]][0] - tLookup[this.ti[0]][0];
  var du1 = tLookup[this.ti[1]][0] - tLookup[this.ti[0]][0];

  // calculate tangent of the face
  var t = vec3.scale(vec3.create(), e1, dv2);
  vec3.add(t, t, vec3.scale(vec3.create(), e2, -dv1));
  // determinant for calculate inverse of the tangent space to model space matrix, in order to get
  // model space to tangent space matrix
  var det = du1*dv2 - du2*dv1;
  vec3.scale(t, t, 1.0/det);

  // set tangent for all vertices of the face
  for(var i=0; i<3; ++i){
    var tangent = tangentLookup[this.vi[i]];
    // needs normalize all the tangents again, when all the face's tangent calculation completed.
    if(tangent)
      vec3.add(tangent, tangent, t);
    else
      tangentLookup[this.vi[i]] = vec3.clone(t);
  }
}

function ObjMesh(){
  this.usemtl = null;

  this.vertices = new Array();
  this.texCoords = new Array();
  this.normals = new Array();
  this.tangents = new Array();

  this.startIndex = 0;
}


function ObjLoader(flatShading, useIndex){
  if(flatShading)
    this.flatShading = flatShading;
  else
    this.flatShading = false;

  this.mtllib = null;
  this.mtlLoader = new MtlLoader();
  // material changes will generate meshes
  this.meshes = [];
}
var p = ObjLoader.prototype;

p.clear = function(){
  this.mtlLoader.clear();
  this.meshes.length = 0;
  this.mtllib = null;
  currentMesh = null;
}

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

  console.time('parsing obj complete');

  var lines = e.target.responseText.split('\n');

  // keeping token string of the line
  var tokens, parts;
  // for loop index
  var i,j,k,len;

  // vertex, texture coordinates, normals and faces. Contains flat coordinate values, float(Number).
  // Will be directly used by OpenGL to setup data buffer.
  this.vertices = new Array();
  this.texCoords = new Array();
  this.normals = new Array();

  // index array. Points to the library data.
  // Note that only in smooth shading mode, the index element could be enabled.
  // Because in smooth shading mode, one vertex only have exact ONE normal; however in flat shading mode,
  // a vertex shared by different faces will need multiple normals, which cannot be expressed by single index.
  // e.g.,
  // a vertex 'V' in vertex array is expressed by index location: 'I'.
  // In the normal array there is an entry 'N' pointed by 'I'. In flat shading mode if the index is shared by multiple faces, normal should be different
  // But you cannot locate the different normals use the same index 'I'.
  this.indices = new Array();

  // tangents
  this.tangents = new Array();

  // Contains Flat32Array data.
  // Consider the vertex, texture coordinate and normal data definitions in obj files as a 'library'.
  // In other words, these look up array contains actual data. The face definition only contains index which
  // reference to the look up array, the actual data.
  //
  // In some cases, for example, the normals might be missing in the obj file. We just need to generate(use face's normal, cross product) correct
  // normal for every vertex, and then make sure the face's ni(normal index) is pointed to the corresponding generate normal.
  var vLookup = new Array();
  var tLookup = new Array();
  var nLookup = new Array();

  // tangent lookup, for bump map
  var tangentLookup = new Array();

  // Keeping track the face definition in the obj file.
  // Only 3 vertex(3 texture coordinate indices, 3 normal indices) indices stored, that is a triangle.
  // It contains face's vertex, texture coordinate and normal **index** points to the
  // corresponding 'library': XLookup array.
  var faces = new Array();

  // texture coordinate component size. Some obj file has different component size
  this.texCoordComponentSize = 2;

  // temp element for vertex, texture coordinates and normal.
  var element;

  // material changes will generate meshes
  this.meshes = [];

  // keeping track of current mesh
  var currentMesh = null;

  len = lines.length;
  for(var i=0; i<len; ++i){
    var line = lines[i];

    // ignore empty line and comments
    if(line.trim() == '' || line.charAt(0) == '#')
      continue;

    // extract the data from obj file
    switch(line.substr(0, 2)){
      case 'v ':
        tokens = line.substr(1).trim().split(' ');
        element = new Float32Array(tokens.length);
        for(j=0; j<tokens.length; ++j){
          element[j] = Number(tokens[j]);
        }
        vLookup.push(element);
        break;
      case 'vt':
        tokens = line.substr(2).trim().split(' ');
        this.texCoordComponentSize = tokens.length;
        element = new Float32Array(tokens.length);
        for(j=0; j<tokens.length; ++j){
          element[j] = Number(tokens[j]);
        }
        tLookup.push(element);
        break;
      case 'vn':
        tokens = line.substr(2).trim().split(' ');
        element = new Float32Array(tokens.length);
        for(j=0; j<3; ++j){
          element[j] = Number(tokens[j]);
        }
        nLookup.push(element);
        break;
      case 'f ':

        // We need triangle face, it is easier to handle.
        // If obj file has 4 vertices, break them into 2 triangle faces.
        var vi = new Array();
        var ti = new Array();
        var ni = new Array();
        tokens = line.substr(1).trim().split(' ');
        for(j=0; j<tokens.length; ++j){
          parts = tokens[j].split('/');
          vi.push(parseInt(parts[0]));
          ti.push(parseInt(parts[1]));
          ni.push(parseInt(parts[2]));
        }

        var face = new ObjFace();
        face.addIndices(vi[0], ti[0], ni[0]);
        face.addIndices(vi[1], ti[1], ni[1]);
        face.addIndices(vi[2], ti[2], ni[2]);
        faces.push(face);

        if(currentMesh)
            currentMesh.faces.push(face);
        else{
          // possibly only one mesh, no usemtl defined.
          currentMesh = new ObjMesh();
          this.meshes.push(currentMesh);
          currentMesh.faces = new Array();
          currentMesh.startIndex = faces.length*3;
        }

        if(vi.length === 4){
          face = new ObjFace();
          face.addIndices(vi[2], ti[2], ni[2]);
          face.addIndices(vi[3], ti[3], ni[3]);
          face.addIndices(vi[0], ti[0], ni[0]);
          faces.push(face);
          currentMesh.faces.push(face);
        }
        break;
      // usemtl
      case 'us':
        currentMesh = new ObjMesh();
        this.meshes.push(currentMesh);
        currentMesh.usemtl = line.split('usemtl')[1].trim();
        currentMesh.faces = new Array();
        currentMesh.startIndex = faces.length*3;
        break;
      // mtllib
      case 'mt':
        this.mtllib = line.split('mtllib')[1].trim();
        break;
    }
  }

  console.log('parse complete');

  // obj file's index can be negative and they are 1 based.
  // Correct the face index definition, making sure they are positive and 0 based.
  len = faces.length;
  for(i=0; i<len; ++i){
    faces[i].correction(vLookup.length, tLookup.length, nLookup.length);
  }

  // if no normals definition in obj file. Auto generate them using face's normal(smooth process can be also performed)
  if(nLookup.length === 0){
    if(this.flatShading){
      // flat shading. Using face's normal for every corresponding vertex.
      // First we generate face normal for every faces, and push them into the 'library', nLookup.
      // Then scan face's ni(normal index array), points them to the current normal data from nLookup.
      for(i=0; i<len; ++i){
        var face = faces[i];
        face.calculateFaceNormal(vLookup);
        nLookup.push(face.normal);

        // Make the face's normal index points to the current face normal in the nLookup library array
        for(j=0; j<face.vi.length; ++j){
          face.ni[j] = nLookup.length-1;
        }
      }
    }
    else{
      // We update the 'library' nLookup by accumulating the adjacent faces' normal.
      // The face's ni is empty because no definition is given in obj file, also needs to be updated.(Detail refers to the method)
      for(i=0; i<len; ++i){
        faces[i].calculateSmoothNormal(vLookup, nLookup);
      }
      // Once all the faces' normal are generated, normalize them to get the smooth averaged normal
      for(i=0; i<nLookup.length; ++i){
        // FIXME: some nLookup entry might be undefined, I guess it is the obj data file's bug
        if(nLookup[i])
          vec3.normalize(nLookup[i], nLookup[i]);
      }
    }
  }

  if(tLookup.length !== 0){
    // calculate tangent
    for(i=0; i<len; ++i){
      faces[i].calculateTangent(vLookup, tLookup, tangentLookup);
    }
    // normalize all the tangent again
    for(i=0; i<tangentLookup.length; ++i){
        vec3.normalize(tangentLookup[i], tangentLookup[i]);
    }
  }

  // generate the vertices, texture coordinates and normals data properly for OpenGL.
  for(i=0; i<len; ++i){
    var face = faces[i];

    // vertices
    for(j=0; j<face.vi.length; ++j){
      element = vLookup[face.vi[j]];
      for(k=0; k<element.length; ++k){
        this.vertices.push(element[k]);
      }
    }

    // texture coordinate
    for(j=0; j<face.ti.length; ++j){
      element = tLookup[face.ti[j]];
      for(k=0; k<element.length; ++k){
        this.texCoords.push(element[k]);
      }
    }

    // normals
    for(j=0; j<face.ni.length; ++j){
      element = nLookup[face.ni[j]];
      for(k=0; k<element.length; ++k){
        this.normals.push(element[k]);
      }
    }

    // tangents
    if(tangentLookup.length !== 0){
      for(j=0; j<face.vi.length; ++j){
        element = tangentLookup[face.vi[j]];
        for(var k=0; k<element.length; ++k){
          this.tangents.push(element[k]);
        }
      }
    }
  }


  // meshes
  for(i=0; i<this.meshes.length; ++i){
    var mesh = this.meshes[i];
    for(j=0; j<mesh.faces.length; ++j){
      var face = faces[j];

      // vertices
      for(k=0; k<face.vi.length; ++k){
        element = vLookup[face.vi[k]];
        for(l=0; l<element.length; ++l){
          mesh.vertices.push(element[l]);
        }
      }

      // texture coordinate
      for(k=0; k<face.ti.length; ++k){
        element = tLookup[face.ti[k]];
        for(l=0; l<element.length; ++l){
          mesh.texCoords.push(element[l]);
        }
      }

      // normals
      for(k=0; k<face.ni.length; ++k){
        element = nLookup[face.ni[k]];
        for(var l=0; l<element.length; ++l){
          mesh.normals.push(element[l]);
        }
      }

      // tangents
      if(tangentLookup.length !== 0){
        for(k=0; k<face.vi.length; ++k){
          element = tangentLookup[face.vi[k]];
          for(var l=0; l<element.length; ++l){
            mesh.tangents.push(element[l]);
          }
        }
      }
    }
  }

  console.log('vLookup: ' + vLookup.length);
  console.log('tLookup: ' + tLookup.length);
  console.log('nLookup: ' + nLookup.length);
  console.log('tangentLookup: ' + tangentLookup.length);
  console.log('vertices: ' + this.vertices.length);
  console.log('texCoords: ' + this.texCoords.length);
  console.log('normals: ' + this.normals.length);
  console.log('tangents: ' + this.tangents.length);
  console.log('faces: ' + faces.length);
  console.log('meshes: ' + this.meshes.length);
  console.log('indices: ' + this.indices.length);

  console.timeEnd('parsing obj complete');

  // load the materials
  if(this.mtllib){
    this.mtlLoader.load(this._baseURI + this.mtllib, bind(this, this.callback));
  }
  else{
    this.callback();
  }
}