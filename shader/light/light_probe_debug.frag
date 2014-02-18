precision mediump float;

const float gamma = 2.2;

uniform samplerCube cubeMapTexture;

uniform mat4 u_InvViewMatrix;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Position;


void main() {

  vec3 n = normalize(v_Normal);
  vec3 v = -normalize(v_Position.xyz);
  float vdotn = dot(v, n);

  // note that, the first parameter of reflect function is incoming direction, which is from SOURCE TOWARDS SURFACE!
  vec3 r = normalize(reflect(v_Position.xyz, v_Normal));
  // r = 2.0*vdotn*n - v;

  r = vec3(u_InvViewMatrix * vec4(r, 0.0));


  // gl_FragColor = (textureCube(cubeMapTexture, r));
  gl_FragColor = vec4(1,0,0,1);
}