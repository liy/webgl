precision mediump float;

attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;

/**
 * final composition
 */
void main(){
  gl_Position = vec4(a_Vertex, 0.0, 1.0);
  v_TexCoord = a_TexCoord;
}