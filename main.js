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

// objects
var cube;
var plane;
Texture.load(['img/square.png'], init);
function init(textures){
  cube = new Mesh(new CubeGeometry(), new PhongMaterial({texture:textures[0]}));
  cube.name = 'cube';
  cube.z = -1.5;
  scene.add(cube);

  plane = new Mesh(new PlaneGeometry(5, 3), new PhongMaterial());
  plane.name = 'plane';
  plane.z = -2.5;
  scene.add(plane);

  // cube.add(sceneCamera);

  // rendering
  function loop(){
    stats.begin();

    cube.rotationX += 0.02;
    cube.rotationY += 0.008;

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
  sceneCamera.perspective(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 800);
});