var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 1, 5000)
scene.add(camera);
camera.y = 50;
camera.z = 150;
camera.lookTarget = vec3.fromValues(1,camera.y,0);


var loader = new NewObjLoader();
loader.load("../webgl-meshes/crytek-sponza/", "sponza.obj");
var mesh1 = loader.group;
scene.add(mesh1);

var loader2 = new NewObjLoader();
loader2.load("../webgl-meshes/head/", "head.obj");
var mesh2 = loader2.group;
mesh2.y = 100;
mesh2.scale = 200;
scene.add(mesh2);

function render(){
  stats.begin();

  mesh2.rotationY -= 0.004;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();