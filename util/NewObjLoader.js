function NewObjLoader(){
  //
}
var p = NewObjLoader.prototype;

p.load = function(baseURI, file, callback){
  this.callback = callback;
  this._baseURI = baseURI;

  this.mtllib = null;
  this.mtlLoader = new MtlLoader();

  this.group = new Object3D();

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

  var indexOffset = 0;

var geometry = new Geometry();
geometry.vertexMap = Object.create(null);
  // just in case no mtl is defined.
  var currentMesh = new Mesh(geometry, new Material());

  // holds meshes
  var meshMap = Object.create(null);

  // load material
  function loadMtl(){
    var len = lines.length;
    for(var i=0; i<len; i++){
      var line = lines[i];
      // ignore comments
      if(line.length === 0 || line.charAt(0) === '#')
        continue;

      if(/^mtllib /.test(line)){
        this.mtllib = line.split('mtllib')[1].trim();
        this.mtlLoader.load(this._baseURI, this.mtllib, bind(this, mtlOnload));
        return;
      }
      else if((result = vertex_pattern.exec(line)) !== null){
        bind(this, parse)();
        return;
      }
    }
  }
  bind(this, loadMtl)();

  function mtlOnload(){
    // find out all the material information.
    for(var name in this.mtlLoader.matInfoMap){
      var material = new Material();
      material.setImageMap(this.mtlLoader.matInfoMap[name].imageMap);
      // TODO: set color etc...

      var geometry = new Geometry();
      // each geometry has a vertex map to check whether a certain vertex already exist.
      geometry.vertexMap = Object.create(null);
      meshMap[name] = new Mesh(geometry, material);
    }

    // TODO: continue parse vertex normal tex data, etc...
    bind(this, parse)();
  }














  function switchMesh(name){
    // some obj file missing mtl...
    if(meshMap[name])
      currentMesh = meshMap[name];
  }

  function addIndex(key, vi, ti, ni){
    var currentGeometry = currentMesh.geometry;
    var index = currentGeometry.vertexMap[key];


    if(index !== undefined){
      // console.log("exist index " + meshMap[key]);
      currentGeometry.indexData.push(currentGeometry.vertexMap[key]);
    }
    else{
      index = currentGeometry.vertexMap[key] = currentGeometry.vertices.length;

      currentGeometry.indexData.push(index);

      if(vi<0){
        currentGeometry.vertices.push(vLookup[vi + vLookup.length]);

        if(ti)
          currentGeometry.texCoords.push(tLookup[ti + tLookup.length]);
        if(ni)
          currentGeometry.normals.push(nLookup[ni + nLookup.length]);
      }
      else{
        currentGeometry.vertices.push(vLookup[--vi]);

        if(ti)
          currentGeometry.texCoords.push(tLookup[--ti]);
        if(ni)
          currentGeometry.normals.push(nLookup[--ni]);
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
      currentMesh.geometry.faces.push(new Face3(i0, i1, i2));
    }
    // quad face, 2 triangle faces
    else{
      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i1 = addIndex(k2, parseInt(vi2), parseInt(ti2), parseInt(ni2));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      currentMesh.geometry.faces.push(new Face3(i0, i1, i2));

      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      var i3 = addIndex(k4, parseInt(vi4), parseInt(ti4), parseInt(ni4));
      currentMesh.geometry.faces.push(new Face3(i1, i2, i3));
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
        // ["f 1 2 3", "1", "2", "3", undefined]
        processFaceLine(
          result[1], result[2], result[3], result[4],  // map key
          result[1], result[2], result[3], result[4] // vertex indices
        );
      }
      else if((result = face_pattern2.exec(line)) !== null){
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
        switchMesh(line.substring(7).trim().toLowerCase());
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

    for(var name in meshMap){
      meshMap[name].createBuffer();
      this.group.add(meshMap[name]);

      // console.log(meshMap[name].geometry.vertices);
      // console.log(meshMap[name].geometry.normals);
      // console.log(meshMap[name].geometry.texCoords);
      // console.log(meshMap[name].geometry.indexData);
    }

    if(this.group.children.length == 0){
      currentMesh.createBuffer();
      this.group = currentMesh;
    }

    if(this.callback)
      this.callback();
  }
}