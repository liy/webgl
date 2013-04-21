var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

var phongProgram = gl.createProgram();
var phongShader = new Shader(phongProgram, 'shader/phong.vert', 'shader/phong.frag');
gl.useProgram(phongProgram);

phongShader.bindAttribute(phongProgram);
phongShader.bindUniform(phongProgram);

Texture.load(['img/square.png', 'img/block.png'], init)
function init(textures){
  var camera = new Camera();
  var light = new Light();
  light.setUniform(phongShader.uniform);
  var cubeMesh = new Mesh(new CubeGeometry(), new PhongMaterial({texture: textures[0]}));
  cubeMesh.z = -2;

  camera.lookAt(cubeMesh.position);

  function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    camera.setUniform(phongShader.uniform);

    cubeMesh.rotationX += 0.01;
    cubeMesh.rotationY += 0.007;
    cubeMesh.render(phongShader, camera);

    requestAnimFrame(render);
  }
  requestAnimFrame(render);
}