define(function(require){

  var ImageResource = require('assets/resource/ImageResource');
  var Shader = require('assets/resource/Shader');

  "use strict"
  var Library = {
    init: function(){
      // default resourceStore
      var resourceStore = Library.resourceStore = {};

      /**
       * Image resource key has it corresponding extension
       * Shader resource key extension is shader
       * Sound resource key will be have its corresponding extension
       */
      this.resourceStore = {
        'posx.jpg': new ImageResource('../webgl-meshes/cube_map/posx.jpg'),
        'negx.jpg': new ImageResource('../webgl-meshes/cube_map/negx.jpg'),
        'posy.jpg': new ImageResource('../webgl-meshes/cube_map/posy.jpg'),
        'negy.jpg': new ImageResource('../webgl-meshes/cube_map/negy.jpg'),
        'posz.jpg': new ImageResource('../webgl-meshes/cube_map/posz.jpg'),
        'negz.jpg': new ImageResource('../webgl-meshes/cube_map/negz.jpg'),


        'directional.shader': new Shader('src/shader/light/directional.vert', 'src/shader/light/directional.frag'),
        'point.shader': new Shader('src/shader/light/point.vert', 'src/shader/light/point.frag'),

        'geometry.shader': new Shader('src/shader/geometry.vert', 'src/shader/geometry.frag'),
        'screen.shader': new Shader('src/shader/screen.vert', 'src/shader/screen.frag'),
        'skybox.shader': new Shader('src/shader/skybox.vert', 'src/shader/skybox.frag'),
        'stencil.shader': new Shader('src/shader/stencil.vert', 'src/shader/stencil.frag'),
        'synthesis.shader': new Shader('src/shader/synthesis.vert', 'src/shader/synthesis.frag'),

        'probe_debug.shader': new Shader('src/shader/probe/probe_debug.vert', 'src/shader/probe/probe_debug.frag'),
        'probe_geometry.shader': new Shader('src/shader/probe/probe_geometry.vert', 'src/shader/probe/probe_geometry.frag'),
        'probe_synthesis.shader': new Shader('src/shader/probe/probe_synthesis.vert', 'src/shader/probe/probe_synthesis.frag')
      };
    }
  }

  Library.get = function(url){
    return resourceStore[url] || this._createResource(url);
  }

  Library.load = function(){
    var resources = [];
    for(var key in Library.resourceStore){
      resources.push(Library.resourceStore[key]);
    }
    console.log(resources);
    return Promise.all(resources);
  }

  Library._createResource = function(url){
    var dotIndex = url.lastIndexOf(".");
    var ext = url.substring(index+1);
    var name = url.substring(0, index);

    switch(ext.toLowerCase()){
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "tga":
        return new ImageResource(url);
      case "shader":
        return new Shader(name+'.vert', name+'.frag');
    }
  }

  return Library;
});






// Library.get = function(url){
//   var resource = Library.defaultStore[url];

//   if(!resource)
//     resource = this.defaultStore[url] = this.createResource(url);

//   return resource;
// }

// Library.createResource = function(url){
//   var resource;
//   var ext = url.substring(url.lastIndexOf(".")+1);
//   switch(ext.toLowerCase()){
//     case "jpg":
//     case "jpeg":
//     case "png":
//     case "gif":
//     case "bmp":
//     case "tga":
//       resource = new ImageResource(url);
//       break;
//     default:
//       console.error("Unknown extension:", ext);
//       break;
//   }

//   return resource;
// }

