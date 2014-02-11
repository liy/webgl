precision mediump float;

uniform sampler2D compositeTarget;

varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(compositeTarget, v_TexCoord);
}