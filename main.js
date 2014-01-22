var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 2000)
scene.add(camera);
camera.z = 0;

var loader = new NewObjLoader();
loader.load("../webgl-meshes/sibenik/", "sibenik.obj");
var mesh1 = loader.group;
mesh1.y = -0;
scene.add(mesh1);

function render(){
  stats.begin();

  mesh1.rotationY += 0.004;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();