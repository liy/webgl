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
window.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

var near = 1.8;
var far = 9;
var radian = Math.PI/3;
var aspectRatio = canvas.width/canvas.height;
var camera = new PerspectiveCamera(radian, aspectRatio, near, far);
camera.update();

var hh = Math.tan(radian/2) * near;
var hw = aspectRatio * hh;

var data = [
  -hw, -hh, -near,  1, 0, 0,
   hw, -hh, -near,  0, 1, 0,
   hw,  hh, -near,  0, 0, 1,
   hw,  hh, -near,  0, 0, 1,
  -hw,  hh, -near,  1, 0, 1,
  -hw, -hh, -near,  1, 0, 0
];

var program = gl.createProgram();
var shader = new Shader(program, 'shader/test.vert', 'shader/test.frag');
gl.useProgram(program);
shader.locateAttributes(program);
shader.locateUniforms(program);

var buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

gl.enableVertexAttribArray(shader.attributes.a_Vertex);
gl.vertexAttribPointer(shader.attributes.a_Vertex, 3, gl.FLOAT, false, 24, 0);
gl.enableVertexAttribArray(shader.attributes.a_Color);
gl.vertexAttribPointer(shader.attributes.a_Color, 3, gl.FLOAT, false, 24, 12);

gl.clearColor(0.0, 0.0, 0.0, 1.0);

console.log(shader.attributes, shader.uniforms);

function render(){
  stats.begin();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(shader.uniforms['u_ProjectionMatrix'], false, camera.projectionMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_ViewMatrix'], false, camera.viewMatrix);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  stats.end();
  requestAnimFrame(render);
}
render();