attribute vec3 a_Vertex;
attribute vec2 a_TexCoord;
attribute vec3 a_Normal;
attribute vec4 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelViewMatrix;
uniform mat3 u_NormalMatrix;

varying vec4 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec4 v_Color;








// shadow map related
const mat4 depthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
uniform mat4 u_ModelMatrix;
uniform mat4 u_LightViewMatrix;
uniform mat4 u_LightProjectionMatrix;
varying vec4 v_ShadowPosition;

void setupShadow(vec4 worldPosition) {
   v_ShadowPosition = depthScaleMatrix * u_LightProjectionMatrix * u_LightViewMatrix * worldPosition;
}


void main(){
  // FIXME: separate model view matrix into separate matrix.
  v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  v_Normal = u_NormalMatrix * a_Normal;
  v_TexCoord = a_TexCoord;
  v_Color = a_Color;

  gl_PointSize = 10.0;
  gl_Position = u_ProjectionMatrix * v_Position;


  // shadow related
  vec4 worldPosition =  u_ModelMatrix * vec4(a_Vertex, 1.0);
  setupShadow(worldPosition);
}