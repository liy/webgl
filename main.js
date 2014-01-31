var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.01, 30)
scene.add(camera);
camera.z = 2;
camera.x = 2;

var p3 = new DirectionalLight();
p3.z = 1;
p3.x = 1;


scene.add(p3);


var loader = new ObjectFile();
loader.load("../webgl-meshes/cube/cube.obj");
var obj = loader.object;
scene.add(obj);

function render(){
  stats.begin();

  renderer.render(scene, camera);

  obj.rotationY += 0.003;

  stats.end();
  requestAnimFrame(render);
}
render();