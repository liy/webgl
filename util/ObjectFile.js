function ObjectFile(){
  //
}
var p = ObjectFile.prototype;

p.load = function(url, callback){
  var idx = url.lastIndexOf('/');
  this.url = url;
  this.fileName = url.substring(idx);
  this.dir = url.substring(0, idx+1);
  this.callback = callback;

  // whether normal is defined in the obj file.
  this.normalDefined = true;
  this.texCoordDefined = true;

  // material file name
  this.matFileName = null;

  // material file loader
  this.matFile = new ObjectMatFile();

  // it contains the 
  this.object = new Object3D();

  console.log('loading: ' + this.url);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', this.url, true);
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

  var geometry = new Geometry();
  // every geometry has a vertex map to store unique vertex. This is only used in object file parsing, not a part of geometry class.
  geometry._vertexMap = Object.create(null);

  // current pointer of meshInfo, so we can push model data into vertex, normal and uv array.
  var currentMeshInfo = {
    geometry: geometry, 
    material: new Material()
  };

  // holds meshes information. Create meshes only when geometry is ready.
  var meshInfoMap = Object.create(null);

  function loadMatFile(){
    var len = lines.length;
    for(var i=0; i<len; i++){
      var line = lines[i];
      // ignore comments
      if(line.length === 0 || line.charAt(0) === '#')
        continue;

      if(/^mtllib /.test(line)){
        this.matFileName = line.split('mtllib')[1].trim();
        this.matFile.load(this.dir+this.matFileName, bind(this, onMatFileLoaded));
        return;
      }
      else if((result = vertex_pattern.exec(line)) !== null){
        bind(this, parse)();
        return;
      }
    }
  }
  bind(this, loadMatFile)();

  // material file loaded
  function onMatFileLoaded(){
    // find out all the material information.
    for(var name in this.matFile.matInfoMap){
      var material = new Material();
      material.setImageMap(this.matFile.matInfoMap[name].imageMap);
      // TODO: set color etc...

      var geometry = new Geometry();
      geometry._vertexMap = Object.create(null);
      meshInfoMap[name] = {
        geometry: geometry,
        material: material
      };
    }

    // continue parse vertex normal tex data, etc...
    bind(this, parse)();
  }


  // switch to specific mesh definition, so the vertex data can be correctly pushed into.
  function useMeshInfo(name){
    // some obj file missing mtl... then just use the default mesh info object.
    if(meshInfoMap[name])
      currentMeshInfo = meshInfoMap[name];
  }

  function addIndex(key, vi, ti, ni){
    var currentGeometry = currentMeshInfo.geometry;
    var index = currentGeometry._vertexMap[key];

    if(index !== undefined){
      // console.log("exist index " + currentGeometry._vertexMap[key]);
      currentGeometry.indexData.push(currentGeometry._vertexMap[key]);
    }
    else{
      index = currentGeometry._vertexMap[key] = currentGeometry.vertices.length;

      currentGeometry.indexData.push(index);

      if(vi<0){
        currentGeometry.vertices.push(vLookup[vi + vLookup.length]);

        if(ti)
          currentGeometry.texCoords.push(tLookup[ti + tLookup.length]);
        if(ni)
          currentGeometry.normals.push(nLookup[ni + nLookup.length]);
        else{
          ni = vi + vLookup.length;
          // ensure the same normal vector is shared by different vertex, so later Geometry class
          // can perform smooth easily.
          if(nLookup[ni] === undefined)
            nLookup[ni] = new Vec3();
          currentGeometry.normals.push(nLookup[ni]);
        }
      }
      else{
        currentGeometry.vertices.push(vLookup[--vi]);

        if(ti)
          currentGeometry.texCoords.push(tLookup[--ti]);
        if(ni)
          currentGeometry.normals.push(nLookup[--ni]);
        else{
          // ensure the same normal vector is shared by different vertex, so later Geometry class
          // can perform smooth easily.
          if(nLookup[vi] === undefined)
            nLookup[vi] = new Vec3();
          currentGeometry.normals.push(nLookup[vi]);
        }
      }
    }

    return index;
  }

  function processFaceLine(
    k1, k2, k3, k4,
    vi1, vi2, vi3, vi4,
    ti1, ti2, ti3, ti4,
    ni1, ni2, ni3, ni4){

    // 1 triangle face
    if(vi4 === undefined){
      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i1 = addIndex(k2, parseInt(vi2), parseInt(ti2), parseInt(ni2));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      currentMeshInfo.geometry.faces.push(new Face3(i0, i1, i2));
    }
    // quad face, 2 triangle faces
    else{
      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i1 = addIndex(k2, parseInt(vi2), parseInt(ti2), parseInt(ni2));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      currentMeshInfo.geometry.faces.push(new Face3(i0, i1, i2));

      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      var i3 = addIndex(k4, parseInt(vi4), parseInt(ti4), parseInt(ni4));
      currentMeshInfo.geometry.faces.push(new Face3(i0, i2, i3));
    }
  }

  function parse(){
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
        this.normalDefined = false;
        this.texCoordDefined = false;
        // ["f 1 2 3", "1", "2", "3", undefined]
        processFaceLine(
          result[1], result[2], result[3], result[4],  // map key
          result[1], result[2], result[3], result[4] // vertex indices
        );
      }
      else if((result = face_pattern2.exec(line)) !== null){
        this.normalDefined = false;
        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        processFaceLine(
          result[1], result[4], result[7], result[10],  // map key
          result[2], result[5], result[8], result[11], // vertex indices
          result[3], result[6], result[9], result[12] // texture coordinate indices
        );
      }
      else if((result = face_pattern3.exec(line)) !== null){
        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
        processFaceLine(
          result[1], result[5], result[9], result[13],  // map key
          result[2], result[6], result[10], result[14], // vertex indices
          result[3], result[7], result[11], result[15], // texture coordinate indices
          result[4], result[8], result[12], result[16]  // normal indices
        );
      }
      else if((result = face_pattern4.exec(line)) !== null){
        this.texCoordDefined = false;
        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
        processFaceLine(
          result[1], result[4], result[7], result[10],  // map key
          result[2], result[5], result[6], result[11], // vertex indices
          undefined, undefined, undefined, undefined,   // texture coordinate indices
          result[3], result[6], result[7], result[12]  // normal indices
        );
      }
      else if(/^o /.test(line)){
        // object, ignore.
      }
      else if(/^g /.test( line)){
        // group, ignore.
      }
      else if(/^usemtl /.test(line)){
        useMeshInfo(line.substring(7).trim().toLowerCase());
      }
      else if(/^mtllib /.test(line)){
        // do nothing... since it is handled already.
      }
      else if(/^s /.test(line)){
        // Smooth shading, ignore for now
      }
      else{
        console.warn("ObjLoader: Unhandled line " + line);
      }
    }
    console.timeEnd('regexp start');

    for(var name in meshInfoMap){
      var mesh = new Mesh(meshInfoMap[name].geometry, meshInfoMap[name].material)
      this.object.add(mesh);

      // console.log(meshInfoMap[name].geometry.vertices);
      // console.log(meshInfoMap[name].geometry.normals);
      // console.log(meshInfoMap[name].geometry.texCoords);
      // console.log(meshInfoMap[name].geometry.indexData);
    }

    // handles the case that the object file does not mtl defined.
    if(this.object.children.length === 0)
      this.object = new Mesh(currentMeshInfo.geometry, currentMeshInfo.material);

    if(this.callback)
      this.callback();
  }
}