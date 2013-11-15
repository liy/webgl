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
gl.enable(gl.CULL_FACE);
// gl.disable(gl.DEPTH_TEST);
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


// vertex buffer, texture buffer, normal buffer and index buffer
var vb, tb, nb, ib;
var tangentBuffer;

// matrix etc.
var lightRotateX = 0;
var lightRotateY = 0;
var lightRotateZ = 0;
var lightPosition = vec3.create();

var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var modelViewMatrix = mat4.create();
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
var tangentLocation = gl.getAttribLocation(program, 'a_Tangent');
// matrix
var projectionMatrixLocation = gl.getUniformLocation(program, 'u_ProjectionMatrix');
var modelViewMatrixLocation = gl.getUniformLocation(program, 'u_ModelViewMatrix');
var modelMatrixLocation = gl.getUniformLocation(program, 'u_ModelMatrix');
var viewMatrixLocation = gl.getUniformLocation(program, 'u_ViewMatrix');
var modelMatrixInverseTransposeLocation = gl.getUniformLocation(program, 'u_ModelMatrixInverseTranspose');
// light
var lightPositionLocation = gl.getUniformLocation(program, 'u_LightPosition');
// camera
var cameraPositionLocation = gl.getUniformLocation(program, 'u_CameraPosition');
// light attributes
var lightAmbientLocation = gl.getUniformLocation(program, 'u_LightAmbient');
var lightColorLocation = gl.getUniformLocation(program, 'u_LightColor');
// material
var materialColorLocation = gl.getUniformLocation(program, 'u_MaterialColor');
var glossLocation = gl.getUniformLocation(program, 'u_Gloss');
// whether texture available
var textureAvailableLocation = gl.getUniformLocation(program, 'u_TextureAvailable');
// textures
var diffuseTextureLocation = gl.getUniformLocation(program, 'diffuseTexture');
var bumpTextureLocation = gl.getUniformLocation(program, 'bumpTexture');

// light source
gl.uniform4fv(lightAmbientLocation, [0.0, 0.0, 0.0, 1.0]);
gl.uniform4fv(lightColorLocation, [1.0, 1.0, 1.0, 1.0]);
// material diffuse
gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
// gl.uniform4fv(materialColorLocation, [0.0, 0.0, 0.0, 1.0]);
// shininess
gl.uniform1f(glossLocation, 30);
// diffuse textures
gl.uniform1i(diffuseTextureLocation, 0);
// bump texture
gl.uniform1i(bumpTextureLocation, 1);

// setup buffer
// matrix
var projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 3000);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);


// cube mesh
var cube = new CubeGeometry();


// texture manager
var textureManager = new TextureManager();
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

// textureManager.add('../webgl-meshes/normal_map/normal.png', 'normalMap');
textureManager.add('../webgl-meshes/normal_map/brick.png', 'normalMap');
textureManager.load(bind(this, onTexturesLoaded));

function onTexturesLoaded(){
  console.log('texture loaded');

  // vertex buffer
  vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vertexLocation);
  // texture buffer
  if(cube.texCoords.length > 0){
    tb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.texCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLocation);
  }
  // normal buffer
  if(cube.normals.length > 0){
    nb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.normals), gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLocation);
  }

  if(cube.tangents){
    tangentBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.tangents), gl.STATIC_DRAW);
    gl.vertexAttribPointer(tangentLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLocation);
  }

  ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);
}


function render(){
  stats.begin();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  update();

  mat4.rotateY(modelMatrix, modelMatrix, -0.2);
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
  // update inverse model view matrix
  // mat3.normalFromMat4(normalMatrix, modelViewMatrix);
  mat3.normalFromMat4(normalMatrix, modelMatrix);
  gl.uniformMatrix3fv(modelMatrixInverseTransposeLocation, false, normalMatrix);

  // light position
  lightRotateX-=0.01;
  lightRotateY-=0.012;
  lightRotateZ-=0.015;
  mat4.identity(lightMatrix);
  // mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -100]);
  // mat4.rotate(lightMatrix, lightMatrix, lightRotateX, [1, 0, 0]);
  mat4.rotate(lightMatrix, lightMatrix, lightRotateY, [0, 1, 0]);
  // mat4.rotate(lightMatrix, lightMatrix, lightRotateZ, [0, 0, 1]);
  mat4.translate(lightMatrix, lightMatrix, [30.0, 0.0, 200]);
  // vec3.transformMat4(lightPosition, vec3.create(), lightMatrix);
  vec3.set(lightPosition, 0, 0, 0);
  gl.uniform3fv(lightPositionLocation, lightPosition);

  // camera position
  gl.uniform3fv(cameraPositionLocation, cameraPosition);

  textureManager.bindTexture('normalMap', gl.TEXTURE0+1);

  gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);


  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);



















vec3.set(cameraPosition, 0, 0, 2);
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
  vec3.scale(forwardVelocity, rotatedForwardDirection, (InputStates.W+InputStates.S)*0.01);
  vec3.add(cameraPosition, cameraPosition, forwardVelocity);
  // shift
  vec3.cross(shiftDirection, rotatedForwardDirection, UP_VECTOR);
  vec3.scale(shiftVelocity, shiftDirection, (InputStates.A+InputStates.D)*0.01);
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