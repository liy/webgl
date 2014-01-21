// needs to specify this line in order to use multiple render targets: gl_FragData[]
#extension GL_EXT_draw_buffers : require

precision mediump float;

// struct Material {
//   vec4 ambientColor;
//   vec4 albedoColor;
//   vec4 specularColor;
//   vec4 emissionColor;
//   float roughness;

//   sampler2D ambientTexture;
//   sampler2D albedoTexture;
//   sampler2D specularTexture;
//   sampler2D roughnessTexture;
// };

uniform vec4 ambientColor;
uniform vec4 albedoColor;
uniform vec4 specularColor;
uniform vec4 emissionColor;
uniform float roughness;

/**
 * 
 */
uniform sampler2D textures[6];

// uniform Material u_Material;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Color;

void main() {
  gl_FragData[0] = texture2D(textures[0], v_TexCoord);
  // gl_FragData[1] = vec4((v_Normal+1.0)/2.0, 1.0);
  gl_FragData[1] = vec4((v_Normal+1.0)/2.0, 1.0);
}