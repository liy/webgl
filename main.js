var lightRotateX = 0;
var lightRotateY = -Math.PI;
var lightRotateZ = 0;
var objRotationX = 0;
var objRotationY = 0;
var objRotationZ = 0;

var velocity = vec3.create();
var position = vec3.create();
var targetRotationY = 0;
var targetRotationX = 0;

var translationMatrix = mat4.create();
var rotationMatrix = mat4.create();

var vx = 0;
var vy = 0;
var vz = 0;



var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms
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
// gl.enable(gl.CULL_FACE);

var loader = new ObjLoader(false);
var modelPath = '../webgl-meshes/crytek-sponza/';
var fileName = 'sponza.obj';
loader.load(modelPath, fileName, bind(this, loadTextures));
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

function loadTextures(){
  var materialMap = loader.mtlLoader.materialMap;
  for(var key in materialMap){
    var material = materialMap[key];
    if(material.map_Kd != ''){
      textureManager.add(modelPath + material.map_Kd, material.map_Kd);
    }
  }
  textureManager.load(bind(this, onTexturesLoaded));
}

function onTexturesLoaded(){
  console.log(textureManager.map);

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

  // setup buffer
  // matrix
  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 2000);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  var modelViewMatrix = mat4.create();
  var normalMatrix = mat3.create();
  // light matrix
  var lightMatrix = mat4.create();

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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    objRotationX += (targetRotationX - objRotationX)/10;
    objRotationY += (targetRotationY - objRotationY)/10;


    mat4.identity(rotationMatrix);
    mat4.rotate(rotationMatrix, rotationMatrix, objRotationX, [1, 0, 0]);
    mat4.rotate(rotationMatrix, rotationMatrix, objRotationY, [0, 1, 0]);
    vec3.set(velocity, vx, 0, vz);
    vec3.transformMat4(velocity, velocity, rotationMatrix);
    vec3.add(position, position, velocity);
    mat4.identity(translationMatrix);
    mat4.translate(translationMatrix, translationMatrix, position);

    mat4.identity(modelViewMatrix);
    mat4.mul(modelViewMatrix, modelViewMatrix, rotationMatrix);
    mat4.mul(modelViewMatrix, modelViewMatrix, translationMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    // update inverse model view matrix
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

    lightRotateX-=0.01;
    lightRotateY-=0.012;
    lightRotateZ-=0.015;
    // transform light
    mat4.identity(lightMatrix);
    mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -0]);
    mat4.rotate(lightMatrix, lightMatrix, lightRotateX, [1, 0, 0]);
    mat4.rotate(lightMatrix, lightMatrix, lightRotateY, [0, 1, 0]);
    mat4.rotate(lightMatrix, lightMatrix, lightRotateZ, [0, 0, 1]);
    mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -0]);
    gl.uniformMatrix4fv(lightMatrixLocation, false, lightMatrix);

    for(var i=0; i<loader.meshes.length; ++i){
      var mesh = loader.meshes[i];
      textureManager.bind(loader.mtlLoader.materialMap[mesh.usemtl].map_Kd);
      gl.drawArrays(gl.TRIANGLES, loader.meshes[i].startIndex, loader.meshes[i].vertices.length/3);
    }

    // gl.drawElements(gl.TRIANGLES, loader.indices.length, gl.UNSIGNED_SHORT, 0);

    stats.end();
    requestAnimFrame(render);
  }
  requestAnimFrame(render);
}

document.onmousemove = function(evt){
  targetRotationX = (evt.y - window.innerHeight/2)/window.innerHeight * Math.PI;
  targetRotationY = (evt.x - window.innerWidth/2)/window.innerWidth * Math.PI*2;
}

document.addEventListener('keydown', function(evt){
  // console.log(evt.keyCode);
  switch(evt.keyCode){
    // w
    case 87:
      vz = 2;
      break;
    // s
    case 83:
      vz = -2;
      break;
    // a
    case 65:
      vx = 2;
      break;
    case 68:
      vx = -2;
      break;
  }
});

document.addEventListener('keyup', function(evt){
  // console.log(evt.keyCode);
  switch(evt.keyCode){
    // w
    case 87:
      vz = 0;
      break;
    // s
    case 83:
      vz = 0;
      break;
    // a
    case 65:
      vx = 0;
      break;
    case 68:
      vx = 0;
      break;
  }
});