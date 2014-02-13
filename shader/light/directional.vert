precision highp float;

// vertex position is in NDC space.
attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

uniform float u_FieldOfView;
uniform float u_AspectRatio;
uniform float u_Near;
uniform float u_Far;

varying vec2 v_TexCoord;

// The eye ray points to 4 corners of the full screen quad.
varying vec3 v_EyeRay;

void main(){
  gl_Position = vec4(a_Vertex, -1.0, 1.0);
  v_TexCoord = a_TexCoord;

  // hh is the half height of the far plane.
  // u_AspectRatio is near (or far) plane's width / height. Times hh gives half width.
  float hh = tan(u_FieldOfView/2.0) * u_Far;
  float hw = u_AspectRatio * hh;
  // a_Vertex in NDC can be scaled by half width and half height gives you the proper x and y value
  // of the far plane in eye space. z value of course will be the -far.
  // Now the eye ray is extended, pointed to the far plane's corners.
  v_EyeRay = vec3(a_Vertex * vec2(hw, hh), -u_Far);
}