precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_TexCoord;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_TexCoord;

void main(){
  vec4 position = u_ProjectionMatrix * u_ModelMatrix * vec4(a_Vertex, 1.0);
  gl_Position = position.xyww;
  // v_TexCoord = a_TexCoord;
  v_TexCoord = a_Vertex;
}