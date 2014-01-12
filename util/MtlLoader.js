/**
 * http://www.sc.ehu.es/ccwgamoa/docencia/Material/FileFormats/wavefrontObj.htm
 */
function ObjMaterial(){
  // Material newmtl (material name). Begins a new material description.
  this.newmtl = '';
  // Ambient color Ka (red) (green) (blue)
  this.Ka = [];
  // Diffuse color Ka (red) (green) (blue)
  this.Kd = [];
  // Specular color Ka (red) (green) (blue)
  this.Ks = [];
  // transparency
  this.d = 1;
  this.Tr = 1;
  // shininess
  this.Ns = 10;
  // Illumination model illum (1 / 2); 1 if specular disabled, 2 if specular enabled
  this.illum = 2;

  // transmission filter
  this.Tf = [];

  this.map_Ka = '';
  this.map_Kd = '';
  this.map_bump = '';
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
  xhr.open('GET', path, true);
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
        currentMtl = new ObjMaterial(this._);
        currentMtl.newmtl = chunks[chunks.length-1];
        this.materialMap[currentMtl.newmtl] = currentMtl;
        break;
      case 'Ns':
        currentMtl.Ns = chunks.slice(1);
        break;
      case 'Ni':
        currentMtl.Ni = chunks.slice(1);
        break;
      case 'd':
        currentMtl.d = chunks[chunks.length-1];
        break;
      case 'Tr':
        currentMtl.Tr = chunks[chunks.length-1];
        break;
      case 'Tf':
        currentMtl.Tf = chunks.slice(1);
        break;
      case 'illum':
        currentMtl.illum = chunks[chunks.length-1];
        break;
      case 'Ka':
        currentMtl.Ka = chunks.slice(1);
        break;
      case 'Kd':
        currentMtl.Kd = chunks.slice(1);
        break;
      case 'Ks':
        currentMtl.Ks = chunks.slice(1);
        break;
      case 'Ke':
        currentMtl.Ke = chunks.slice(1);
        break;
      case 'map_Ka':
        currentMtl.map_Ka = chunks[chunks.length-1];
        break;
      case 'map_Kd':
        currentMtl.map_Kd = chunks[chunks.length-1];
        break;
      case 'map_bump':
        currentMtl.map_bump = chunks[chunks.length-1];
        break;
      case 'bump':
        currentMtl.bump = chunks[chunks.length-1];
        break;
    }
  }

  this.callback();
}