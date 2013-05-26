precision mediump float;

uniform sampler2D u_Sampler[3];

uniform bool u_UseColor;

varying vec4 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec4 v_Color;

void main(){
  gl_FragColor = texture2D(u_Sampler[2], v_TexCoord);
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}