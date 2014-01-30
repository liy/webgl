attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec4 v_Position;
varying vec2 v_TexCoord;

void main(){
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_TexCoord = a_TexCoord;

  gl_Position = u_ProjectionMatrix * v_Position;
}