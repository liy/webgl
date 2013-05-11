var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
var ext = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('depth_texture');

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT);

var shadowProgram = gl.createProgram();
var shadowShader = new Shader(this.shadowProgram, '../shader/shadow.vert', '../shader/shadow.frag');
var phongProgram = gl.createProgram();
var phongShader = new Shader(this.phongProgram, '../shader/phong.vert', '../shader/phong.frag');
var canvasProgram = gl.createProgram();
var canvasShader = new Shader(this.canvasProgram, '../shader/canvas.vert', '../shader/canvas.frag')

var cube;
var subCube;
var plane = new Mesh(new PlaneGeometry(10, 10), new PhongMaterial());
plane.z = -5;
var light = new SpotLight();
light.outerRadian = Math.PI/5;
light.innerRadian = Math.PI/5.1;
// light.castShadow = true;
light.z = -1;
var sceneCamera = new PerspectiveCamera(Math.PI/3, canvas.width/canvas.height, 0.1, 800);
sceneCamera.x = 0.7;
var orthoCamera = new OrthoCamera();

var framebufferSize = 512;
var colorTexture;
var depthTexture;
var framebuffer;

Texture.load(['img/square.png'], init)
function init(textures){
  cube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
  cube.z = -3;
  subCube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
  cube.add(subCube);
  subCube.x = -1;
  subCube.z = 1;

  colorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, colorTexture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebufferSize, framebufferSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  depthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, framebufferSize, framebufferSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);

  function loop(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawShadow();
    renderScene(phongProgram, phongShader, sceneCamera);

    // debugShadow();

    requestAnimFrame(loop);
  }
  requestAnimFrame(loop);
}
// init(null);

function drawShadow(){
  var shader = shadowShader;
  var program = shadowProgram;
  var camera = light._camera;
  gl.useProgram(program);
  shader.bindAttribute(program);
  shader.bindUniform(program);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, framebufferSize, framebufferSize);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  subCube.rotationY += 0.008;
  subCube.rotationX += 0.008;
  cube.rotationX += 0.003;

  camera.updateMatrix();
  light.updateMatrix();
  cube.updateMatrix();
  plane.updateMatrix();
  camera.projection(shader.uniform);

  light.lit(shader, camera);
  cube.draw(shader, camera);
  plane.draw(shader, camera);
  subCube.draw(shader, camera);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderScene(program, shader, camera){
  gl.useProgram(program);
  shader.bindAttribute(program);
  shader.bindUniform(program);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  subCube.rotationY += 0.008;
  subCube.rotationX += 0.008;
  cube.rotationX += 0.003;

  camera.updateMatrix();
  light.updateMatrix();
  cube.updateMatrix();
  plane.updateMatrix();
  camera.projection(shader.uniform);

  gl.activeTexture(gl.TEXTURE2);
  gl.uniform1i(shader.uniform['u_ShadowMap'], 2);
  gl.uniformMatrix4fv(shader.uniform['u_ModelMatrix'], false, cube.worldMatrix);
  gl.uniformMatrix4fv(shader.uniform['u_LightViewMatrix'], false, light.viewMatrix);
  gl.uniformMatrix4fv(shader.uniform['u_LightProjectionMatrix'], false, light._camera.projectionMatrix);
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  // re-active the texture0,
  gl.activeTexture(gl.TEXTURE0);

  light.lit(shader, camera);
  cube.draw(shader, camera);
  plane.draw(shader, camera);
  subCube.draw(shader, camera);
}


var shadowPlane = new Mesh(new PlaneGeometry(2, 2), new PhongMaterial());
shadowPlane.z = -0.2;
var orthoCamera = new OrthoCamera();
function debugShadow(){
  var shader = canvasShader;
  var program = canvasProgram;
  var camera =  orthoCamera;
  gl.useProgram(program);
  shader.bindAttribute(program);
  shader.bindUniform(program);

  shadowPlane.updateMatrix();
  camera.updateMatrix();
  camera.projection(shader.uniform);

  gl.bindTexture(gl.TEXTURE_2D, depthTexture);

  shadowPlane.draw(shader, camera);

  gl.bindTexture(gl.TEXTURE_2D, null);
}
