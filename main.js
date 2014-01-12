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
gl.clearColor(0.2, 0.2, 0.2, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
// gl.enable(gl.CULL_FACE);

var dbExt = gl.getExtension("WEBGL_draw_buffers");
var dtExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");
var vaoExt = gl.getExtension("OES_vertex_array_object"); // Vendor prefixes may apply!




// Setup MRT
// 3 textures as 3 render targets
var colorTexture0 = createColorTexture();
var colorTexture1 = createColorTexture();
var colorTexture2 = createColorTexture();

// The depth data needs to be stored in a buffer, render buffer is good one, since we do not need to sample it. Just used by OpenGL when render to
// 3 texture render targets
var depthRenderbuffer = gl.createRenderbuffer();
gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderbuffer);
gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1024, 1024);

// framebuffer to attach both textures and depth renderbuffer
var framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
// specify 3 textures as render targets
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorTexture0, 0);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, colorTexture1, 0);
gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, colorTexture2, 0);
// specify the depth renderbuffer for the framebuffer in order to store depth data during rendering
gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderbuffer);

// Specifies a list of color buffers to be drawn into
dbExt.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2]);



var screenProgram = gl.createProgram();
var screenShader = new Shader(screenProgram, 'shader/screen.vert', 'shader/screen.frag');
gl.useProgram(screenProgram);
screenShader.bindAttributes(screenProgram);
screenShader.bindUniforms(screenProgram);

var screenVAO = vaoExt.createVertexArrayOES();
vaoExt.bindVertexArrayOES(screenVAO);

// Screen attributes buffer
var screenVB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, screenVB);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1.0, -1.0,
                                                   1.0, -1.0,
                                                   1.0,  1.0,
                                                   1.0,  1.0,
                                                  -1.0,  1.0,
                                                  -1.0, -1.0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(screenShader.attributes.a_Vertex);
gl.vertexAttribPointer(screenShader.attributes.a_Vertex, 2, gl.FLOAT, false, 0, 0);
// texture coordinate buffer
var screenTB = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, screenTB);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0,
                                                 1, 0,
                                                 1, 1,
                                                 1, 1,
                                                 0, 1,
                                                 0, 0]), gl.STATIC_DRAW);
gl.enableVertexAttribArray(screenShader.attributes.a_TexCoord);
gl.vertexAttribPointer(screenShader.attributes.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

vaoExt.bindVertexArrayOES(null);







var cube = new CubeGeometry();
var projectionMatrix = mat4.create();
var modelMatrix = mat4.create();
var viewMatrix = mat4.create();
var modelViewMatrix = mat4.create();
var cameraPosition = vec3.fromValues(0, 0, 2);

var mrtProgram = gl.createProgram();
var mrtShader = new Shader(mrtProgram, 'shader/mrt.vert', 'shader/mrt.frag');
gl.useProgram(mrtProgram);
mrtShader.bindAttributes(mrtProgram);
mrtShader.bindUniforms(mrtProgram);

var mrtVAO = vaoExt.createVertexArrayOES();
vaoExt.bindVertexArrayOES(mrtVAO);

var vb = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vb);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);
gl.enableVertexAttribArray(mrtShader.attributes.a_Vertex);
gl.vertexAttribPointer(mrtShader.attributes.a_Vertex, 3, gl.FLOAT, false, 0, 0);
var ib = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);

vaoExt.bindVertexArrayOES(null);


// perspective
mat4.perspective(projectionMatrix, Math.PI/3, canvas.width/canvas.height, 0.1, 100);
// pass to shader
gl.uniformMatrix4fv(mrtShader.uniforms.u_ProjectionMatrix, false, projectionMatrix);

function render(){
  stats.begin();

  update();

  // bind framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.viewport(0, 0, 1024, 1024);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // MRT
  gl.useProgram(mrtProgram);

  // pass model view matrix to the shader
  gl.uniformMatrix4fv(mrtShader.uniforms.u_ModelMatrix, false, modelMatrix);
  gl.uniformMatrix4fv(mrtShader.uniforms.u_ViewMatrix, false, viewMatrix);
  gl.uniformMatrix4fv(mrtShader.uniforms.u_ModelViewMatrix, false, modelViewMatrix);

  // using vertex array object to store reference to a vertex buffer, so no need to do these manual binding and pointer thing anymore.
  // bind buffers and enable attributes
  // gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  // gl.vertexAttribPointer(mrtShader.attributes.a_Vertex, 3, gl.FLOAT, false, 0, 0);
  // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);

  // draw to multiple render target
  vaoExt.bindVertexArrayOES(mrtVAO);
  gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
  vaoExt.bindVertexArrayOES(null);


  // use default frame buffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // draw rectangle, sample 3 textures
  gl.useProgram(screenProgram);

  // Set each texture unit to use a particular texture.
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, colorTexture0);
  gl.uniform1i(screenShader.uniforms.texture0, 0); // set which texture units to render with.
  gl.activeTexture(gl.TEXTURE0+1);
  gl.bindTexture(gl.TEXTURE_2D, colorTexture1);
  gl.uniform1i(screenShader.uniforms.texture1, 1); // set which texture units to render with.
  gl.activeTexture(gl.TEXTURE0+2);
  gl.bindTexture(gl.TEXTURE_2D, colorTexture2);
  gl.uniform1i(screenShader.uniforms.texture2, 2); // set which texture units to render with.

  // using vertex array object to store reference to a vertex buffer, so no need to do these manual binding and pointer thing anymore.
  // bind buffer and enable attributes
  // gl.bindBuffer(gl.ARRAY_BUFFER, screenVB);
  // gl.vertexAttribPointer(screenShader.attributes.a_Vertex, 2, gl.FLOAT, false, 0, 0);
  // gl.bindBuffer(gl.ARRAY_BUFFER, screenTB);
  // gl.vertexAttribPointer(screenShader.attributes.a_TexCoord, 2, gl.FLOAT, false, 0, 0);

  // draw to screen
  vaoExt.bindVertexArrayOES(screenVAO);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  vaoExt.bindVertexArrayOES(null);

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






function createColorTexture(){
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1024, 1024, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  return texture;
}


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