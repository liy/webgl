precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec3 a_Tangent;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;


uniform sampler2D bumpTexture;


uniform vec3 u_LightPosition;
uniform mat4 u_LightMatrix;

varying vec3 v_LightDirTangentSpace;
varying vec3 v_viewDirTangentSpace;

void main(){
  v_Vertex = u_ViewMatrix * u_ModelMatrix * vec4(a_Vertex, 1.0);
  gl_Position = u_ProjectionMatrix * v_Vertex;
  v_Normal = u_NormalMatrix * a_Normal;
  v_TexCoord = a_TexCoord;

  // tangent space related calculation
  vec3 N = normalize(v_Normal);
  vec3 T = normalize(a_Tangent);
  T = normalize(T - dot(T, N) * N);
  vec3 B = cross(T, N);
  mat3 TBN;
  // first, second and third column
  TBN[0] = vec3(T.x, T.y, T.z);
  TBN[1] = vec3(B.x, B.y, B.z);
  TBN[2] = vec3(N.x, N.y, N.z);

  // light's world location
  vec4 lightPosition = u_LightMatrix * vec4(u_LightPosition, 1.0);
  vec3 lightDirWorldSpace = normalize(lightPosition.xyz - (u_ModelMatrix * vec4(a_Vertex, 1.0)).xyz);

  // light tangent space direction
  v_LightDirTangentSpace = TBN * lightDirWorldSpace;

  // view's tangent space direction
  v_viewDirTangentSpace  = TBN * -v_Vertex.xyz;
}