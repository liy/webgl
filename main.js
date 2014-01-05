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
gl.disable(gl.DEPTH_TEST);

// for skybox
gl.cullFace(gl.FRONT);
gl.depthFunc(gl.LEQUAL);

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

var minGlossFactor = 0;
var maxGlossFactor = 5000;
var defaultGlossFactorPercentage = 0.2;

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
var cameraPosition = vec3.fromValues(0, 0, 1);
// keep track of mouse x and y, for avoiding gimbal lock
var mouseX = window.innerWidth/2;
var mouseY = window.innerHeight/2;


// setup shader program
var program = gl.createProgram();
var shader = new Shader(program, 'shader/point.vert', 'shader/point.frag');
gl.useProgram(program);
shader.bindAttributes(program);
shader.bindUniforms(program);

// attributes
var vertexLocation = gl.getAttribLocation(program, 'a_Vertex');
var normalLocation = gl.getAttribLocation(program, 'a_Normal');
var texCoordLocation = gl.getAttribLocation(program, 'a_TexCoord');
var tangentLocation = gl.getAttribLocation(program, 'a_Tangent');
var bitangentLocation = gl.getAttribLocation(program, 'a_Bitangent');
// matrix
var projectionMatrixLocation = gl.getUniformLocation(program, 'u_ProjectionMatrix');
var modelViewMatrixLocation = gl.getUniformLocation(program, 'u_ModelViewMatrix');
var modelMatrixLocation = gl.getUniformLocation(program, 'u_ModelMatrix');
var viewMatrixLocation = gl.getUniformLocation(program, 'u_ViewMatrix');
var modelMatrixInverseLocation = gl.getUniformLocation(program, 'u_ModelMatrixInverse');
var modelMatrixInverseTransposeLocation = gl.getUniformLocation(program, 'u_ModelMatrixInverseTranspose');
var modelViewMatrixInverseTransposeLocation = gl.getUniformLocation(program, 'u_ModelViewMatrixInverseTranspose');
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
// gloss factor
var glossFactorLocation = gl.getUniformLocation(program, 'u_GlossFactor');
// whether texture available
var textureAvailableLocation = gl.getUniformLocation(program, 'u_TextureAvailable');
// textures
var diffuseTextureLocation = gl.getUniformLocation(program, 'diffuseTexture');
var bumpTextureLocation = gl.getUniformLocation(program, 'bumpTexture');
var specularTextureLocation = gl.getUniformLocation(program, 'specularTexture');
var glossTextureLocation = gl.getUniformLocation(program, 'glossTexture');
// cube texture map
var cubeMapTextureLocation = gl.getUniformLocation(program, 'cubeMapTexture');


// light source
gl.uniform3fv(lightAmbientLocation, [0.0, 0.0, 0.0]);
gl.uniform3fv(lightColorLocation, [1.0, 1.0, 1.0]);
// material diffuse
gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
// gl.uniform4fv(materialColorLocation, [0.0, 0.0, 0.0, 1.0]);
// shininess
gl.uniform1f(glossLocation, 30);
gl.uniform1f(glossFactorLocation, minGlossFactor + defaultGlossFactorPercentage*(maxGlossFactor - minGlossFactor));
// diffuse textures
gl.uniform1i(diffuseTextureLocation, 0);
// bump texture
gl.uniform1i(bumpTextureLocation, 1);
gl.uniform1i(specularTextureLocation, 2);
gl.uniform1i(glossTextureLocation, 3);
gl.uniform1i(cubeMapTextureLocation, 4);

// setup buffer
// matrix
var projectionMatrix = mat4.create();
mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 3000);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);


// cube mesh
// var cube = new SphereGeometry(0.5, 30, 30);
// var cube = new CubeGeometry();

var cube = new SphereGeometry();


// texture manager
var textureManager = new TextureManager();
// gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

textureManager.add('../webgl-meshes/normal_map/brick_guiConcreteBrick_1k_d.tga', 'texture');
textureManager.add('../webgl-meshes/normal_map/brick_guiConcreteBrick_1k_n.tga', 'normalMap');
textureManager.add('../webgl-meshes/normal_map/brick_guiConcreteBrick_1k_s.tga', 'specularMap');
textureManager.add('../webgl-meshes/normal_map/brick_guiConcreteBrick_1k_g.tga', 'glossMap');
textureManager.load(bind(this, onTexturesLoaded));


// create cube texture
function loadCubeMap(){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  var faces = [
    ["../webgl-meshes/cube_map/posx.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
    ["../webgl-meshes/cube_map/negx.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
    ["../webgl-meshes/cube_map/posy.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
    ["../webgl-meshes/cube_map/negy.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
    ["../webgl-meshes/cube_map/posz.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
    ["../webgl-meshes/cube_map/negz.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
  ]

  var loaded = 0;
  for(var i=0; i<faces.length; ++i){
    var glFaceDef = faces[i][1];
    var image = new Image();
    image.onload = function(texture, glFaceDef, image){
      return function(){
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        // gl.pixelStorei(gl.UNPACK_FLIP_X_WEBGL, true);
        gl.texImage2D(glFaceDef, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        // if(loaded++ == 4)
        //   onTexturesLoaded();
      }
    }(texture, glFaceDef, image);
    image.src = faces[i][0];
  }

  return texture;
}
var cubeMapTexture = loadCubeMap();

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
    gl.vertexAttribPointer(texCoordLocation, 3, gl.FLOAT, false, 0, 0);
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

  if(cube.tangents && cube.tangents.length !== 0){
    tangentBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.tangents), gl.STATIC_DRAW);
    gl.vertexAttribPointer(tangentLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(tangentLocation);
  }

  if(cube.bitangents && cube.bitangents.length !== 0){
    tangentBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.bitangents), gl.STATIC_DRAW);
    gl.vertexAttribPointer(bitangentLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(bitangentLocation);
  }

  ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);
}


function render(){
  stats.begin();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  update();

  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);
  // inverse of the model matrix
  gl.uniformMatrix4fv(modelMatrixInverseLocation, false, mat4.invert(mat4.create(), modelMatrix));
  // update inverse transpose model view matrix
  gl.uniformMatrix3fv(modelMatrixInverseTransposeLocation, false, mat3.normalFromMat4(mat3.create(), modelMatrix));
  gl.uniformMatrix3fv(modelViewMatrixInverseTransposeLocation, false, mat3.normalFromMat4(mat3.create(), modelViewMatrix));

  // light position
  lightRotateX-=0.01;
  lightRotateY-=0.005;
  lightRotateZ-=0.015;
  mat4.identity(lightMatrix);
  // mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, -100]);
  // mat4.rotate(lightMatrix, lightMatrix, lightRotateX, [1, 0, 0]);
  mat4.rotate(lightMatrix, lightMatrix, lightRotateY, [0, 1, 0]);
  // mat4.rotate(lightMatrix, lightMatrix, lightRotateZ, [0, 0, 1]);
  mat4.translate(lightMatrix, lightMatrix, [0.0, 0.0, 1.8]);
  mat4.multiply(lightMatrix, viewMatrix, lightMatrix);
  vec3.transformMat4(lightPosition, vec3.create(), lightMatrix);
  // vec3.set(lightPosition, 0, 0, 0);
  gl.uniform3fv(lightPositionLocation, lightPosition);

  // camera position
  gl.uniform3fv(cameraPositionLocation, cameraPosition);


  textureManager.bindTexture('texture', gl.TEXTURE0);
  textureManager.bindTexture('normalMap', gl.TEXTURE0+1);
  textureManager.bindTexture('specularMap', gl.TEXTURE0+2);
  textureManager.bindTexture('glossMap', gl.TEXTURE0+3);

  gl.activeTexture(gl.TEXTURE0+4);
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMapTexture);

  gl.drawElements(gl.POINTS, cube.indices.length, gl.UNSIGNED_SHORT, 0);


  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);


window.onload = function() {
  var params = new Object();
  params.glossFactor = defaultGlossFactorPercentage;
  params.lockPointer = function(){
    lockPointer();
  }
  var gui = new dat.GUI();
  var glossFactorController = gui.add(params, 'glossFactor', 0.0, 1.0).step(0.01);
  glossFactorController.onChange(function(value){
    gl.uniform1f(glossFactorLocation, minGlossFactor + value*(maxGlossFactor - minGlossFactor));
  });
  gui.add(params, 'lockPointer');
};















function update(){
  mat4.identity(modelViewMatrix);
  mat4.identity(viewMatrix);
  mat4.identity(cameraRotationMatrix);
  mat4.identity(modelMatrix);

  // modelRotationY += 0.003;

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
  if(e.target !== canvas)
    return;

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



































































// var FACTORIAL = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368000,20922789888000,355687428096000,
// 6402373705728000,121645100408832000,2432902008176640000,51090942171709440000,1124000727777607680000,25852016738884976640000,620448401733239439360000,
// 15511210043330985984000000,403291461126605635584000000,10888869450418352160768000000,304888344611713860501504000000,8841761993739701954543616000000,
// 265252859812191058636308480000000,8222838654177922817725562880000000,263130836933693530167218012160000000,8683317618811886495518194401280000000]

// function SHSample(sqrtSamples, numBands){
//   // store all the samples
//   var samples = new Array(sqrtSamples*sqrtSamples);

//   var index = 0;
//   var oneOverN = 1/sqrtSamples;
//   for(var i=0; i<sqrtSamples; ++i){
//     for(var j=0; j<sqrtSamples; ++j){
//       // chop domain into sqrtSamples*sqrtSamples number of square, pick random sample in each square.
//       var x = (i+Math.random()) * oneOverN;
//       var y = (j+Math.random()) * oneOverN;
//       // not sure why I need acos.
//       var theta = 2 * Math.acos(Math.sqrt(1-x));
//       // y starts from 0, to 1; phi starts from 0 to 2 pi
//       var phi = 2*Math.PI * y;

//       // sample object contains the sample information
//       var sample = {
//         sphere: vec3.fromValues(theta, phi, 1),
//         dir: vec3.fromValues(Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)),
//         // stores Spherical harmonics values(basis function's result, length 9 if we choose band 2), so later we can multiply to the rendering equation and using
//         // monte carlo estimator to sum them all to produce a series(9 if we choose band 2) of coefficients which approximate the diffuse map.
//         basis: []
//       }

//       // Generate a sequence of SH values(basis function's result) for this sample.
//       for(var l=0; l<numBands; ++l){
//         for(var m=-l; m<=l; ++m){
//           sample.basis.push(sh(l, m, theta, phi));
//         }
//       }

//       console.log(sample.basis);

//       samples[index] = sample;
//       ++index;
//     }
//   }

//   return samples;
// }

// /**
//  * evaluate an Associated Legendre Polynomial P(l,m,x) at x
//  * @param  {[type]} l [description]
//  * @param  {[type]} m [description]
//  * @param  {[type]} x [description]
//  * @return {[type]}
//  */
// function p(l, m, x){
//   // p00 = 1
//   var pmm = 1;

//   // rule 2, since m always < l. We can directly calculate the polynomial value when m == l.
//   // But because l should be non-negative, we have to make sure m is non-negative before doing the process.
//   if(m>0) {
//     var somx2 = Math.sqrt((1-x)*(1+x));
//     // TODO: double factorial: 1,3,5,7,9... might be better to use a table
//     var fact = 1;
//     for(var i=1; i<=m; ++i) {
//       pmm *= (-fact) * somx2;
//       fact += 2;
//     }
//   }
//   // catch the case l == m, simply return P
//   if(l===m)
//     return pmm;

//   // rule 3 to rise the band l by 1
//   var pmmp1 = x * (2*m+1) * pmm;
//   // catch the case that l == m+1
//   if(l===m+1)
//     return pmmp1;

//   // rule 1, keep increasing l, until l reaches target l
//   var pll = 0;
//   for(var ll=m+2; ll<=l; ++ll) {
//     pll = ( (2*ll-1)*x*pmmp1-(ll+m-1)*pmm ) / (ll-m);
//     pmm = pmmp1;
//     pmmp1 = pll;
//   }
//   return pll;
// }

// /**
//  * normalization factor
//  * @param  {[type]} l [description]
//  * @param  {[type]} m [description]
//  * @return {[type]}   [description]
//  */
// function k(l, m){
//   // renormalization constant for SH function
//   return Math.sqrt(((2*l+1)*FACTORIAL[l-m]) / (4*Math.PI*FACTORIAL[l+m]));
// }

// /**
//  * Calculate the value using the Spherical Harmonic basis function
//  * @param  {[type]} l     [description]
//  * @param  {[type]} m     [description]
//  * @param  {[type]} theta [description]
//  * @param  {[type]} phi   [description]
//  * @return {[type]}       [description]
//  */
// function sh(l, m, theta, phi){
//   if(m>0)
//     return Math.SQRT2 * k(l, m) * Math.cos(m*phi) * p(l, m, Math.cos(theta));
//   else if(m<0)
//     // note that normalization function k() expect a absolute value of m. Just invert the sign.
//     return Math.SQRT2 * k(l, -m) * Math.sin(-m*phi) * p(l, -m, Math.cos(theta));
//   else
//     return k(l,0) * p(l, 0, Math.cos(theta));
// }

// function shProjection(samples, numCoefficients){
//   // The final coefficients approximate diffuse environment map data.
//   var coefficients = Array.apply(null, new Array(numCoefficients)).map(Number.prototype.valueOf, 0);

//   // loop through all samples, sum the light function result multiply the SH function result through all basis functions
//   var numSamples = samples.length;
//   for(var i=0; i<numSamples; ++i){
//     var theta = samples[i].sphere[0];
//     var phi = samples[i].sphere[1];

//     // summation of the light()*SH() through all the basis functions
//     for(var j=0; j<numCoefficients; ++j){
//       coefficients[j] += light(theta, phi) * samples[i].basis[j];
//     }
//   }

//   // since the samples are unbiased, the probably density function represents the relative probability
//   // picking a point on the sphere surface, they are equal probability, so it is pdf(x) = 1/(4*PI).
//   // Monte Carlo estimator use 1/pdf(x), called weight, so it is 4*PI.
//   var weight = 4*Math.PI;
//   // TODO: combine weight and the factor together.
//   var factor = weight/numSamples;

//   // divide by the weight/number of sample according to Monte Carlo estimator
//   for(var i=0; i<numCoefficients; ++i){
//     coefficients[i] *= factor;
//   }

//   return coefficients;
// }

// // just a light testing function produce two low frequency spot lights
// function light(theta, phi){
//   return Math.max(0, 5*Math.cos(theta)-4) + Math.max(0, -4*Math.sin(theta-Math.PI)*Math.cos(phi-2.5)-3);
// }

// // just a util function to get num of coefficients(or number of basis function) will be produced
// // for number of bands used.
// function numCoefficients(numBands){
//   return numBands*numBands;
// }


// var numBands = 2;
// var sqrtSamples = 2;
// var samples = SHSample(sqrtSamples, numBands);
// var coefficients = shProjection(samples, numCoefficients(numBands));
// console.log(coefficients);