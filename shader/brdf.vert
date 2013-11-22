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
  v_Tangent = a_Tangent;
  v_Bitangent = a_Bitangent;




















  // // tangent space related calculation
  // vec3 N = normalize(v_Normal);
  // vec3 T = normalize(u_ModelMatrixInverseTranspose * a_Tangent.xyz);
  // T = normalize(T - dot(T, N) * N);
  // // vec3 B = normalize(cross(T, N) * a_Tangent.w);
  // vec3 B = a_Bitangent * a_Tangent.w;
  // // T,B,N corresponds to first, second and third column?
  // mat3 TBN = mat3(T, B, N);

  // // direction from vertex to light source
  // vec3 lightDirWorldSpace = normalize(u_LightPosition - vertexWorldPosition.xyz);
  // // direction from vertex to camera
  // vec3 cameraDirWorldSpace = normalize(u_CameraPosition - vertexWorldPosition.xyz);

  // // // light tangent space direction
  // // v_LightDirTangentSpace = TBN * lightDirWorldSpace;

  // // // view's tangent space direction
  // // v_viewDirTangentSpace  = TBN * cameraDirWorldSpace;

  // // light tangent space direction
  // v_LightDirTangentSpace = vec3( dot(T, lightDirWorldSpace),
  //         dot(B, lightDirWorldSpace),
  //         dot(N, lightDirWorldSpace));

  // // view's tangent space direction
  // v_viewDirTangentSpace = vec3( dot(T, cameraDirWorldSpace),
  //         dot(B, cameraDirWorldSpace),
  //         dot(N, cameraDirWorldSpace));

  // v_halfDirTangentSpace = v_LightDirTangentSpace + v_viewDirTangentSpace;


  // v_LightDirEyeSpace = normalize(u_ViewMatrix * vec4(lightDirWorldSpace, 1.0));
}