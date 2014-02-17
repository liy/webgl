function LightProbe(camera, size){
  Node.call(this);

  // keep capturing every frame
  this.dynamic = true;
  // whether the light probe captured the scene.
  this.captured = false;

  // width and height value
  this.bufferWidth = this.bufferHeight = 512 || size;

  this.camera = camera;

  this.cubeTexture = new TextureCube();
  this.cubeTexture.ready = true;

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  // geometry and light pass to render each side
  this.geometryPass = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'));
  this.lightPass = new LightPass(this);

  // framebuffer to hold cube texture
  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
  // create texture for each face of cubemap
  this.cubeTexture.bind();
  for(var i=0; i<6; ++i){
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, this.bufferWidth, this.bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  this.synthesisPass = new SynthesisPass(this, this.framebuffer, this.cubeTexture);
  this.cubeTexture.unbind();

  // setup input and export relationship
  this.lightPass.input([this.geometryPass]);
  this.synthesisPass.input([this.geometryPass, this.lightPass]);



  // 0 GL_TEXTURE_CUBE_MAP_POSITIVE_X
  // 1 GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  // 2 GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  // 3 GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  // 4 GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  // 5 GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  // camera rotations for 6 sides
  // this.rotations = [
  //   // right, GL_TEXTURE_CUBE_MAP_POSITIVE_X
  //   { x:0, y:-Math.PI/2, z:0 },
  //   // left, GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  //   { x:0, y:Math.PI/2, z:0 },
  //   // top, GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  //   { x:Math.PI/2, y:0, z:0 },
  //   // bottom, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  //   { x:-Math.PI/2, y:0, z:0 },
  //   // back, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  //   { x:0, y:-Math.PI, z:0 },
  //   // front, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  //   { x:0, y:0, z:0 }
  // ];
  this.rotations = [
    // right, GL_TEXTURE_CUBE_MAP_POSITIVE_X
    { x:0, y:-Math.PI/2, z:Math.PI },
    // left, GL_TEXTURE_CUBE_MAP_NEGATIVE_X
    { x:0, y:Math.PI/2, z:Math.PI },
    // top, GL_TEXTURE_CUBE_MAP_POSITIVE_Y
    { x:Math.PI/2, y:0, z:0 },
    // bottom, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
    { x:-Math.PI/2, y:0, z:0 },
    // back, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    { x:0, y:-Math.PI, z:Math.PI },
    // front, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    { x:0, y:0, z:Math.PI }
  ];

  // TODO: create coefficient texture

  // mesh to display light probe, for testing
  var material = new Material();
  material.textureMap['cubeMap'] = this.cubeTexture;
  this.mesh = new Mesh(new SphereGeometry(0.5, 50, 50), material);
  this.add(this.mesh);

  gl.enable(gl.CULL_FACE);
}
var p = LightProbe.prototype = Object.create(Node.prototype);

p.capture = function(scene){
  // draw 6 faces
  for(var i=0; i<6; ++i){
    // update camera direction
    this.camera.rotationX = this.rotations[i].x;
    this.camera.rotationY = this.rotations[i].y;
    this.camera.rotationZ = this.rotations[i].z;
    this.camera.update();
    this.updateViewDependent(scene, this.camera);


    // draw side
    this.geometryPass.render(scene, this.camera);
    this.lightPass.render(scene, this.camera);

    this.cubeTexture.bind();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, this.cubeTexture.glTexture, 0);
    this.synthesisPass.render(scene, this.camera);
    this.cubeTexture.unbind();
  }

  this.captured = true;
}

p.render = function(scene){
  if(this.dynamic || !this.captured)
    this.capture(scene);
}

p.updateViewDependent = function(scene, camera){
  // update meshes' view dependent matrix
  var len = scene.meshes.length;
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


p.generateCoefficients = function(){

}