var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = 800;
canvas.height = 600;

var gl = canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
var depthTextureExt = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('WEBGL_depth_texture');
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.viewport(0, 0, canvas.width, canvas.height);

var program = gl.createProgram();
var shader = new Shader(program, 'shader/generic.vert', 'shader/generic.frag');

var camera = new PerspectiveCamera(Math.PI/3, canvas.width/canvas.height, 0.1, 10);
camera.lookTarget = [0, 0, -2];

var mesh = new Mesh(new CubeGeometry(), new PhongMaterial());
mesh.z = -2;

// rendering
-function loop(){
  stats.begin();



  // calculate extra normal, model view matrix and view space position of the meshes
  // update to model view matrix
  mat4.mul(mesh.modelViewMatrix, camera.worldMatrix, mesh.worldMatrix);
  // console.log(mesh.modelViewMatrix);
  // normal matrix, it is inverse transpose of the model view matrix
  mat3.normalFromMat4(mesh.normalMatrix, mesh.modelViewMatrix);
  // calculate the view space position of the meshes, for states sorting
  vec3.transformMat4(mesh._eyeSpacePosition, Object3D.origin, mesh.modelViewMatrix);




  gl.useProgram(program);
  shader.bindAttributes(program);
  shader.bindUniforms(program);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  camera.setUniforms(shader.uniforms);

  mesh.draw(shader, camera);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);



  requestAnimFrame(loop);
  stats.end();
}();