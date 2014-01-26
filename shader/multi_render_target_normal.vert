precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec3 a_Tangent;
attribute vec3 a_Bitangent;
attribute vec4 a_Color;

// set by camera
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ViewMatrix;

// set by mesh
uniform mat4 u_ModelMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_ModelViewMatrixInverseTranspose;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec4 v_Color;

void main(){
  gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_TexCoord = a_TexCoord;

  v_Normal = u_ModelViewMatrixInverseTranspose * a_Normal;
  v_Tangent = u_ModelViewMatrixInverseTranspose * a_Tangent;
  v_Bitangent = u_ModelViewMatrixInverseTranspose * a_Bitangent;
  v_Color = a_Color;
}