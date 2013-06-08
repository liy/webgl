attribute vec3 a_Vertex;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;

// gl_Position, clip space position
varying vec4 v_ClipSpacePosition;

void main(){
  v_ClipSpacePosition = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = v_ClipSpacePosition;
}