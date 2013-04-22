var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var phongProgram = gl.createProgram();
var phongShader = new Shader(phongProgram, 'shader/phong.vert', 'shader/phong.frag');
gl.useProgram(phongProgram);

phongShader.bindAttribute(phongProgram);
phongShader.bindUniform(phongProgram);

var scene = new Scene();
var renderer = new Renderer();
var camera = new Camera();
var light = new Light();

Texture.load(['img/square.png', 'img/block.png'], init)
function init(textures){
  var cube1 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cube1.z = -2;
  scene.add(cube1);
  camera.lookAt(cube1.position);

  light.setUniform(phongShader.uniform);

  var cube2 = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cube2.z = 0;
  cube2.x = 1;
  cube1.add(cube2);

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setUniform(phongShader.uniform);

    cube1.rotationX += 0.01;
    cube1.rotationY += 0.007;

    cube2.rotationX += 0.02;

    renderer.render(scene, phongShader, camera);

    requestAnimFrame(render);
  }
  requestAnimFrame(render);
}