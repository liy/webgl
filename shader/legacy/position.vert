attribute vec3 a_Vertex;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelMatrix;

varying vec4 v_EyeSpacePosition;
varying vec4 v_WorldPosition;
varying vec4 v_ClipSpace;

void main(){
  v_WorldPosition = u_ModelMatrix * vec4(a_Vertex, 1.0);
  v_EyeSpacePosition = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_ClipSpace = u_ProjectionMatrix * v_EyeSpacePosition;
  gl_Position = v_ClipSpace;
}