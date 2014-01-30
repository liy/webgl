precision mediump float;

attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;

void main(){
  gl_PointSize = 2.0;
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
}