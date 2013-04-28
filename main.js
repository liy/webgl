var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// enable depth texture extension
var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");

var canvasProgram = gl.createProgram();
var canvasShader = new Shader(canvasProgram, 'shader/canvas.vert', 'shader/canvas.frag');

var phongProgram = gl.createProgram();
var phongShader = new Shader(phongProgram, 'shader/phong.vert', 'shader/phong.frag');

var shadowProgram = gl.createProgram();
var shadowShader = new Shader(shadowProgram, 'shader/shadow.vert', 'shader/shadow.frag');


var light = new Light();
light.z = 4.8;
// light.y = 0.5;
light.direction = [0, 0, -0.5];
// light.rotationY = -Math.PI/4;
light.outerRadian = Math.PI/6;
light.innerRadian = light.outerRadian  * 0;
// light.enabled = false;

var scene = new Scene();
var renderer = new Renderer();

// normal perspective camera, for rendering the final scene
var perspectiveCamera = new PerspectiveCamera(Math.PI/3, canvas.width/canvas.height);
// orthogonal camera, for rendering the final result to the canvas.
var orthoCamera = new OrthoCamera();
// Also, there is camera from the light source, it is used for drawing the depth texture.

var cube1, cube2, plane;
Texture.load(['img/square.png', 'img/block.png'], init)
function init(textures){
  cube1 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  scene.add(cube1);

  cube2 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cube2.z = 1;
  cube2.x = 1;
  cube1.add(cube2);

  plane = new Mesh(new PlaneGeometry(10,10), new PhongMaterial({texture: textures[1]}));
  plane.useColor = true;
  plane.z = -4.2;
  plane.rotationX = -Math.PI/3;
  scene.add(plane);

  perspectiveCamera.x = -2;
  perspectiveCamera.z = 4;
  perspectiveCamera.y = 1.0;
  perspectiveCamera.lookAt = [0, perspectiveCamera.y, -1];
  perspectiveCamera.lookAt = light.position;
  perspectiveCamera.lookAt = cube1.position;

  // shadow mapping related
  createColorTexture();
  createDepthTexture();
  createFramebuffer();

  initCanvas();

  function render(){

    drawDepthTexture();

    renderScene();

    // renderCanvas();

    requestAnimFrame(render);
  }
  requestAnimFrame(render);
}

function drawDepthTexture(){
  gl.useProgram(shadowProgram);
  shadowShader.bindAttribute(shadowProgram);
  shadowShader.bindUniform(shadowProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // gl.colorMask(false, false, false, false);
  gl.viewport(0, 0, framebufferSize, framebufferSize);
  // gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.DEPTH_BUFFER_BIT);


  //  use light's camera, draw the depth information to the depth texture
  var camera = light.camera;
  // console.log(camera.projectionMatrix);

  // use perspective camera instead
  // perspectiveCamera.updateMatrix();
  // camera = perspectiveCamera;

  camera.setUniform(shadowShader.uniform);
  light.setUniform(shadowShader.uniform, camera);

  // cube1.rotationX += 0.01;
  // cube1.rotationY += 0.007;
  // cube2.rotationX += 0.02;
  // plane.rotationX += 0.01;

  renderer.render(scene, shadowShader, camera);

  // gl.colorMask(true, true, true, true);
}

function renderScene(){
  gl.useProgram(phongProgram);
  phongShader.bindAttribute(phongProgram);
  phongShader.bindUniform(phongProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  perspectiveCamera.updateMatrix();

  perspectiveCamera.setUniform(phongShader.uniform);
  light.setUniform(phongShader.uniform, perspectiveCamera);

  cube1.rotationX += 0.01;
  cube1.rotationY += 0.007;
  cube2.rotationX += 0.02;
  // plane.rotationX += 0.01;

  // TODO: bind depth texture
  gl.activeTexture(gl.TEXTURE1);
  gl.uniform1i(phongShader.uniform['u_ShadowMap'], 1);
  // var lightCamera = light.camera;
  // lightCamera.setUniform(phongShader.uniform);
  // light.setUniform(phongShader.uniform, lightCamera);

  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.activeTexture(gl.TEXTURE0);

  renderer.render(scene, phongShader, perspectiveCamera);
}

function renderCanvas(){
  gl.useProgram(canvasProgram);
  canvasShader.bindAttribute(canvasProgram);
  canvasShader.bindUniform(canvasProgram);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.viewport(0, 0, canvas.width, canvas.height);
  // gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.bindBuffer(gl.ARRAY_BUFFER, canvasVertexBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, canvasIndexBuffer);
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  // gl.bindTexture(gl.TEXTURE_2D, colorTexture);

  gl.vertexAttribPointer(canvasShader.attribute['a_Vertex'], 3, gl.FLOAT, false, 20, 0);
  gl.vertexAttribPointer(canvasShader.attribute['a_TexCoord'], 2, gl.FLOAT, false, 20, 12);
  gl.enableVertexAttribArray(canvasShader.attribute['a_Vertex']);
  gl.enableVertexAttribArray(canvasShader.attribute['a_TexCoord']);

  orthoCamera.updateMatrix();
  // setup projection
  orthoCamera.setUniform(canvasShader.uniform);

  // TODO: to be removed
  var modelViewMatrix = mat4.create();
  mat4.identity(modelViewMatrix);
  mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -1]);
  gl.uniformMatrix4fv(canvasShader.uniform['u_ModelViewMatrix'], false, modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
}

function debugDepthTexture(){
  gl.useProgram(canvasProgram);
  phongShader.bindAttribute(canvasProgram);
  phongShader.bindUniform(canvasProgram);


}

var framebufferSize = 1024;

var colorTexture;
function createColorTexture(){
  colorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, colorTexture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebufferSize, framebufferSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}

var depthTexture;
function createDepthTexture(){
  depthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, depthTexture);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, framebufferSize, framebufferSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);
}

var framebuffer;
function createFramebuffer(){
  framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

var canvasVertexBuffer;
var canvasIndexBuffer;
function initCanvas(){
  var vertices = [
    // x y z   u v
    // front
    -1, -1, -1,   0.0, 1.0,
     1, -1, -1,   1.0, 1.0,
     1,  1, -1,   1.0, 0.0,
    -1,  1, -1,   0.0, 0.0
  ];

  var indices = [
    0,  1,  2,   0,  2,  3,  // front
  ];

  canvasVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, canvasVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  canvasIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, canvasIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}