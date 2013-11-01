var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.73, 0.73, 0.73, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// gl.enable(gl.CULL_FACE);
// gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// texture manager
var textureManager = new TextureManager();

// load the object file
var loader = new ObjLoader(false);
var path = '../webgl-meshes/buddha/';
var file = 'buddha.obj';
loader.load(path, file, loadTextures);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);


// vertex buffer, texture buffer, normal buffer and index buffer
var vb, tb, nb, ib;


// matrix etc.
var lightRotateX = 0;
var lightRotateY = -Math.PI;
var lightRotateZ = 0;
var modelViewMatrix = mat4.create();
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var normalMatrix = mat3.create();
var lightMatrix = mat4.create();

// model rotation. When pointer is not lock use these for rotating model
var modelRotationX = 0;
var modelRotationY = 0;
// for calculating rotation, current mouse down point needs to be tracked.
var dragStartX = dragStartY = 0;
var dragDeltaX = dragDeltaY = 0;

/**
 * Camera user controls related 
 */
var InputStates = Object.create(null);
InputStates.W = InputStates.S = InputStates.A = InputStates.D = InputStates.SHIFT = InputStates.MOUSE_DOWN = 0;
var Mouse = Object.create(null);
Mouse.clientX = Mouse.clientY = Mouse.movementX = Mouse.movementY = 0;
// update vector
var UP_VECTOR = vec3.fromValues(0, 1, 0);
// rotation for the camera
var cameraRotationX = 0;
var cameraRotationY = 0;
var cameraRotationMatrix = mat4.create();

// forward
var forwardDirection = vec3.fromValues(0, 0, -1);
var rotatedForwardDirection = vec3.create();
var forwardVelocity = vec3.create();
// shift
var shiftDirection = vec3.create();
var shiftVelocity = vec3.create();
// camera position
var cameraPosition = vec3.create();
// keep track of mouse x and y, for avoiding gimbal lock
var mouseX = window.innerWidth/2;
var mouseY = window.innerHeight/2;


// setup shader program
var program = gl.createProgram();
var shader = new Shader(program, 'shader/brdf.vert', 'shader/brdf.frag');
gl.useProgram(program);
shader.bindAttributes(program);
shader.bindUniforms(program);

// attributes
var vertexLocation = gl.getAttribLocation(program, 'a_Vertex');
var normalLocation = gl.getAttribLocation(program, 'a_Normal');
var texCoordLocation = gl.getAttribLocation(program, 'a_TexCoord');
// matrix
var projectionMatrixLocation = gl.getUniformLocation(program, 'u_ProjectionMatrix');
var modelViewMatrixLocation = gl.getUniformLocation(program, 'u_ModelViewMatrix');
var normalMatrixLocation = gl.getUniformLocation(program, 'u_NormalMatrix');
// light 
var lightPositionLocation = gl.getUniformLocation(program, 'u_LightPosition');
var lightMatrixLocation = gl.getUniformLocation(program, 'u_LightMatrix');
// light attributes
var lightAmbientLocation = gl.getUniformLocation(program, 'u_LightAmbient');
var lightColorLocation = gl.getUniformLocation(program, 'u_LightColor');
// material
var materialColorLocation = gl.getUniformLocation(program, 'u_MaterialColor');
var glossLocation = gl.getUniformLocation(program, 'u_Gloss');
// whether texture available
var textureAvailableLocation = gl.getUniformLocation(program, 'u_TextureAvailable');

// light position
gl.uniform3fv(lightPositionLocation, [0.0, 0.0, 0.0]);
// light source
gl.uniform4fv(lightAmbientLocation, [0.0, 0.0, 0.0, 1.0]);
gl.uniform4fv(lightColorLocation, [1.0, 1.0, 1.0, 1.0]);
// material diffuse
gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
// gl.uniform4fv(materialColorLocation, [0.0, 0.0, 0.0, 1.0]);
// shininess
gl.uniform1f(glossLocation, 30);

// setup buffer
// matrix
var projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 3000);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);


function render(){
  stats.begin();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // meshes is loaded
  if(loader.meshes){
    update();

    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    // update inverse model view matrix
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

    lightRotateX-=0.01;
    lightRotateY-=0.012;
    lightRotateZ-=0.015;
    // transform light
    mat4.identity(lightMatrix);
    // mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -100]);
    // mat4.rotate(lightMatrix, lightMatrix, lightRotateX, [1, 0, 0]);
    mat4.rotate(lightMatrix, lightMatrix, lightRotateY, [0, 1, 0]);
    // mat4.rotate(lightMatrix, lightMatrix, lightRotateZ, [0, 0, 1]);
    mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -200]);

    mat4.mul(lightMatrix, viewMatrix, lightMatrix);
    gl.uniformMatrix4fv(lightMatrixLocation, false, lightMatrix);

      // console.log(loader.meshes.length);
    for(var i=0; i<loader.meshes.length; ++i){
      var mesh = loader.meshes[i];
      var material = loader.mtlLoader.materialMap[mesh.usemtl];
      if(material)
        textureManager.bind(material.map_Kd);

      gl.drawArrays(gl.TRIANGLES, loader.meshes[i].startIndex, loader.meshes[i].vertices.length/3);
    }
  }
  

  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);






















function loadTextures(){
  var materialMap = loader.mtlLoader.materialMap;
  for(var key in materialMap){
    var material = materialMap[key];
    if(material.map_Kd != ''){
      textureManager.add(path + material.map_Kd, material.map_Kd);
    }
  }

  if(textureManager.loaders.length !== 0){
    gl.uniform1i(textureAvailableLocation, true);
    textureManager.load(bind(this, onTexturesLoaded));
  }
  else{
    gl.uniform1i(textureAvailableLocation, false);
    onTexturesLoaded();
  }
}

function onTexturesLoaded(){
  console.log('texture loaded');

  // vertex buffer
  vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLocation);
  // texture buffer
  if(loader.texCoords.length > 0){
    tb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.texCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordLocation, loader.texCoordComponentSize, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLocation);
  }
  // normal buffer
  if(loader.normals.length > 0){
    nb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
  }
  // sphere.indices buffer
  ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(loader.indices), gl.STATIC_DRAW);

 

  console.log('%crendering... use AWSD and mouse to navigate', 'color: cyan');
}
















// control control and dat GUI
var ControlPanel = function(){
  this.model = 'buddha';
  // scalar for the velocity, easier to modify, MUST >= 0
  this.speed = 0.5;
  this.flatShading = false;
  this.lockPointer = function(){
    lockPointer();
  }
};

var gui = new dat.GUI();
var control = new ControlPanel();
gui.add(control, 'lockPointer');
gui.add(control, 'flatShading').onFinishChange(function(value){
  reload();
});
gui.add(control, 'speed', 0.01, 20).step(0.01);
var modelChangeController = gui.add(control, 'model', {
  buddha: 'buddha',
  'crytek-sponza': 'crytek-sponza',
  cube: 'cube',
  dragon: 'dragon',
  head: 'head',
  'lost-empire': 'lost-empire',
  sibenik: 'sibenik',
  teapot: 'teapot',
  teapot_low: 'teapot_low',
  bunny: 'bunny',
  bunny_low: 'bunny_low'
});

modelChangeController.onFinishChange(function(value){
  path = '../webgl-meshes/';
  file = control.model + '.obj';
  switch(control.model){
    case 'lost-empire':
      path += control.model + '/';
      file = 'lost_empire.obj';
      break;
    case 'bunny':
      path += '';
      file = 'bunny.obj';
      break;
    case 'bunny_low':
      path += '';
      file = 'bunny_low.obj';
      break;
    case 'teapot_low':
      path += '';
      file = 'teapot_low.obj';
      break;
    case 'crytek-sponza':
      path += 'crytek-sponza/';
      file = 'sponza.obj';
      break;
    default:
      path += control.model + '/';
      break;
  }

  // setup camera position, etc.
  setDefaults();

  reload();
})


function reload(){
  // reset camera related matrix
  mat4.identity(viewMatrix);
  mat4.identity(modelMatrix);
  mat4.identity(cameraRotationMatrix);

  mouseX = window.innerWidth/2;
  mouseY = window.innerHeight/2;
  modelRotationX = modelRotationY = 0;

  textureManager.clear();
  loader.clear();
  loader.flatShading = control.flatShading;
  loader.load(path, file, loadTextures);
}

function setDefaults(){
  switch(control.model){
    case 'buddha':
      vec3.set(cameraPosition, 0, 4.5, 10);
      control.flatShading = false;
      break;
    case 'crytek-sponza':
      vec3.set(cameraPosition, 0, 100, 0);
      control.flatShading = true;
      break;
    case 'cube':
      vec3.set(cameraPosition, 0, 0, 3);
      control.flatShading = true;
      break;
    case 'dragon':
      vec3.set(cameraPosition, 0, 4, 10);
      control.flatShading = false;
      break;
    case 'head':
      vec3.set(cameraPosition, 0, -0.1, 0.5);
      control.flatShading = false;
      break;
    case 'lost-empire':
      vec3.set(cameraPosition, -10, 20, 0);
      control.flatShading = true;
      break;
    case 'sibenik':
      vec3.set(cameraPosition, 0, -10, 0);
      control.flatShading = true;
      break;
    case 'teapot':
      vec3.set(cameraPosition, 0, 30, 100);
      control.flatShading = false;
      break;
    case 'teapot_low':
      vec3.set(cameraPosition, 0, 0, 20);
      control.flatShading = false;
      break;
    case 'bunny':
      vec3.set(cameraPosition, 0, 3.8, 10);
      control.flatShading = false;
      break;
    case 'bunny_low':
      vec3.set(cameraPosition, 0, 0.1, 0.2);
      control.flatShading = false;
      break;
  }

  // Iterate over all controllers
  for (var i in gui.__controllers) {
    gui.__controllers[i].updateDisplay();
  }

  console.log(cameraPosition);
}
setDefaults();















function update(){
  mat4.identity(modelViewMatrix);
  mat4.identity(viewMatrix);
  mat4.identity(cameraRotationMatrix);
  mat4.identity(modelMatrix);

  mat4.rotateY(modelMatrix, modelMatrix, modelRotationY);
  mat4.rotateX(modelMatrix, modelMatrix, modelRotationX);

  // rotate the camera
  mat4.rotateY(cameraRotationMatrix, cameraRotationMatrix, cameraRotationY);
  mat4.rotateX(cameraRotationMatrix, cameraRotationMatrix, cameraRotationX);

  // TODO: apply rotation matrix to the forward direction.
  vec3.transformMat4(rotatedForwardDirection, forwardDirection, cameraRotationMatrix);

  // forward
  vec3.scale(forwardVelocity, rotatedForwardDirection, (InputStates.W+InputStates.S)*control.speed);
  vec3.add(cameraPosition, cameraPosition, forwardVelocity);
  // shift
  vec3.cross(shiftDirection, rotatedForwardDirection, UP_VECTOR);
  vec3.scale(shiftVelocity, shiftDirection, (InputStates.A+InputStates.D)*control.speed);
  vec3.add(cameraPosition, cameraPosition, shiftVelocity);
  // update cameraPosition
  mat4.translate(viewMatrix, viewMatrix, cameraPosition);

  // apply rotation matrix to the view matrix
  mat4.mul(viewMatrix, viewMatrix, cameraRotationMatrix);


  // invert the view matrix, since the matrix is going to apply to the models:
  // you move left, means models move right; just opposite.
  mat4.invert(viewMatrix, viewMatrix);

  // It is called model view matrix is because that the order of transformation is:
  // apply model first, apply view matrix second.
  // However, OpenGL do the multiplication in reverse order:
  // ModelViewMatrix * V = ViewMatrix * ModelMatrix * V
  // So it is view matrix * model matrix.
  mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
}

document.onmousemove = function(e){
  Mouse.clientX = e.clientX;
  Mouse.clientY = e.clientY;
  Mouse.movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
  Mouse.movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
  if(isPointerLocked()){
    mouseX += Mouse.movementX;
    mouseY += Mouse.movementY;
    if(mouseY > window.innerHeight - 1)
      mouseY = window.innerHeight - 1;
    if(mouseY < 1)
      mouseY = 1;
    cameraRotationX = -(mouseY - window.innerHeight/2)/window.innerHeight * Math.PI;
    cameraRotationY = -(mouseX - window.innerWidth/2)/window.innerWidth * Math.PI*2;
  }
  else{
    // TODO model transformation
    if(InputStates.MOUSE_DOWN === 1){
      dragDeltaX += Mouse.movementX * 3;
      dragDeltaY += Mouse.movementY * 3;
      modelRotationX = dragDeltaY/window.innerHeight;
      modelRotationY = dragDeltaX/window.innerWidth;
    }
  }
}

document.onmousedown = function(e){
  InputStates.MOUSE_DOWN = 1;
  // does not matter it is the real position of the mouse, eventually we only interested the differences while dragging.
  dragStartX = e.clientX;
  dragStartY = e.clientY;
}

document.onmouseup = function(e){
  InputStates.MOUSE_DOWN = 0;
}

document.addEventListener('keydown', function(e){
  switch(e.keyCode){
    // w, forward
    case 87:
      InputStates.W = 1;
      break;
    // s, backward
    case 83:
      InputStates.S = -1;
      break;
    // a, shift left
    case 65:
      InputStates.A = -1;
      break;
    // d, shift right
    case 68:
      InputStates.D = 1;
      break;
    // shift
    case 16:
      InputStates.SHIFT = 1;
      break;
    // +
    case 187:
      control.speed += InputStates.SHIFT * (20 - control.speed)/10;
      console.log('speed down: ' + control.speed);
      // Iterate over all controllers
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
      break;
    // -
    case 189:
      control.speed += InputStates.SHIFT * (0.001 - control.speed)/10;
      console.log('speed up: ' + control.speed);
      // Iterate over all controllers
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }
      break;
  }
});

document.addEventListener('keyup', function(e){
  switch(e.keyCode){
    // w, forward
    case 87:
      InputStates.W = 0;
      break;
    // s, backward
    case 83:
      InputStates.S = 0;
      break;
    // a, shift left
    case 65:
      InputStates.A = 0;
      break;
    // d, shift right
    case 68:
      InputStates.D = 0;
      break;
    case 16:
      InputStates.SHIFT = 0;
      break;
  }
});