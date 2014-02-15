function LightProbe(radius, size){
  Node.call(this);

  // width and height value
  this.size = 128 || size;

  this.camera = new PerspectiveCamera(Math.PI/2, 1, 0.01, 5 || radius);

  // 6 face texture
  this.geometryPasses = new Array(6);
  this.lightPasses = new Array(6);
  this.synthesisPasses = new Array(6);
  for(var i=0; i<6; ++i){
    this.geometryPasses[i] = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'), this.size, this.size);
    this.lightPasses[i] = new LightPass(this, this.size, this.size);
    this.synthesisPasses[i] = new SynthesisPass(this, this.size, this.size);
  }

  // look at targets
  this.directions = [
    // front
    vec3.fromValues(), 
    // back
    vec3.fromValues(),
    // left
    vec3.fromValues(),
    // right
    vec3.fromValues(),
    // up
    vec3.fromValues(),
    // bottom
    vec3.fromValues()
  ];

  // TODO: create cube texture

  // TODO: create coefficient texture
}
var p = LightProbe.prototype = Object.create(Node.prototype);

p.capture = function(scene){
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

  // draw 6 faces
  for(var i=0; i<6; ++i){
    // TODO: update camera direction

    this.geometryPasses[i].render(scene, camera);
    this.lightPasses[i].render(scene, camera);
    this.synthesisPasses[i].render(scene, camera);
  }

  // TODO: update cube texture
}

p.generateCoefficients = function(){

}