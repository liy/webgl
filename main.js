// renderer render the scene.
var renderer = new Renderer();
document.body.appendChild(renderer.canvas);

// scene
var scene = new Scene();

// scene camera
var sceneCamera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 800);
scene.add(sceneCamera);
sceneCamera.lookAt = [0, 0, -2];
sceneCamera.z = 2;
sceneCamera.x = 4;
sceneCamera.y = 2;

// lights
var light = new SpotLight();
// light.castShadow = true;
light.direction = [0.5, 0, -1];
light.x = -1.5;
scene.add(light);

// objects
var cube;
var subCube;
var plane;
Texture.load(['img/square.png'], init);
function init(textures){
  cube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
  cube.z = -2;
  scene.add(cube);

  subCube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
  subCube.x = 1;
  subCube.z = 1;
  cube.add(subCube);

  plane = new Mesh(new PlaneGeometry(10, 10), new PhongMaterial({texture:textures[0]}));
  plane.useColor = true;
  plane.z = -3;
  scene.add(plane);


  // rendering
  function loop(){
    cube.rotationX += 0.01;

    subCube.rotationX += 0.01;
    subCube.rotationY += 0.01;

    // sceneCamera.x += 0.01;

    renderer.render(scene, sceneCamera);
    requestAnimFrame(loop);
  }
  requestAnimFrame(loop);
}




// var canvas = document.createElement('canvas');
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// document.body.appendChild(canvas);

// var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// var ext = gl.getExtension('WEBKIT_WEBGL_depth_texture') || gl.getExtension('depth_texture');

// gl.clearColor(0.0, 0.0, 0.0, 1.0);
// gl.enable(gl.DEPTH_TEST);
// gl.clear(gl.COLOR_BUFFER_BIT);

// var shadowProgram = gl.createProgram();
// var shadowShader = new Shader(this.shadowProgram, '../shader/shadow.vert', '../shader/shadow.frag');
// var phongProgram = gl.createProgram();
// var phongShader = new Shader(this.phongProgram, '../shader/phong.vert', '../shader/phong.frag');
// var canvasProgram = gl.createProgram();
// var canvasShader = new Shader(this.canvasProgram, '../shader/canvas.vert', '../shader/canvas.frag')

// var cube;
// var subCube;
// var plane = new Mesh(new PlaneGeometry(10, 10), new PhongMaterial());
// plane.z = -5;
// var light = new SpotLight();
// light.outerRadian = Math.PI/5;
// light.innerRadian = Math.PI/5.1;
// light.castShadow = true;
// light.z = -1;
// var sceneCamera = new PerspectiveCamera(Math.PI/3, canvas.width/canvas.height, 0.1, 800);
// sceneCamera.x = 0.7;
// var orthoCamera = new OrthoCamera();

// var framebufferSize = 512;
// var colorTexture;
// var depthTexture;
// var framebuffer;

// Texture.load(['img/square.png'], init)
// function init(textures){
//   cube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
//   cube.z = -3;
//   subCube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
//   cube.add(subCube);
//   subCube.x = -1;
//   subCube.z = 1;

//   colorTexture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, colorTexture);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebufferSize, framebufferSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

//   depthTexture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, depthTexture);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, framebufferSize, framebufferSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

//   framebuffer = gl.createFramebuffer();
//   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture, 0);
//   gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

//   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//   gl.bindTexture(gl.TEXTURE_2D, null);

//   function loop(){
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     update();

//     drawShadow();
//     renderScene(phongProgram, phongShader, sceneCamera);

//     requestAnimFrame(loop);
//   }
//   requestAnimFrame(loop);
// }


// function update(){
//   subCube.rotationY += 0.008;
//   subCube.rotationX += 0.008;
//   cube.rotationX += 0.003;

//   sceneCamera.updateMatrix();
//   light.updateMatrix();
//   cube.updateMatrix();
//   plane.updateMatrix();
// }

// function drawShadow(){
//   gl.useProgram(shadowProgram);
//   shadowShader.bindAttribute(shadowProgram);
//   shadowShader.bindUniform(shadowProgram);

//   gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
//   gl.viewport(0, 0, framebufferSize, framebufferSize);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//   light.shadowCamera.project(shadowShader);

//   cube.draw(shadowShader, light.shadowCamera);
//   subCube.draw(shadowShader, light.shadowCamera);
//   plane.draw(shadowShader, light.shadowCamera);

//   gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// }

// function renderScene(program, shader, camera){
//   gl.useProgram(program);
//   shader.bindAttribute(program);
//   shader.bindUniform(program);

//   gl.viewport(0, 0, canvas.width, canvas.height);
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//   light.shadow(shader);
//   gl.bindTexture(gl.TEXTURE_2D, depthTexture);
//   // re-active the texture0
//   gl.activeTexture(gl.TEXTURE0);

//   camera.project(shader);

//   light.lit(shader, camera);
//   cube.draw(shader, camera);
//   plane.draw(shader, camera);
//   subCube.draw(shader, camera);
// }