attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec4 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;

void main(){
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_Normal = u_NormalMatrix * a_Normal;
  v_TexCoord = a_TexCoord;
  gl_Position = u_ProjectionMatrix * v_Position; 
}