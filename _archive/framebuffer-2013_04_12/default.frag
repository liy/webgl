precision mediump float;

// struct Light {
//   vec3 position;
//   vec4 ambient;
//   vec4 diffuse;
//   vec4 specular;

//   float attenuationConstant;
//   float attenuationLinear;
//   float attenuationQuadratic;

//   // spot light only
//   vec3 direction;
//   float cosOuter;
//   // outer cos - inner cos
//   float cosFalloff;
// };

// // material
// struct Material {
//   vec4 ambient;
//   vec4 diffuse;
//   vec4 specular;
//   vec4 emission;
//   float shininess;
// };

varying vec4 v_Position;
varying vec2 v_TexCoord;

uniform sampler2D sampler;

void main(){
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor = texture2D(sampler, v_TexCoord);
}
