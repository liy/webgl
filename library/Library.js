(function(window){
  "use strict"

  window.Library = {
    init: function(){
      // default resourceStore
      var resourceStore = Library.resourceStore = {};

      /**
       * Image resource key has it corresponding extension
       * Shader resource key extension is shader
       * Sound resource key will be have its corresponding extension
       */
      resourceStore = {
        'posx.jpg': new ImageResource('../webgl-meshes/cube_map/posx.jpg'),
        'negx.jpg': new ImageResource('../webgl-meshes/cube_map/negx.jpg'),
        'posy.jpg': new ImageResource('../webgl-meshes/cube_map/posy.jpg'),
        'negy.jpg': new ImageResource('../webgl-meshes/cube_map/negy.jpg'),
        'posz.jpg': new ImageResource('../webgl-meshes/cube_map/posz.jpg'),
        'negz.jpg': new ImageResource('../webgl-meshes/cube_map/negz.jpg'),


        'directional.shader': new Shader('shader/light/directional.vert', 'shader/light/directional.frag'),
        'point.shader': new Shader('shader/light/point.vert', 'shader/light/point.frag'),

        'geometry.shader': new Shader('shader/geometry.vert', 'shader/geometry.frag'),
        'screen.shader': new Shader('shader/screen.vert', 'shader/screen.frag'),
        'skybox.shader': new Shader('shader/skybox.vert', 'shader/skybox.frag'),
        'stencil.shader': new Shader('shader/stencil.vert', 'shader/stencil.frag'),
        'synthesis.shader': new Shader('shader/synthesis.vert', 'shader/synthesis.frag'),

        'probe_debug.shader': new Shader('shader/probe/probe_debug.vert', 'shader/probe/probe_debug.frag'),
        'probe_geometry.shader': new Shader('shader/probe/probe_geometry.vert', 'shader/probe/probe_geometry.frag'),
        'probe_synthesis.shader': new Shader('shader/probe/probe_synthesis.vert', 'shader/probe/probe_synthesis.frag')
      };
    }
  }

})(window);



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

