var lightRotateX = 0;
var lightRotateY = -Math.PI;
var lightRotateZ = 0;

var modelViewMatrix = mat4.create();
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var normalMatrix = mat3.create();
// light matrix
var lightMatrix = mat4.create();

var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var textureManager = new TextureManager();

var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.73, 0.73, 0.73, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.CULL_FACE);
// gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

var loader = new ObjLoader(true);
var modelPath = '../webgl-meshes/dragon/';
var fileName = 'dragon.obj';
loader.load(modelPath, fileName, bind(this, loadTextures));
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

var textureAvailable = true;
function loadTextures(){
  var materialMap = loader.mtlLoader.materialMap;
  for(var key in materialMap){
    var material = materialMap[key];
    if(material.map_Kd != ''){
      textureManager.add(modelPath + material.map_Kd, material.map_Kd);
    }
  }

  if(textureManager.loaders.length !== 0)
    textureManager.load(bind(this, onTexturesLoaded));
  else{
    textureAvailable = false;
    onTexturesLoaded();
  }
}

function onTexturesLoaded(){
  var program = gl.createProgram();
  var shader = new Shader(program, 'shader/brdf.vert', 'shader/brdf.frag');
  gl.useProgram(program);
  shader.bindAttributes(program);
  shader.bindUniforms(program);

  // sphere
  var sphere = new SphereGeometry(0.5, 10, 10);
  var cube = new CubeGeometry();

  // attributes
  var vertexLocation = gl.getAttribLocation(program, 'a_Vertex');
  var normalLocation = gl.getAttribLocation(program, 'a_Normal');
  var texCoordLocation = gl.getAttribLocation(program, 'a_TexCoord');
  // matrix
  var projectionMatrixLocation = gl.getUniformLocation(program, 'u_ProjectionMatrix');
  var modelViewMatrixLocation = gl.getUniformLocation(program, 'u_ModelViewMatrix');
  var normalMatrixLocation = gl.getUniformLocation(program, 'u_NormalMatrix');
  // position
  var lightPositionLocation = gl.getUniformLocation(program, 'u_LightPosition');
  // light matrix
  var lightMatrixLocation = gl.getUniformLocation(program, 'u_LightMatrix');
  // light source
  var lightAmbientLocation = gl.getUniformLocation(program, 'u_LightAmbient');
  var lightColorLocation = gl.getUniformLocation(program, 'u_LightColor');
  // material
  var materialColorLocation = gl.getUniformLocation(program, 'u_MaterialColor');
  // shininess
  var glossLocation = gl.getUniformLocation(program, 'u_Gloss');
  // whether texture available
  var textureAvailableLocation = gl.getUniformLocation(program, 'u_TextureAvailable');


  // position
  gl.uniform3fv(lightPositionLocation, [0.0, 0.0, 0.0]);
  // light source
  gl.uniform4fv(lightAmbientLocation, [0.0, 0.0, 0.0, 1.0]);
  gl.uniform4fv(lightColorLocation, [1.0, 1.0, 1.0, 1.0]);
  // material diffuse
  gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
  // gl.uniform4fv(materialColorLocation, [0.0, 0.0, 0.0, 1.0]);
  // shininess
  gl.uniform1f(glossLocation, 30);
  // texture availability
  gl.uniform1i(textureAvailableLocation, textureAvailable);

  // setup buffer
  // matrix
  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 3000);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

  // vertex buffer
  var vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLocation);
  // texture buffer
  if(loader.texCoords.length > 0){
    var tb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.texCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordLocation, loader.texCoordComponentSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLocation);
  }
  // normal buffer
  if(loader.normals.length > 0){
    var nb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
  }
  // sphere.indices buffer
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(loader.indices), gl.STATIC_DRAW);

  function render(){
    stats.begin();

    update();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);





    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    // update inverse model view matrix
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

    lightRotateX-=0.01;
    lightRotateY-=0.012;
    lightRotateZ-=0.015;
    // transform light
    mat4.identity(lightMatrix);
    mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -5]);
    // mat4.rotate(lightMatrix, lightMatrix, lightRotateX, [1, 0, 0]);
    mat4.rotate(lightMatrix, lightMatrix, lightRotateY, [0, 1, 0]);
    // mat4.rotate(lightMatrix, lightMatrix, lightRotateZ, [0, 0, 1]);
    mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -5]);
    gl.uniformMatrix4fv(lightMatrixLocation, false, lightMatrix);

    for(var i=0; i<loader.meshes.length; ++i){
      var mesh = loader.meshes[i];
      var material = loader.mtlLoader.materialMap[mesh.usemtl];
      if(material)
        textureManager.bind(material.map_Kd);
      gl.drawArrays(gl.TRIANGLES, loader.meshes[i].startIndex, loader.meshes[i].vertices.length/3);
    }

    // gl.drawElements(gl.TRIANGLES, loader.indices.length, gl.UNSIGNED_SHORT, 0);

    stats.end();
    requestAnimFrame(render);
  }
  requestAnimFrame(render);

  console.log('%crendering... use AWSD and mouse to navigate', 'color: cyan');
}



/**
 * Controls
 */
var KeyStates = Object.create(null);
KeyStates.W = KeyStates.S = KeyStates.A = KeyStates.D = KeyStates.SHIFT = 0;

var UP_VECTOR = vec3.fromValues(0, 1, 0);

// rotation for the camera
var cameraRotationX = 0;
var cameraRotationY = 0;
var cameraRotationMatrix = mat4.create();

// scalar for the velocity, easier to modify, MUST >= 0
var speed = 0.2;

// forward
var forwardDirection = vec3.fromValues(0, 0, -1);
var rotatedForwardDirection = vec3.create();
var forwardVelocity = vec3.create();

// shift
var shiftDirection = vec3.create();
var shiftVelocity = vec3.create();

// camera position
var position = vec3.fromValues(0, 0, 5);

function update(){
  mat4.identity(modelViewMatrix);
  mat4.identity(viewMatrix);
  mat4.identity(cameraRotationMatrix);

  // console.log(cameraRotationX, cameraRotationY)

  // rotate the camera
  mat4.rotateY(cameraRotationMatrix, cameraRotationMatrix, cameraRotationY);
  mat4.rotateX(cameraRotationMatrix, cameraRotationMatrix, cameraRotationX);

  // TODO: apply rotation matrix to the forward direction.
  vec3.transformMat4(rotatedForwardDirection, forwardDirection, cameraRotationMatrix);

  // forward
  vec3.scale(forwardVelocity, rotatedForwardDirection, (KeyStates.W+KeyStates.S)*speed);
  vec3.add(position, position, forwardVelocity);
  // shift
  vec3.cross(shiftDirection, rotatedForwardDirection, UP_VECTOR);
  vec3.scale(shiftVelocity, shiftDirection, (KeyStates.A+KeyStates.D)*speed);
  vec3.add(position, position, shiftVelocity);
  // update position
  mat4.translate(viewMatrix, viewMatrix, position);

  // apply rotation matrix to the view matrix
  mat4.mul(viewMatrix, viewMatrix, cameraRotationMatrix);


  // invert the view matrix, since the matrix is going to apply to the models:
  // you move left, means models move right; just opposite.
  mat4.invert(viewMatrix, viewMatrix);

  mat4.mul(modelViewMatrix, modelMatrix, viewMatrix);
}

var mouseX = window.innerWidth/2;
var mouseY = window.innerHeight/2;
document.onmousemove = function(e){
  // cameraRotationX = -(e.y - window.innerHeight/2)/window.innerHeight * Math.PI;
  // cameraRotationY = -(e.x - window.innerWidth/2)/window.innerWidth * Math.PI*2;

  var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
  var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
  mouseX += movementX;
  mouseY += movementY;
  if(mouseY > window.innerHeight - 1)
    mouseY = window.innerHeight - 1;
  if(mouseY < 1)
    mouseY = 1;
  cameraRotationX = -(mouseY - window.innerHeight/2)/window.innerHeight * Math.PI;
  cameraRotationY = -(mouseX - window.innerWidth/2)/window.innerWidth * Math.PI*2;

  // console.log(movementX, movementY);
}

document.addEventListener('keydown', function(e){
  switch(e.keyCode){
    // w, forward
    case 87:
      KeyStates.W = 1;
      break;
    // s, backward
    case 83:
      KeyStates.S = -1;
      break;
    // a, shift left
    case 65:
      KeyStates.A = -1;
      break;
    // d, shift right
    case 68:
      KeyStates.D = 1;
      break;
    // shift
    case 16:
      KeyStates.SHIFT = 1;
      break;
    // +
    case 187:
      speed += KeyStates.SHIFT * (20 - speed)/10;
      console.log('speed down: ' + speed);
      break;
    // -
    case 189:
      speed += KeyStates.SHIFT * (0.001 - speed)/10;
      console.log('speed up: ' + speed);
      break;
  }
});

document.addEventListener('keyup', function(e){
  switch(e.keyCode){
    // w, forward
    case 87:
      KeyStates.W = 0;
      break;
    // s, backward
    case 83:
      KeyStates.S = 0;
      break;
    // a, shift left
    case 65:
      KeyStates.A = 0;
      break;
    // d, shift right
    case 68:
      KeyStates.D = 0;
      break;
    case 16:
      KeyStates.SHIFT = 0;
      break;
  }
});

canvas.addEventListener('click', function(){
  lockPointer();
});

// ui
var FizzyText = function() {
  this.message = 'dat.gui';
  this.speed = 0.8;
  this.displayOutline = false;
  // Define render logic ...
};

window.onload = function() {
  var text = new FizzyText();
  var gui = new dat.GUI();
  gui.add(text, 'message');
  gui.add(text, 'speed', -5, 5);
  gui.add(text, 'displayOutline');
  gui.add(text, 'explode');
};