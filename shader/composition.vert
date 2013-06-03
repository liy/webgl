attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

// Normalized already, [-1, 1], can be directly used for NDC's x and y
varying vec2 v_Position;
varying vec2 v_TexCoord;

void main(){
  v_Position = a_Vertex;
  gl_Position = vec4(v_Position, 0.0, 1.0);
  v_TexCoord = a_TexCoord;
}