precision highp float;

const float pi = 3.1415926;

// vertex position is in NDC space.
attribute vec2 a_Vertex;
attribute vec2 a_TexCoord;

uniform float u_FieldOfView;
uniform float u_Near;
uniform float u_AspectRatio;

varying vec2 v_TexCoord;

// This is used for reconstruct the real eye space position of the fragment.
varying vec3 v_EyeRay;


/*
var hh = Math.tan(radian/2) * near;
var hw = aspectRatio * hh;

var data = [
  -hw, -hh, -near,
   hw, -hh, -near,
   hw,  hh, -near,
   hw,  hh, -near,
  -hw,  hh, -near,
  -hw, -hh, -near
  ]
 */



/*
-1.0, -1.0, 0, 0,
 1.0, -1.0, 1, 0,
 1.0,  1.0, 1, 1,
 1.0,  1.0, 1, 1,
-1.0,  1.0, 0, 1,
-1.0, -1.0, 0, 0
 */

/**
 * final composition
 */
void main(){
  gl_Position = vec4(a_Vertex, 0.0, 1.0);
  v_TexCoord = a_TexCoord;

  // Imagine a plane always sits at the near plane, and covers the whole field of view.
  float hh = tan(u_FieldOfView/2.0) * u_Near;
  vec2 scale = vec2(u_AspectRatio * hh, hh);
  // v_EyeRay = vec3(a_Vertex * scale, -u_Near);
  v_EyeRay = vec3(a_Vertex * scale, -1.0);
}