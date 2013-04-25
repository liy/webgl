var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// enable depth texture extension
var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");

var phongProgram = gl.createProgram();
var phongShader = new Shader(phongProgram, 'shader/phong.vert', 'shader/phong.frag');
gl.useProgram(phongProgram);

phongShader.bindAttribute(phongProgram);
phongShader.bindUniform(phongProgram);

var scene = new Scene();
var renderer = new Renderer();
var camera = new Camera();
var light = new Light();
light.z = -2;
light.direction = [0, 0, -1];
// light.rotationY = -Math.PI/4;
light.outerRadian = Math.PI/4;
light.innerRadian = Math.PI/4.001;

Texture.load(['img/square.png', 'img/block.png'], init)
function init(textures){
  var cube1 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cube1.z = -3;
  scene.add(cube1);

  var cube2 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cube2.z = 1;
  cube2.x = 1;
  cube1.add(cube2);

  camera.y = 2;
  camera.lookAt(cube1.position);

  // shadow mapping related
  createColorTexture();
  createDepthTexture();
  createFramebuffer();

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setUniform(phongShader.uniform);

    light.setUniform(phongShader.uniform);

    // cube1.rotationX += 0.01;
    // cube1.rotationY += 0.007;

    // cube2.rotationX += 0.02;

    renderer.render(scene, phongShader, camera);

    requestAnimFrame(render);
  }
  requestAnimFrame(render);
}

function renderDepthTexture(){

}

function renderScene(){

}

function debugDepthTexture(){

}

var framebufferSize = 512;

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