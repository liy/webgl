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
camera.z = 0.3;
camera.y = -0.06;
camera.x = 1.4;
camera.lookTarget = vec3.fromValues(0, camera.y, -1);

var p1 = new PointLight(10);
p1.z = 0.5;
p1.x = -0.2;
p1.color = vec3.fromValues(1.0, 0.2, 0.0);

var p2 = new PointLight(10);
p2.z = 0.5;
p2.x = 0.2;
p2.color = vec3.fromValues(0.0, 0.8, 1.0);

scene.add(p1);
scene.add(p2);


var loader = new ObjectFile();
loader.load("../webgl-meshes/head/head.obj");
var obj = loader.object;
scene.add(obj);

var t = 0;
function render(){
  stats.begin();

  // obj.rotationY += 0.003;

  // t += 0.01;
  // p2.color = vec3.fromValues(Math.sin(t), Math.cos(t+2), Math.sin(t+3));

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();