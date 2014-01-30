precision mediump float;

uniform sampler2D texture;

varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(texture, v_TexCoord);
}