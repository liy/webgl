precision mediump float;

varying vec3 v_TexCoord;
varying vec3 v_Color;

uniform samplerCube cubeMapTexture;

void main(){
  gl_FragColor = textureCube(cubeMapTexture, v_TexCoord);
  // gl_FragColor = vec4(1, 0, 0, 1);
}