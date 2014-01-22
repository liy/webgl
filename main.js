var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 300)
scene.add(camera);
// camera.z = 100;

var loader = new NewObjLoader();
loader.load("../webgl-meshes/lost-empire/", "lost_empire.obj");
var mesh1 = loader.group;
mesh1.y = -30;
scene.add(mesh1);

function render(){
  stats.begin();

  mesh1.rotationY += 0.02;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();