precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_TexCoord;
varying vec3 v_Color;

void main(){
  vec4 position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = position.xyww;
  v_TexCoord = a_Vertex;

  v_Color = a_Color;
}