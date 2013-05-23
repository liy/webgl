attribute vec3 a_Vertex;
attribute vec3 a_Normal;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec3 v_Normal;

void main(){
  v_Normal = u_NormalMatrix * a_Normal;

  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
}