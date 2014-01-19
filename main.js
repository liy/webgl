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
var mesh1 = loader.group;
mesh1.y = -5;
scene.add(mesh1);

var loader = new NewObjLoader();
loader.load("../webgl-meshes/dragon/", "dragon.obj");
var mesh2 = loader.group;
mesh2.x = -5;
mesh2.y = -5;
mesh2.z = -8;
scene.add(mesh2);

var loader = new NewObjLoader();
loader.load("../webgl-meshes/", "bunny.obj");
var mesh3 = loader.group;
mesh3.x = 8;
mesh3.y = -5;
mesh3.z = -4;
scene.add(mesh3);

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 300)
scene.add(camera);
camera.z = 10;


function render(){
  stats.begin();

  mesh1.rotationY += 0.02;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);