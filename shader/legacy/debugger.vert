attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec2 v_TexCoord;

void main(){
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_TexCoord = a_TexCoord;
}