precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

varying vec3 v_Color;

/**
 * final composition
 */
void main(){
  vec4 clipSpace = u_ProjectionMatrix * vec4(a_Vertex, 1.0);
  gl_Position = vec4(clipSpace.xy/clipSpace.w, 0.0, 1.0);
  // gl_Position = vec4(a_Vertex, 1.0);
  v_Color = a_Color;
}