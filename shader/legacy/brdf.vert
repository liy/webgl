precision highp float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec4 a_Tangent;
attribute vec3 a_Bitangent;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ModelMatrixInverse;
uniform mat3 u_ModelMatrixInverseTranspose;
uniform mat3 u_ModelViewMatrixInverseTranspose;

uniform vec3 u_LightPosition;
uniform vec3 u_CameraPosition;

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Tangent;
varying vec3 v_Bitangent;

void main(){
  v_Vertex = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  gl_Position = u_ProjectionMatrix * v_Vertex;
  v_Normal = u_ModelViewMatrixInverseTranspose * a_Normal;
  v_TexCoord = a_TexCoord;
  v_Tangent = vec4(normalize(u_ModelViewMatrixInverseTranspose * a_Tangent.xyz), 1.0);
  v_Bitangent = normalize(u_ModelViewMatrixInverseTranspose * a_Bitangent);
}