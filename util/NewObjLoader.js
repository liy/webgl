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
  xhr.open('GET', this._baseURI+file, false);
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

  var geometries = [];

  var materialNames = [];

  // since geometry's face use index to allocate vertex, the index must be related to current mesh geometry.
  // If new mesh geometry is created, the vertex index must minus the number of previous mesh geometry vertex.
  var vertexIndexOffset = 0;

  // If there is no geometry created, this geometry will be used for storing data.
  // However, if createGeometry function is called, the new geometry will be used.
  var geometry = new Geometry();


  var map = Object.create(null);

  function createGeometry(){
    // vertex index must be based on current geometry's vertices array.
    vertexIndexOffset += geometry.vertices.length;

    // map needs to be cleared.
    map = Object.create(null);

    geometry = new Geometry();
    geometries.push(geometry);
  }

  function addIndex(key, vi, ti, ni){
    var index = map[key];

    if(index !== undefined){
      // console.log("exist index " + map[key]);
      geometry.indexData.push(map[key]);
    }
    else{
      index = map[key] = geometry.vertices.length;

      geometry.indexData.push(index);

      if(vi<0){
        geometry.vertices.push(vLookup[vi + vLookup.length]);

        if(ti)
          geometry.texCoords.push(tLookup[ti + tLookup.length]);
        if(ni)
          geometry.normals.push(nLookup[ni + nLookup.length]);
      }
      else{
        geometry.vertices.push(vLookup[--vi]);

        if(ti)
          geometry.texCoords.push(tLookup[--ti]);
        if(ni)
          geometry.normals.push(nLookup[--ni]);
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

      geometry.faces.push(new Face3(i0, i1, i2));
    }
    // quad face, 2 triangle faces
    else{
      var i0 = addIndex(k1, parseInt(vi1), parseInt(ti1), parseInt(ni1));
      var i1 = addIndex(k2, parseInt(vi2), parseInt(ti2), parseInt(ni2));
      var i3 = addIndex(k4, parseInt(vi4), parseInt(ti4), parseInt(ni4));
      geometry.faces.push(new Face3(i0, i1, i3));

      var i1 = addIndex(k2, parseInt(vi2), parseInt(ti2), parseInt(ni2));
      var i2 = addIndex(k3, parseInt(vi3), parseInt(ti3), parseInt(ni3));
      var i3 = addIndex(k4, parseInt(vi4), parseInt(ti4), parseInt(ni4));
      geometry.faces.push(new Face3(i1, i2, i3));
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
      // object
      createGeometry();
    }
    else if(/^g /.test( line)){
      // group, ignore for now
    }
    else if(/^usemtl /.test(line)){
      // material
      createGeometry();

      // material name for create material once mtl file is loaded.
      materialNames.push(line.substring(7).trim().toLowerCase());
    }
    else if(/^mtllib /.test(line)){
      // mtl file
      this.mtllib = line.split('mtllib')[1].trim();
    }
    else if(/^s /.test(line)){
      // Smooth shading, ignore for now
    }
    else{
      console.warn("ObjLoader: Unhandled line " + line);
    }
  }
  console.timeEnd('regexp start');

  // if no mesh is created. That means the face definition is still in initial geometry, just create a mesh use that geometry
  if(geometries.length === 0)
    geometries.push(geometry);

  // console.log(geometry.vertices);
  // console.log(geometry.normals);
  // console.log(geometry.texCoords);
  // console.log(geometry.indexData);
  // console.log(geometry.faces.length);


  if(this.mtllib){
    this.mtlLoader.load(this._baseURI + this.mtllib);

    var materialTextureMap = {};
    for(var key in this.mtlLoader.materialMap){
      var objMaterial = this.mtlLoader.materialMap[key.toLowerCase()];
      console.log(objMaterial.map);
      materialTextureMap[key] = {};
      for(var type in objMaterial.map){
        if(objMaterial.map[type])
          materialTextureMap[key][type] = TextureManager.instance.add(this._baseURI + objMaterial.map[type]);
      }
    }
    TextureManager.instance.load(bind(this, textureLoaded));

    console.log(materialTextureMap)

    function textureLoaded(){
      for(var i=0; i<materialNames.length; ++i){

      }

      for(var i=0; i<geometries.length; ++i){
        var materialName = materialNames[i];
        var textures = materialTextureMap[materialName];
      }
    }
  }









  // load the materials
  // if(this.mtllib){
  //   this.mtlLoader.load(this._baseURI + this.mtllib);

  //   // TODO: find a better place for texture manager
  //   var materialMap = this.mtlLoader.materialMap;
  //   for(var key in materialMap){
  //     var objMaterial = materialMap[key.toLowerCase()];

  //     console.log('lib: ' + this.mtllib);

  //     if(objMaterial.map_Ka !== '')
  //       TextureManager.instance.add(this._baseURI + objMaterial.map_Ka, objMaterial.map_Ka);
  //     if(objMaterial.map_Kd !== '')
  //       TextureManager.instance.add(this._baseURI + objMaterial.map_Kd, objMaterial.map_Kd);
  //     if(objMaterial.map_bump !== '')
  //       TextureManager.instance.add(this._baseURI + objMaterial.map_bump, objMaterial.map_bump);
  //   }
  //   TextureManager.instance.load(bind(this, textureLoaded));
  // }

  // function textureLoaded(){
  //   var materialMap = this.mtlLoader.materialMap;
  //   var textureLoaderMap = TextureManager.instance.map;

  //   console.log(materialNames);
  //   console.log(materialMap);
  //   console.log(textureLoaderMap);

  //   for(var i=0; i<geometries.length; ++i){

  //     this.ambientColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  //     this.albedoColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  //     this.specularColor = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  //     this.emissionColor = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
  //     this.roughness = 65;

  //     this.ambientTexture = null;
  //     this.albedoTexture = null;
  //     this.specularTexture = null;
  //     this.roughnessTexture = null;

  //     var alpha = 1.0;

  //     var params = {
  //       ambientColor: new Float32Array(materialMap[materialNames[i]].Ka.concat(alpha)),
  //       albedoColor: new Float32Array(materialMap[materialNames[i]].Kd.concat(alpha)),
  //       emissionColor: new Float32Array(materialMap[materialNames[i]].Ke.concat(alpha)),
  //       specularColor: new Float32Array(materialMap[materialNames[i]].Ks.concat(alpha)),
  //     };

  //     // ambient texture? WTF is ambient texture!? environment map?
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_Ka])
  //       params.ambientTexture = textureLoaderMap[materialMap[materialNames[i]].map_Ka].texture;
  //     // diffuse texture
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_Kd])
  //       params.albedoTexture = textureLoaderMap[materialMap[materialNames[i]].map_Kd].texture;
  //     // specular texture map
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_Ks])
  //       params.albedoTexture = textureLoaderMap[materialMap[materialNames[i]].map_Ks].texture;
  //     // shininess texture
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_Ns])
  //       params.albedoTexture = textureLoaderMap[materialMap[materialNames[i]].map_Ns].texture;
  //     // alpha texture
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_d])
  //       params.albedoTexture = textureLoaderMap[materialMap[materialNames[i]].map_d].texture;
  //     // bump texture
  //     if(textureLoaderMap[materialMap[materialNames[i]].map_bump])
  //       params.bumpTexture = textureLoaderMap[materialMap.map_bump].texture;

  //     var material = new BRDFMaterial(params);
  //     var mesh = new Mesh(geometries[i], material);
  //     this.group.add(mesh);
  //   }

  //   this.callback();
  // }
}