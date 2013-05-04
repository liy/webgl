attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;
attribute vec4 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

// varying vec4 v_Position;
varying vec2 v_TexCoord;
// varying vec3 v_Normal;
// varying vec4 v_Color;

void main(){
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_TexCoord = a_TexCoord;
}