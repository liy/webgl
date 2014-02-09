precision mediump float;

attribute vec3 a_Vertex;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

void main(){
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
}