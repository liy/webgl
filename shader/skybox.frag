precision mediump float;

varying vec3 v_TexCoord;

uniform samplerCube cubeMapTexture;

void main(){
  gl_FragColor = textureCube(cubeMapTexture, v_TexCoord);
}