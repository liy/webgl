var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms

// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );






// renderer render the scene.
var renderer = new Renderer();
document.body.appendChild(renderer.canvas);

// scene
var scene = new Scene();

// scene camera
var sceneCamera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 10);
scene.add(sceneCamera);
sceneCamera.lookTarget = [0, 0, -2];

var pointLight = new PointLight();
// pointLight.x = 0.6;
pointLight.z = -1.4;
// pointLight.y =  0.5;
scene.add(pointLight);

// var light2 = new PointLight(0.3);
// light2.z = -0.95;
// light2.x = 0.6;
// scene.add(light2);

// var light3 = new PointLight(0.7);
// light3.z = -0.7;
// light3.y = 1.0;
// scene.add(light3);

// objects
var cube;
var plane;
var sphere;
TextureLoader.load(['img/square.png', 'img/block.png', 'img/earth.jpg'], init);
function init(loaders){
  cube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:loaders[0].texture}));
  cube.name = 'cube';
  cube.z = -2;
  scene.add(cube);

  plane = new Mesh(new PlaneGeometry(5, 3), new PhongMaterial({texture:loaders[0].texture}));
  plane.name = 'plane';
  plane.z = -2.5;
  scene.add(plane);

  sphere = new Mesh(new SphereGeometry(0.5), new PhongMaterial({texture:loaders[2].texture}));
  sphere.z = -2;
  sphere.y = 0.5;
  scene.add(sphere);

  // rendering
  function loop(){
    stats.begin();

    // cube.rotationX += 0.01;
    // cube.rotationY += 0.008;
    // sphere.rotationY -= 0.004;

    renderer.render(scene, sceneCamera);

    requestAnimFrame(loop);

    stats.end();
  }
  requestAnimFrame(loop);
}










document.addEventListener ("mousemove", function(evt){
  sceneCamera.x = 5 * (evt.clientX - window.innerWidth/2)/window.innerWidth;
  sceneCamera.y = -2 * (evt.clientY - window.innerHeight/2)/window.innerHeight;
});

window.addEventListener('resize', function() {
  renderer.resize(window.innerWidth, window.innerHeight);
  sceneCamera.perspective(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0, 10);
});