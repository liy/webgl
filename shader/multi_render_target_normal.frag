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
uniform float delta;

/**
 albedo    0
 normal    1
 bump      2
 specular  3
 roughness 4
 shininess 5
 */
uniform sampler2D albedoTexture;
uniform sampler2D specularTexture;
uniform sampler2D normalTexture;
uniform sampler2D roughnessTexture;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec4 v_Color;

vec3 getNormal(){
  // convert normal texture value from range [0, 1] to [-1, 1], ready for processing
  vec3 n = texture2D(normalTexture, v_TexCoord).xyz * 2.0 - 1.0;

  vec3 N = normalize(v_Normal);
  vec3 T = normalize(v_Tangent.xyz);
  vec3 B = normalize(v_Bitangent);
  // transform from tangent space into world space
  // T,B,N corresponds to first, second and third column?
  mat3 TBN = mat3(T, B, N);

  // encode back to [0, 1] range
  return (TBN*n + 1.0) * 0.5;
}

void main() {
  gl_FragData[0] = vec4(texture2D(albedoTexture, v_TexCoord));
  gl_FragData[1] = vec4(getNormal(), 1.0);
  // gl_FragData[1] = vec4(v_Normal, 1.0);
  gl_FragData[2] = texture2D(specularTexture, v_TexCoord);
}