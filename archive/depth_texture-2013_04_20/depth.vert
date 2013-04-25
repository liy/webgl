attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec4 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

const mat4 depthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);


void main(){
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = u_ProjectionMatrix * v_Position;
  v_TexCoord = a_TexCoord;
}