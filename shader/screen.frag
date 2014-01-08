precision mediump float;

uniform sampler2D texture0;
uniform sampler2D texture1;
uniform sampler2D texture2;

varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(texture2, v_TexCoord);
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}