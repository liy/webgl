precision highp float;

// vertex position is in NDC space.
attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

uniform float u_FieldOfView;
uniform float u_Near;
uniform float u_AspectRatio;

varying vec2 v_TexCoord;

// The eye ray points to 4 corners of the full screen quad.
// It will be interpolated, if you scale all its components by its -z and multiply
// the depth value(negative) from the geometry buffer, it will give you the real
// eye space position.
varying vec3 v_EyeRay;

void main(){
  gl_Position = vec4(a_Vertex, -1.0, 1.0);
  v_TexCoord = a_TexCoord;

  // Imagine a plane always sits at the near plane, and covers the whole field of view.
  // hh is the half height of the near plane.
  // u_AspectRatio is near plane's width / near plane's height. Times hh gives half width.
  float hh = tan(u_FieldOfView/2.0) * u_Near;
  float hw = u_AspectRatio * hh;
  // a_Vertex in NDC can be scaled by half width and half height gives you the proper x and y value
  // of the near plane in eye space. z value of course will be the -near.
  v_EyeRay = vec3(a_Vertex * vec2(hw, hh), -u_Near);
}