precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Normal;
attribute vec2 a_TexCoord;
attribute vec4 a_Tangent;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat3 u_ModelMatrixInverseTranspose;

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;


uniform sampler2D bumpTexture;


uniform vec3 u_LightPosition;

uniform vec3 u_CameraPosition;

varying vec3 v_LightDirTangentSpace;
varying vec3 v_viewDirTangentSpace;

void main(){
  vec4 vertexWorldPosition = u_ModelMatrix * vec4(a_Vertex, 1.0);
  v_Vertex = u_ViewMatrix * vertexWorldPosition;
  gl_Position = u_ProjectionMatrix * v_Vertex;
  v_Normal = u_ModelMatrixInverseTranspose * a_Normal;
  v_TexCoord = a_TexCoord;

  // tangent space related calculation
  vec3 N = normalize(v_Normal);
  vec3 T = normalize(u_ModelMatrixInverseTranspose * a_Tangent.xyz);
  T = normalize(T - dot(T, N) * N);
  vec3 B = cross(T, N) * a_Tangent.w;
  // T,B,N corresponds to first, second and third column?
  mat3 TBN = mat3(T, B, N);

  // direction from vertex to light source
  vec3 lightDirWorldSpace = normalize(u_LightPosition - vertexWorldPosition.xyz);
  // direction from vertex to camera
  vec3 cameraDirWorldSpace = normalize(u_CameraPosition - vertexWorldPosition.xyz);

  // // light tangent space direction
  // v_LightDirTangentSpace = TBN * lightDirWorldSpace;

  // // view's tangent space direction
  // v_viewDirTangentSpace  = TBN * cameraDirWorldSpace;

  // light tangent space direction
  v_LightDirTangentSpace = vec3( dot(T, lightDirWorldSpace),
          dot(B, lightDirWorldSpace),
          dot(N, lightDirWorldSpace));

  // view's tangent space direction
  v_viewDirTangentSpace  = vec3( dot(T, cameraDirWorldSpace),
          dot(B, cameraDirWorldSpace),
          dot(N, cameraDirWorldSpace));
}