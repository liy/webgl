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
camera.z = 2;
// camera.lookTarget = vec3.fromValues(0, camera.y, -1);

// var loader = new ObjectFile();
// loader.load("../webgl-meshes/head/head.obj");
// var obj = loader.object;
// scene.add(obj);

var sphereMesh = new Mesh(new SphereGeometry(), new Material());
sphereMesh.z = -1;
sphereMesh.scale = 100;
scene.add(sphereMesh);

function render(){
  stats.begin();

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();