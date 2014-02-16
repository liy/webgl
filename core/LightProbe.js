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

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  // framebuffer to hold 6 faces
  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);

  // 6 face texture
  this.geometryPasses = new Array(6);
  this.lightPasses = new Array(6);
  this.synthesisPasses = new Array(6);
  for(var i=0; i<6; ++i){
    // get ready for drawing to each face of the cube map texture
    this.cubeTexture.bind();
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, this.bufferWidth, this.bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    this.geometryPasses[i] = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'));
    this.lightPasses[i] = new LightPass(this);
    this.synthesisPasses[i] = new SynthesisPass(this, this.framebuffer, this.cubeTexture.glTexture);

    // setup input and export relationship
    this.lightPasses[i].input([this.geometryPasses[i]]);
    this.synthesisPasses[i].input([this.geometryPasses[i], this.lightPasses[i]]);
  }


  // 0 GL_TEXTURE_CUBE_MAP_POSITIVE_X
  // 1 GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  // 2 GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  // 3 GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  // 4 GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  // 5 GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  // camera rotations for 6 sides
  this.rotations = [
    // right, GL_TEXTURE_CUBE_MAP_POSITIVE_X
    { x:0, y:-Math.PI/2, z:0 },
    // left, GL_TEXTURE_CUBE_MAP_NEGATIVE_X
    { x:0, y:Math.PI/2, z:0 },
    // top, GL_TEXTURE_CUBE_MAP_POSITIVE_Y
    { x:Math.PI/2, y:0, z:0 },
    // bottom, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
    { x:-Math.PI/2, y:0, z:0 },
    // back, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    { x:0, y:-Math.PI, z:0 },
    // front, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    { x:0, y:0, z:0 }
  ];

  // TODO: create coefficient texture

  // mesh to display light probe, for testing
  var material = new Material();
  material.textureMap['cubeMap'] = this.cubeTexture;
  this.cubeTexture.ready = true;
  this.mesh = new Mesh(new CubeGeometry(), material);
  this.add(this.mesh);

  gl.enable(gl.CULL_FACE);
}
var p = LightProbe.prototype = Object.create(Node.prototype);

p.capture = function(scene){
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  // draw 6 faces
  for(var i=0; i<6; ++i){
    // update camera direction
    this.camera.rotationX = this.rotations[i].x;
    this.camera.rotationY = this.rotations[i].y;
    this.camera.rotationZ = this.rotations[i].z;

    this.cubeTexture.bind();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, this.cubeTexture.glTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);

    // draw side
    this.geometryPasses[i].render(scene, this.camera);
    this.lightPasses[i].render(scene, this.camera);
    this.synthesisPasses[i].render(scene, this.camera);
  }

  this.captured = true;
}

p.render = function(scene){
  if(this.dynamic || !this.captured)
    this.capture(scene);
}

p.generateCoefficients = function(){

}