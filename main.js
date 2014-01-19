var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

var scene = new Scene();

var loader = new NewObjLoader();
loader.load("../webgl-meshes/buddha/", "buddha.obj");
var mesh = loader.group;
// FIXME: find a place to call this prepare function
mesh.prepare(renderer.mrtShader);
mesh.y = -5;
scene.add(mesh);

var loader = new NewObjLoader();
loader.load("../webgl-meshes/cube/", "cube.obj");
var cube = loader.group;
// FIXME: find a place to call this prepare function
cube.prepare(renderer.mrtShader);
cube.x = -5;
cube.y = -2;
cube.z = -3;
scene.add(cube);

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 300)
scene.add(camera);
camera.z = 10;

console.log()

function render(){
  stats.begin();

  mesh.rotationY += 0.02;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);