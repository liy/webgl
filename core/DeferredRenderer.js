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
  this.dtExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");
  this.vaoExt = gl.getExtension("OES_vertex_array_object");

  // include extensions' properties into gl, for convenience reason.
  var exts = [this.dbExt, this.dtExt, this.vaoExt];
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

  this.mrtProgram = gl.createProgram();
  this.mrtShader = new Shader(this.mrtProgram, 'shader/multi_render_target_bump.vert', 'shader/multi_render_target_bump.frag');
  gl.useProgram(this.mrtProgram);
  this.mrtShader.locateAttributes(this.mrtProgram);
  this.mrtShader.locateUniforms(this.mrtProgram);

  this.pointLightProgram = gl.createProgram();
  this.pointLightShader = new Shader(this.pointLightProgram, 'shader/light/point.vert', 'shader/light/point.frag');
  gl.useProgram(this.pointLightProgram);
  this.pointLightShader.locateAttributes(this.pointLightProgram);
  this.pointLightShader.locateUniforms(this.pointLightProgram);

  this.dirLightProgram = gl.createProgram();
  this.dirLightShader = new Shader(this.dirLightProgram, 'shader/light/directional.vert', 'shader/light/directional.frag');
  gl.useProgram(this.dirLightProgram);
  this.dirLightShader.locateAttributes(this.dirLightProgram);
  this.dirLightShader.locateUniforms(this.dirLightProgram);

  this.createGBuffers();
  // TODO: FIXME: move it into directional light class
  this.createDirectionLightBuffer();

  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}
var p = DeferredRenderer.prototype;

p.createGBuffers = function(){
  // Setup MRT
  // 3 textures as 3 render targets
  this.albedoTarget = this._createColorTexture(this.GBufferWidth, this.GBufferHeight);
  this.normalTarget = this._createColorTexture(this.GBufferWidth, this.GBufferHeight);
  this.specularTarget = this._createColorTexture(this.GBufferWidth, this.GBufferHeight);
  this.depthTarget = this._createDepthTexture(this.GBufferWidth, this.GBufferHeight);

  // framebuffer to attach both textures and depth renderbuffer
  this.GFrameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.GFrameBuffer);
  // specify 3 textures as render targets
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.albedoTarget, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.normalTarget, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, this.specularTarget, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTarget, 0);

  // Specifies a list of color buffers to be drawn into
  gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2]);
}

p.render = function(scene, camera){
  // g-buffers render
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.GFrameBuffer);
  gl.viewport(0, 0, this.GBufferWidth, this.GBufferHeight);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(this.mrtProgram);

  // update all object's matrix.
  var len = scene.children.length;
  for(var i=0; i<len; ++i){
    scene.children[i].update(this.mrtShader);
  }

  // calculated view dependent matrix(model view matrix and normal matrix, etc.)
  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    var mesh = scene.meshes[i];
    // update model view matrix, normal matrix
    mat4.mul(mesh.modelViewMatrix, camera.viewMatrix, mesh.worldMatrix);
    mat3.normalFromMat4(mesh.modelViewMatrixInverseTranspose, mesh.modelViewMatrix);
  }

  // TODO: do the meshes state sorting, speed up rendering
  // for(var i=0; i<scene.meshes.length; ++i){
  //   console.log(scene.meshes[i].material.name)
  // }
  // console.log('');
  // console.log('');
  // console.log('');
  // scene.meshes.sort(sort(camera));
  // for(var i=0; i<scene.meshes.length; ++i){
  //   console.log(scene.meshes[i].material.name)
  // }

  // gl.enable(gl.DEPTH_TEST);
  // draw to g-buffers
  this.drawGBuffers(scene, camera);


  // gl.disable(gl.DEPTH_TEST);
  // point light
  this.lighting(scene, camera);
}


p.drawGBuffers = function(scene, camera){
  // cull face needs to be enabled during G-buffer filling
  gl.enable(gl.CULL_FACE);
  // depth test of course is needed
  gl.enable(gl.DEPTH_TEST);
  // TODO: disable blend for now for G-Buffer, future needs support transparency.
  gl.disable(gl.BLEND);

  // camera
  gl.uniformMatrix4fv(this.mrtShader.uniforms['u_ProjectionMatrix'], false, camera.projectionMatrix);
  gl.uniformMatrix4fv(this.mrtShader.uniforms['u_ViewMatrix'], false, camera.viewMatrix);

  // meshes
  len = scene.meshes.length;
  for(var i=0; i<len; ++i){
    var mesh = scene.meshes[i];

    // normal, model view matrix
    gl.uniformMatrix4fv(this.mrtShader.uniforms['u_ModelMatrix'], false, mesh.worldMatrix);
    gl.uniformMatrix4fv(this.mrtShader.uniforms['u_ModelViewMatrix'], false, mesh.modelViewMatrix);
    gl.uniformMatrix3fv(this.mrtShader.uniforms['u_ModelViewMatrixInverseTranspose'], false, mesh.modelViewMatrixInverseTranspose);

    mesh.draw(this.mrtShader);
  }
}

p.lighting = function(scene, camera){
  // draw to the default screen framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.enable(gl.BLEND);
  // enable add blend function
  gl.blendEquation(gl.FUNC_ADD);
  // blend lighting
  gl.blendFunc(gl.ONE, gl.ONE);
  // disable depth test, all the light volumes needs to be rendered
  gl.disable(gl.DEPTH_TEST);


  gl.useProgram(this.pointLightProgram);
  // FIXIME: TODO: move these const uniform into camera initialization method
  gl.uniformMatrix4fv(this.pointLightShader.uniforms['u_ProjectionMatrix'], false, camera.projectionMatrix);
  gl.uniformMatrix4fv(this.pointLightShader.uniforms['u_InvProjectionMatrix'], false, camera.invertProjectionMatrix);


  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.albedoTarget);
  gl.uniform1i(this.pointLightShader.uniforms['albedoTarget'], 0);
  gl.activeTexture(gl.TEXTURE0+1);
  gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
  gl.uniform1i(this.pointLightShader.uniforms['normalTarget'], 1);
  gl.activeTexture(gl.TEXTURE0+2);
  gl.bindTexture(gl.TEXTURE_2D, this.specularTarget);
  gl.uniform1i(this.pointLightShader.uniforms['specularTarget'], 2);
  gl.activeTexture(gl.TEXTURE0+3);
  gl.bindTexture(gl.TEXTURE_2D, this.depthTarget);
  gl.uniform1i(this.pointLightShader.uniforms['depthTarget'], 3);

  len = scene.lights.length;
  for(var i=0; i<len; ++i){
    var pointLight = scene.lights[i];

    mat4.mul(pointLight.modelViewMatrix, camera.viewMatrix, pointLight.worldMatrix);
    vec3.transformMat4(pointLight._viewSpacePosition, pointLight._position, camera.viewMatrix);

    pointLight.draw(this.pointLightShader, camera);
  }
  // reset to default counter clock wise front face. Since positional lighting stage might change the order depending on whether the camera
  // is enclosed by the lighting proxy geometry.
  gl.frontFace(gl.CCW);


  // directional light
  // gl.useProgram(this.dirLightProgram);
  // // FIXIME: TODO: move these const uniform into camera initialization method
  // gl.uniformMatrix4fv(this.dirLightShader.uniforms['u_ProjectionMatrix'], false, camera.projectionMatrix);
  // gl.uniformMatrix4fv(this.dirLightShader.uniforms['u_InvProjectionMatrix'], false, camera.invertProjectionMatrix);

  // gl.activeTexture(gl.TEXTURE0);
  // gl.bindTexture(gl.TEXTURE_2D, this.albedoTarget);
  // gl.uniform1i(this.dirLightShader.uniforms['albedoTarget'], 0);
  // gl.activeTexture(gl.TEXTURE0+1);
  // gl.bindTexture(gl.TEXTURE_2D, this.normalTarget);
  // gl.uniform1i(this.dirLightShader.uniforms['normalTarget'], 1);
  // gl.activeTexture(gl.TEXTURE0+2);
  // gl.bindTexture(gl.TEXTURE_2D, this.specularTarget);
  // gl.uniform1i(this.dirLightShader.uniforms['specularTarget'], 2);
  // gl.activeTexture(gl.TEXTURE0+3);
  // gl.bindTexture(gl.TEXTURE_2D, this.depthTarget);
  // gl.uniform1i(this.dirLightShader.uniforms['depthTarget'], 3);

  // gl.bindVertexArrayOES(this.screenVAO);
  // gl.drawArrays(gl.TRIANGLES, 0, 6);
  // gl.bindVertexArrayOES(null);
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

    vec3.transformMat4(a._viewSpacePosition, a._position, camera.viewMatrix);
    vec3.transformMat4(b._viewSpacePosition, b._position, camera.viewMatrix);


    if(a._viewSpacePosition[2] < b._viewSpacePosition[2])
      return 1;
    else if(a._viewSpacePosition[2] > b._viewSpacePosition[2])
      return -1
    else
      return 0;
  }
}









p.createDirectionLightBuffer = function(){
  this.screenVAO = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.screenVAO);

  // Screen attributes buffer
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1.0, -1.0,
                                                     1.0, -1.0,
                                                     1.0,  1.0,
                                                     1.0,  1.0,
                                                    -1.0,  1.0,
                                                    -1.0, -1.0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.dirLightShader.attributes.a_Vertex);
  gl.vertexAttribPointer(this.dirLightShader.attributes.a_Vertex, 2, gl.FLOAT, false, 0, 0);
  // texture coordinate buffer
  var tb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0,
                                                   1, 0,
                                                   1, 1,
                                                   1, 1,
                                                   0, 1,
                                                   0, 0]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(this.dirLightShader.attributes.a_TexCoord);
  gl.vertexAttribPointer(this.dirLightShader.attributes.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArrayOES(null);
}

p._createColorTexture = function(w, h){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  return texture;
}

p._createDepthTexture = function(w, h){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, w, h, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

  return texture;
}

p.onResize = function(e){

}