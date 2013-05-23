precision mediump float;

uniform sampler2D u_Sampler;

uniform bool u_UseColor;

varying vec4 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec4 v_Color;

void main(){
  vec4 color = texture2D(u_Sampler, v_TexCoord);
  if(u_UseColor)
    color = v_Color;

  gl_FragColor = color;
}