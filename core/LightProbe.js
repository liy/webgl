function LightProbe(radius, size){
  Node.call(this);

  // width and height value
  this.size = 128 || size;

  this.camera = new PerspectiveCamera(Math.PI/2, 1, 0.01, 5 || radius);

  this.cubeTexture = new TextureCube();

  // 6 face texture
  this.geometryPasses = new Array(6);
  this.lightPasses = new Array(6);
  this.synthesisPasses = new Array(6);
  for(var i=0; i<6; ++i){
    this.geometryPasses[i] = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'), this.size, this.size);
    this.lightPasses[i] = new LightPass(this, this.size, this.size);
    this.synthesisPasses[i] = new SynthesisPass(this, this.size, this.size);

    // get ready for drawing to each face of the cube map texture
    this.cubeTexture.bind();
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, this.size, this.size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }


  // 0 GL_TEXTURE_CUBE_MAP_POSITIVE_X
  // 1 GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  // 2 GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  // 3 GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  // 4 GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  // 5 GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  // camera rotations for 6 sides
  this.rotations = [
    // front
    { x:0, y:0, z:0 },
    // back
    { x:0, y:-Math.PI, z:0 },
    // left
    { x:0, y:Math.PI/2, z:0 },
    // right
    { x:0, y:-Math.PI/2, z:0 },
    // top
    { x:Math.PI/2, y:0, z:0 },
    // bottom
    { x:-Math.PI/2, y:0, z:0 }
  ];

  // TODO: create cube texture

  // TODO: create coefficient texture
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

    this.geometryPasses[i].render(scene, camera);
    this.lightPasses[i].render(scene, camera);
    this.synthesisPasses[i].render(scene, camera);
  }
}

p.generateCoefficients = function(){

}