// needs to specify this line in order to use multiple render targets: gl_FragData[]
#extension GL_EXT_draw_buffers : require

precision mediump float;

varying vec4 v_Position;

void main() {
  gl_FragData[0] = vec4(0.0, 0.2, 0.0, 1.0);
  gl_FragData[1] = vec4(0.0, 0.2, 0.0, 1.0);
  gl_FragData[2] = vec4(0.0, 0.8, 0.0, 1.0);
}