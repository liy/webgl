precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec3 a_Tangent;
attribute vec3 a_Bitangent;
attribute vec3 a_Color;

// set by camera
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

// set by mesh
uniform mat4 u_ModelMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec3 v_Color;

// encode eye space position
varying vec4 v_Position;

void main(){
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = u_ProjectionMatrix * v_Position;
  v_TexCoord = a_TexCoord;

  v_Normal = u_NormalMatrix * a_Normal;
  v_Tangent = u_NormalMatrix * a_Tangent;
  v_Bitangent = u_NormalMatrix * a_Bitangent;
  v_Color = a_Color;
}