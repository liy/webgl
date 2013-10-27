precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

void main(){
  v_Vertex = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = u_ProjectionMatrix * v_Vertex;
  v_Normal = u_NormalMatrix * a_Normal;
  v_TexCoord = a_TexCoord;

  // gl_PointSize = 2.0;
}