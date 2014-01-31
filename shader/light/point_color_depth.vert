precision mediump float;

attribute vec3 a_Vertex;

// set by camera
uniform mat4 u_ProjectionMatrix;

uniform mat4 u_ModelViewMatrix;

// For restore eye space position from depth.
varying vec4 v_ViewSpacePosition;
// The clip space position of the light volume. Use it to find out the texture coordinate.
varying vec4 v_ClipSpacePosition;

void main(){
  // eye space position of the vertex
  v_ViewSpacePosition = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_ClipSpacePosition = u_ProjectionMatrix * v_ViewSpacePosition;
  gl_Position = v_ClipSpacePosition;
}