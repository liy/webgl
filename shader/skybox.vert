precision mediump float;

attribute vec3 a_Vertex;
attribute vec3 a_Color;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ModelViewMatrix;

varying vec3 v_TexCoord;
varying vec3 v_Color;

void main(){
  // when rendering sky box, translation must not be applied, I simply dropped last column of ModelView matrix.
  // TODO: Might be better to this process in JavaScript, like this: skyBox.modelViewMatrix[12] = skyBox.modelViewMatrix[13] = skyBox.modelViewMatrix[14] = 0;
  vec4 position = u_ProjectionMatrix * mat4(mat3(u_ModelViewMatrix)) * vec4(a_Vertex, 1.0);
  // gl_Position is clip space, it will be divided by its w automatically after vertex shader and before rastering.
  // After the w division, the vertex z will be always 1, which means it is always projected onto the farthest point in NDC.
  gl_Position = position.xyww;
  v_TexCoord = a_Vertex;

  v_Color = a_Color;
}