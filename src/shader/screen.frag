precision mediump float;

uniform sampler2D compositeBuffer;

varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(compositeBuffer, v_TexCoord);
}