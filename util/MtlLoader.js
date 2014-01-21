/**
 * http://www.sc.ehu.es/ccwgamoa/docencia/Material/FileFormats/wavefrontObj.htm
 */
function ObjMaterial(){
  // // Material newmtl (material name). Begins a new material description.
  // this.newmtl = '';
  // // Ambient color Ka (red) (green) (blue)
  // this.Ka = [];
  // // Diffuse color Ka (red) (green) (blue)
  // this.Kd = [];
  // // Specular color Ka (red) (green) (blue)
  // this.Ks = [];
  // // emission color Ke
  // this.Ke = [];
  // // transparency
  // this.d = 1;
  // this.Tr = 1;
  // // shininess
  // this.Ns = 10;
  // // Illumination model illum (1 / 2); 1 if specular disabled, 2 if specular enabled
  // this.illum = 2;

  // // transmission filter
  // this.Tf = [];

  // // ambient texture map
  // this.map_Ka = '';
  // // diffuse texture map
  // this.map_Kd = '';
  // // specular texture map
  // this.map_Ks = '';
  // // shininess texture
  // this.map_Ns = '';
  // // alpha texture
  // this.map_d = '';
  // // bump texture map
  // this.map_bump = '';


  // Material newmtl (material name). Begins a new material description.
  this.newmtl = '';
  // Ambient color Ka (red) (green) (blue)
  this.ambientColor = [];
  // Diffuse color Ka (red) (green) (blue)
  this.diffuseColor = [];
  // Specular color Ka (red) (green) (blue)
  this.specularColor = [];
  // emissive color Ke
  this.emissiveColor = [];
  // transparency
  this.alpha = 1;
  // shininess
  this.shininess = 10;
  // index of refraction, optical density
  this.ior = 1;

  // Illumination model illum (1 / 2); 1 if specular disabled, 2 if specular enabled
  this.illum = 2;


  this.map = {};
  this.map.albedo = null;
  this.map.specular = null;
  this.map.shininess = null;
  this.map.roughness = null;
  this.map.alpha = null;
  this.map.normal = null;
  this.map.bump = null;
  this.map.displacement = null;
}

ObjMaterial.prototype.hasTexture = function(){
  return this.map_Ka !== '' || this.map_Kd !== '' || this.map_bump !== '';
}

function MtlLoader(){
  // contains materials
  this.materialMap = Object.create(null);
}
var p = MtlLoader.prototype;

p.clear = function(){
  this.materialMap = Object.create(null);
}

p.load = function(path, callback){
  this.callback = callback;

  console.log('loading mtl file: ' + path);

  var xhr = new XMLHttpRequest();
  xhr.open('GET', path, false);
  xhr.onload = bind(this, this.onload);
  xhr.send();
}

p.onload = function(e){
  var lines = e.target.responseText.split('\n');

  var currentMtl;

  var chunks, colour;
  len = lines.length;
  for(var i=0; i<len; ++i){
    var line = lines[i].trim();

    // ignore empty line and comments
    if(line == '' || line.charAt(0) == '#')
      continue;

    chunks = line.split(' ');

    /**
     *
     * Ns 8.000000
     * Ni 1.500000
     * d 1.000000
     * Tr 0.000000
     * Tf 1.000000 1.000000 1.000000
     * illum 2
     * Ka 0.000000 0.000000 0.000000
     * Kd 0.734118 0.730588 0.674118
     * Ks 0.000000 0.000000 0.000000
     * Ke 0.000000 0.000000 0.000000
     * map_Ka kamen.png
     * map_Kd kamen.png
     *   map_bump kamen-bump.png
     *   bump kamen-bump.png
     */

    switch(chunks[0]){
      case 'newmtl':
        currentMtl = new ObjMaterial();
        currentMtl.newmtl = chunks[chunks.length-1];
        this.materialMap[currentMtl.newmtl] = currentMtl;
        break;
      case 'Ns':
        currentMtl.shininess = parseInt(chunks.slice(1));
        break;
      case 'Ni':
        currentMtl.ior = parseInt(chunks.slice(1));
        break;
      case 'd':
      case 'Tr':
        currentMtl.alpha = parseFloat(chunks[chunks.length-1]);
        break;
      case 'illum':
        currentMtl.illum = parseInt(chunks[chunks.length-1]);
        break;
      case 'Ka':
        var strs = chunks.slice(1);
        currentMtl.ambientColor = [parseFloat(strs[0]), parseFloat(strs[1]), parseFloat(strs[2])];
        break;
      case 'Kd':
        var strs = chunks.slice(1);
        currentMtl.diffuseColor = [parseFloat(strs[0]), parseFloat(strs[1]), parseFloat(strs[2])];
        break;
      case 'Ks':
        var strs = chunks.slice(1);
        currentMtl.specularColor = [parseFloat(strs[0]), parseFloat(strs[1]), parseFloat(strs[2])];
        break;
      case 'Ke':
        var strs = chunks.slice(1);
        currentMtl.emissiveColor = [parseFloat(strs[0]), parseFloat(strs[1]), parseFloat(strs[2])];
        break;
      case 'map_Ka':
        currentMtl.map.ambient = chunks[chunks.length-1];
        break;
      case 'map_Kd':
        currentMtl.map.albedo = chunks[chunks.length-1];
        break;
      case 'map_Ks':
        // specular texture
        currentMtl.map.specular = chunks[chunks.length-1];
        break;
      case 'map_Ns':
        // shininess texture
        currentMtl.map.shininess = chunks[chunks.length-1];
        break;
      case 'map_d':
        // alpha texture
        currentMtl.map.alpha = chunks[chunks.length-1];
        break;
      case 'map_bump':
      case 'bump':
        currentMtl.map.bump = chunks[chunks.length-1];
        break;
    }
  }

  console.log('mtl loaded');
  if(this.callback)
    this.callback();
}