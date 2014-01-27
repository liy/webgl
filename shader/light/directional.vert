precision mediump float;

attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

varying vec2 v_TexCoord;
varying vec2 v_Position;

// For restore eye space position.
// The idea is having the ray from the eye position(origin), point towards fragments.
// Once we get the eye position z in fragment shader, simply multiply the v_EyeRay by
// the amount recovers the original eye space position x, y z.
varying vec3 v_EyeRay;

/**
 * final composition
 */
void main(){
  gl_Position = vec4(a_Vertex, 0.0, 1.0);
  v_TexCoord = a_TexCoord;
  v_Position = a_Vertex;

  // the v_TexCoord in the range of [0, 1].
  // We need to make the ray's x and y to be in the range of [-1, 1], so it covers the
  // whole screen.
  v_EyeRay = vec3(2.0*v_TexCoord - 1.0, -1.0);
}