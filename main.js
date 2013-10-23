var stats = new Stats();
stats.setMode(1); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
// document.body.appendChild( stats.domElement );



var canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
gl.enable(gl.DEPTH_TEST);
gl.clearColor(0.6, 0.6, 0.6, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.CULL_FACE);

var loader = new ObjectLoader('data/teapot/teapot.txt', bind(this, onload));

function onload(){
  var program = gl.createProgram();
  var shader = new Shader(program, 'shader/brdf.vert', 'shader/brdf.frag');
  gl.useProgram(program);
  shader.bindAttributes(program);
  shader.bindUniforms(program);

  // sphere
  // var sphere = new SphereGeometry(0.5, 10, 10);

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
  gl.uniform4fv(lightColorLocation, [4.0, 4.0, 4.0, 1.0]);
  // material
  gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
  // shininess
  gl.uniform1f(glossLocation, 20);

  // setup buffer
  // matrix
  var projectionMatrix = mat4.create();
  mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 800);
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
  var tb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, tb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.vertices), gl.STATIC_DRAW);
  gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(texCoordLocation);
  // normal buffer
  var nb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, nb);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(loader.normals), gl.STATIC_DRAW);
  gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(normalLocation);
  // sphere.indices buffer
  var ib = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(loader.indices), gl.STATIC_DRAW);

  // load texture
  var image = new Image();
  image.onload = init;
  image.src = 'img/earth.jpg';
  var rotationY = 0;
  function init(){
    // texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);

    function render(){
      stats.begin();
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      rotationY-=0.002;

      mat4.identity(modelViewMatrix);
      mat4.translate(modelViewMatrix, modelViewMatrix, [1, 0, -30.0]);
      mat4.rotateY(modelViewMatrix, modelViewMatrix, rotationY);
      gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

      // update inverse model view matrix
      mat3.normalFromMat4(normalMatrix, modelViewMatrix);
      gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

      // transform light
      mat4.identity(lightMatrix);
      mat4.translate(lightMatrix, lightMatrix, [200.0, 0.0, -30.0]);
      gl.uniformMatrix4fv(lightMatrixLocation, false, lightMatrix);

      gl.drawElements(gl.TRIANGLES, loader.indices.length, gl.UNSIGNED_SHORT, 0);


      stats.end();
      requestAnimFrame(render);
    }
    requestAnimFrame(render);
  }
}

// var stats = new Stats();
// stats.setMode(1); // 0: fps, 1: ms
// // Align top-left
// stats.domElement.style.position = 'absolute';
// stats.domElement.style.left = '0px';
// stats.domElement.style.top = '0px';
// document.body.appendChild( stats.domElement );



// var canvas = document.createElement('canvas');
// document.body.appendChild(canvas);
// canvas.width = window.innerWidth;
// canvas.height = window.innerHeight;
// var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
// gl.enable(gl.DEPTH_TEST);
// gl.clearColor(0.6, 0.6, 0.6, 1.0);
// gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// gl.enable(gl.CULL_FACE);

// var program = gl.createProgram();
// var shader = new Shader(program, 'shader/brdf.vert', 'shader/brdf.frag');
// gl.useProgram(program);
// shader.bindAttributes(program);
// shader.bindUniforms(program);

// // sphere
// var sphere = new SphereGeometry(0.5, 10, 10);

// // attributes
// var vertexLocation = gl.getAttribLocation(program, 'a_Vertex');
// var normalLocation = gl.getAttribLocation(program, 'a_Normal');
// var texCoordLocation = gl.getAttribLocation(program, 'a_TexCoord');
// // matrix
// var projectionMatrixLocation = gl.getUniformLocation(program, 'u_ProjectionMatrix');
// var modelViewMatrixLocation = gl.getUniformLocation(program, 'u_ModelViewMatrix');
// var normalMatrixLocation = gl.getUniformLocation(program, 'u_NormalMatrix');
// // position
// var lightPositionLocation = gl.getUniformLocation(program, 'u_LightPosition');
// // light matrix
// var lightMatrixLocation = gl.getUniformLocation(program, 'u_LightMatrix');
// // light source
// var lightAmbientLocation = gl.getUniformLocation(program, 'u_LightAmbient');
// var lightColorLocation = gl.getUniformLocation(program, 'u_LightColor');
// // material
// var materialColorLocation = gl.getUniformLocation(program, 'u_MaterialColor');
// // shininess
// var glossLocation = gl.getUniformLocation(program, 'u_Gloss');


// // position
// gl.uniform3fv(lightPositionLocation, [0.0, 0.0, 0.0]);
// // light source
// gl.uniform4fv(lightAmbientLocation, [0.0, 0.0, 0.0, 1.0]);
// gl.uniform4fv(lightColorLocation, [4.0, 4.0, 4.0, 1.0]);
// // material
// gl.uniform4fv(materialColorLocation, [1.0, 1.0, 1.0, 1.0]);
// // shininess
// gl.uniform1f(glossLocation, 10);

// // setup buffer
// // matrix
// var projectionMatrix = mat4.create();
// mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 800);
// gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
// var modelViewMatrix = mat4.create();
// var normalMatrix = mat3.create();
// // light matrix
// var lightMatrix = mat4.create();

// // vertex buffer
// var vb = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, vb);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.vertices), gl.STATIC_DRAW);
// gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(vertexLocation);
// // texture buffer
// var tb = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, tb);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.texCoords), gl.STATIC_DRAW);
// gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(texCoordLocation);
// // normal buffer
// var nb = gl.createBuffer();
// gl.bindBuffer(gl.ARRAY_BUFFER, nb);
// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sphere.normals), gl.STATIC_DRAW);
// gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
// gl.enableVertexAttribArray(normalLocation);
// // sphere.indices buffer
// var ib = gl.createBuffer();
// gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
// gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(sphere.indices), gl.STATIC_DRAW);

// // load texture
// var image = new Image();
// image.onload = init;
// image.src = 'img/earth.jpg';
// function init(){
//   // texture
//   var texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
//   gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
//   gl.generateMipmap(gl.TEXTURE_2D);

//   function render(){
//     stats.begin();
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

//     mat4.identity(modelViewMatrix);
//     mat4.translate(modelViewMatrix, modelViewMatrix, [0, 0, -2.0]);
//     gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

//     // update inverse model view matrix
//     mat3.normalFromMat4(normalMatrix, modelViewMatrix);
//     gl.uniformMatrix3fv(normalMatrixLocation, false, normalMatrix);

//     // transform light
//     mat4.identity(lightMatrix);
//     mat4.translate(lightMatrix, lightMatrix, [1.0, 0.0, -1.0]);
//     gl.uniformMatrix4fv(lightMatrixLocation, false, lightMatrix);

//     gl.drawElements(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_SHORT, 0);


//     stats.end();
//     requestAnimFrame(render);
//   }
//   requestAnimFrame(render);
// }