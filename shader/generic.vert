precision mediump float;

// in the range of 0 to 1
attribute vec3 a_Vertex;

void main(){
  gl_Position = vec4(a_Vertex, 1.0);
}