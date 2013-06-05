attribute vec3 a_Vertex;
attribute vec4 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec4 v_Color;
varying vec4 v_FragCoord;
varying vec4 v_Position;

void main(){
  v_Color = a_Color;
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_FragCoord = u_ProjectionMatrix * v_Position;
  gl_Position = v_FragCoord;
}