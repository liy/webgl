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
camera.z = 0.4;
camera.y = -0.05;
camera.lookTarget = vec3.fromValues(0, camera.y, -1);


var p3 = new DirectionalLight();
p3.z = 1;
p3.x = 1;
scene.add(p3);

var p1 = new PointLight(2);
p1.x = 0.2;
p1.z = 0.2;
p1.color = vec3.fromValues(1.0, 0.2, 0.0);

var p2 = new PointLight(2);
p2.x = -0.2;
p2.z = 0.2;
p2.color = vec3.fromValues(0.0, 0.8, 1.0);

scene.add(p1);
scene.add(p2);


var loader = new ObjectFile();
loader.load("../webgl-meshes/head/head.obj");
var obj = loader.object;
scene.add(obj);

var skyBox = new SkyBox([
  {url: "../webgl-meshes/sphere_map/pos-x.png", face: gl.TEXTURE_CUBE_MAP_POSITIVE_X},
  {url: "../webgl-meshes/sphere_map/neg-x.png", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
  {url: "../webgl-meshes/sphere_map/pos-y.png", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
  {url: "../webgl-meshes/sphere_map/neg-y.png", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
  {url: "../webgl-meshes/sphere_map/pos-z.png", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
  {url: "../webgl-meshes/sphere_map/neg-z.png", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z}
]);
// scene.add(skyBox);

function render(){
  stats.begin();

  obj.rotationY += 0.003;


  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}
render();