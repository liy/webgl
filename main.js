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
camera.z = 3;
camera.lookTarget = vec3.fromValues(0, camera.y, -1);

var p1 = new PointLight(10);
p1.z = 0.6;
p1.color = vec3.fromValues(1.0, 0.2, 0.0);

// no effect on cube.
var p2 = new PointLight();
p2.z = 0.8;
p2.color = vec3.fromValues(0.0, 0.8, 1.0);

scene.add(p1);
scene.add(p2);


var loader = new ObjectFile();
loader.load("../webgl-meshes/cube/cube.obj");
var obj = loader.object;
scene.add(obj);

function render(){
  stats.begin();

  obj.rotationY += 0.003;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();