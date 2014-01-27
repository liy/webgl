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
// camera.lookTarget = vec3.fromValues(0, camera.y, -1);

var pointLight = new PointLight(10);
pointLight.x = -0.02;
pointLight.z = -0.01;
scene.add(pointLight);

var loader = new ObjectFile();
loader.load("../webgl-meshes/head/head.obj");
var obj = loader.object;
obj.z = -0.3;
obj.y = 0.05;
scene.add(obj);

function render(){
  stats.begin();

  obj.rotationY -= 0.003;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();