// needs to specify this line in order to use multiple render targets: gl_FragData[]
#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Color;

void main() {
  gl_FragData[0] = vec4(0.0, 0.2, 0.0, 1.0);
  gl_FragData[1] = vec4((v_Normal+1.0)/2.0, 1.0);
}