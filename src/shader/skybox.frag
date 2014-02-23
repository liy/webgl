precision mediump float;

varying vec3 v_TexCoord;

uniform samplerCube u_CubeMapTexture;

void main(){
  gl_FragColor = textureCube(u_CubeMapTexture, v_TexCoord);
  // gl_FragColor = vec4(1, 0, 0, 1);
}