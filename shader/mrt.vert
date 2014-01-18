precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec4 a_Color;

// set by camera
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

// set by mesh
uniform mat4 u_ModelMatrix;
uniform mat3 u_NormalMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Color;

void main(){
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);

  v_Normal = u_NormalMatrix*a_Normal;
  v_TexCoord = a_TexCoord;
  v_Color = a_Color;
}