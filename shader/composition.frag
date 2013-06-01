precision mediump float;

uniform sampler2D u_Sampler[3];

varying vec4 v_Position;
varying vec2 v_TexCoord;

void main(){
  gl_FragColor = texture2D(u_Sampler[2], v_TexCoord) * texture2D(u_Sampler[1], v_TexCoord) * texture2D(u_Sampler[0], v_TexCoord);
}