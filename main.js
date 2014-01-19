var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();


var loader = new NewObjLoader();
loader.load("../webgl-meshes/buddha/", "buddha.obj");
var mesh = loader.group;
// FIXME: find a place to call this prepare function
mesh.prepare(renderer.mrtShader);

var scene = new Scene();
scene.add(mesh);

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 300)

camera.z = 10;

function render(){
  stats.begin();


  renderer.render(scene, camera);

  stats.end();
  // requestAnimFrame(render);
}
requestAnimFrame(render);