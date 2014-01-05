#extension GL_EXT_draw_buffers : require
precision mediump float;
void main() {
  gl_FragData[0] = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragData[1] = vec4(0.0, 1.0, 0.0, 1.0);
  // gl_FragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
  // gl_FragData[3] = vec4(1.0, 1.0, 1.0, 1.0);
}