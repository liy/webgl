function DeferredRenderer(){
  this.canvas = document.createElement('canvas');
  document.body.appendChild(this.canvas);
  this.canvas.width = window.innerWidth;
  this.canvas.height = window.innerHeight;
  window.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');

  this.GBufferWidth = 1280;
  this.GBufferHeight = 1280;

  window.addEventListener('resize', this.onResize);

  this.dbExt = gl.getExtension("WEBGL_draw_buffers");
  this.dtExt = gl.getExtension("WEBGL_depth_texture");
  this.vaoExt = gl.getExtension("OES_vertex_array_object");

  // include extensions' properties into gl, for convenience reason.
  var exts = [this.dbExt, this.dtExt, this.vaoExt];
  ExtensionCheck.check(exts);
  for(var i=0; i<exts.length; ++i){
    var ext = exts[i];
    for(var name in ext){
      if(gl[name] === undefined){
        if(ext[name] instanceof Function){
          (function(e, n){
            gl[n] = function(){
              return e[n].apply(e, arguments);
            }
          })(ext, name);
        }
        else
          gl[name] = ext[name];
      }
      else
        console.error('gl conflict name in extension: ' + ext +' name: ' + name);
    }
  }

  
  this.geometryPass = new GeometryPass(this, this.GBufferWidth, this.GBufferHeight);
  this.lightPass = new LightPass(this, this.GBufferWidth, this.GBufferHeight);
  this.synthesisPass = new SynthesisPass(this, this.GBufferWidth, this.GBufferHeight);
  this.screenPass = new ScreenPass(this, this.GBufferWidth, this.GBufferHeight);

  
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
var p = DeferredRenderer.prototype;

p.render = function(scene, camera){
  // update the matrix
  this.update();
  
  this.geometryPass.render(scene, camera);
  this.lightPass.render(scene, camera);
  this.synthesisPass.render(scene, camera);
  this.screenPass.render(scene, camera);
}

p.update = function(){
  // update all object's matrix, which are not dependent on the view matrix
  var len = scene.children.length;
  for(var i=0; i<len; ++i){
    scene.children[i].update();
  }

  // update meshes' view dependent matrix
  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    var mesh = scene.meshes[i];
    // update model view matrix, normal matrix
    mat4.mul(mesh.modelViewMatrix, camera.viewMatrix, mesh.worldMatrix);
    mat3.normalFromMat4(mesh.normalMatrix, mesh.modelViewMatrix);
  }

  // update skybox view dependent matrix
  len = scene.skyBoxes.length;
  for(var i=0; i<len; ++i){
    var skyBox = scene.skyBoxes[i];
    // update model view matrix, normal matrix
    // TODO: Where to drop the translation part? Here or in sky box's vertex shader.
    mat4.mul(skyBox.modelViewMatrix, camera.viewMatrix, skyBox.worldMatrix);
    // no normal matrix needed.
    // mat3.normalFromMat4(skyBox.normalMatrix, skyBox.modelViewMatrix);
  }

  // update the lights' view dependent matrix
  len = scene.lights.length;
  for(var i=0; i<len; ++i){
    var light = scene.lights[i];
    // update light's view dependent matrix, and related position, etc.
    mat4.mul(light.modelViewMatrix, camera.viewMatrix, light.worldMatrix);
    vec3.transformMat4(light._viewSpacePosition, light._position, camera.viewMatrix);
  }
}


function sort(camera){
  return function(a, b){
    // if(a.translucent != b.translucent){
    //   if(b.translucent)
    //     return 1;
    //   else
    //     return -1;
    // }

    // if(a.texture != b.texture){
    //   if(a.texture < b.texture)
    //     return 1;
    //   else
    //     return -1;
    // }

    // if(a.depth != b.depth){
    //   if(a.depth < b.depth)
    //     return (a.translucent) ? -1 : 1;
    //   else if(a.depth == b.depth)
    //     return 0;
    //   else
    //     return (!a.translucent) ? -1 : 1;
    // }

    // return 0;

    if(a.material.name != b.material.name){
      if(a.material.name < b.material.name)
        return 1;
      else
        return -1;
    }


    if(a._viewSpacePosition[2] < b._viewSpacePosition[2])
      return 1;
    else if(a._viewSpacePosition[2] > b._viewSpacePosition[2])
      return -1
    else
      return 0;
  }
}