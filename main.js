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
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
gl.enable(gl.CULL_FACE);

var mrtExt = gl.getExtension("WEBGL_draw_buffers");
var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");

var genericProgram = gl.createProgram();
var genericShader = new Shader(genericProgram, 'shader/generic.vert', 'shader/generic.frag');
gl.useProgram(genericProgram);
genericShader.bindAttributes(genericProgram);
genericShader.bindUniforms(genericProgram);

var cube = new CubeGeometry();
var projectionMatrix = mat4.create();
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var modelViewMatrix = mat4.create();
var cameraPosition = vec3.fromValues(0, 0, 2);

// attributes
var vertexLocation = gl.getAttribLocation(genericProgram, 'a_Vertex');
// uniforms
var projectionMatrixLocation = gl.getUniformLocation(genericProgram, 'u_ProjectionMatrix');
var modelMatrixLocation = gl.getUniformLocation(genericProgram, 'u_ModelMatrix');
var viewMatrixLocation = gl.getUniformLocation(genericProgram, 'u_ViewMatrix');
var modelViewMatrixLocation = gl.getUniformLocation(genericProgram, 'u_ModelViewMatrix');

// perspective
mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 100);
// pass to shader
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

var vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);
gl.vertexAttribPointer(vertexLocation, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(vertexLocation);

var ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);


function render(){
  stats.begin();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  update();

  // pass model view matrix to the shader
  gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix);
  gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
  gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

  gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);


  stats.end();
  requestAnimFrame(render);
}
requestAnimFrame(render);


// update
var modelRotationX = 0;
var modelRotationY = 0;
function update(){
  mat4.identity(modelViewMatrix);
  mat4.identity(viewMatrix);
  mat4.identity(modelMatrix);

  modelRotationY += 0.003;
  mat4.rotateY(modelMatrix, modelMatrix, modelRotationY);
  mat4.rotateX(modelMatrix, modelMatrix, modelRotationX);

  // update cameraPosition
  mat4.translate(viewMatrix, viewMatrix, cameraPosition);
  mat4.invert(viewMatrix, viewMatrix);
  mat4.mul(modelViewMatrix, viewMatrix, modelMatrix);
}






// function createColorTexture(){
//   var texture = gl.createTexture();
//   gl.bindTexture(gl.TEXTURE_2D, texture);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
//   gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
//   gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

//   return texture;
// }

// var colorTexture0 = createColorTexture();
// var colorTexture1 = createColorTexture();

// var framebuffer = gl.createFramebuffer();
// gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture0, 0);
// gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, colorTexture1, 0);


// // generic shader
// var genericProgram = gl.createProgram();
// var genericShader = new Shader(genericProgram, 'shader/generic.vert', 'shader/generic.frag');
// gl.useProgram(genericProgram);
// genericShader.bindAttributes(genericProgram);
// genericShader.bindUniforms(genericProgram);

// // mrt shader
// var mrtProgram = gl.createProgram();
// var mrtShader = new Shader(mrtProgram, 'shader/mrt.vert', 'shader/mrt.frag');
// gl.useProgram(mrtProgram);
// mrtShader.bindAttributes(mrtProgram);
// mrtShader.bindUniforms(mrtProgram);

// gl.drawArrays(gl.TRIANGLES, 0, 0);




// gl.useProgram(genericProgram);
// genericShader.bindAttributes(genericProgram);
// genericShader.bindUniforms(genericProgram);
// gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// gl.drawArrays(gl.TRIANGLES, 0, 0);