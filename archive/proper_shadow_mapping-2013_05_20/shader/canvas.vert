attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;
attribute vec4 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec2 v_TexCoord;
varying vec4 v_Color;

void main(){
  v_Color = a_Color;

  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_TexCoord = a_TexCoord;
}