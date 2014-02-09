// needs to specify this line in order to use multiple render targets: gl_FragData[]
#extension GL_EXT_draw_buffers : require

precision mediump float;

const float gamma = 2.2;

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
uniform sampler2D bumpTexture;
uniform sampler2D roughnessTexture;

uniform float textureDeltaX;
uniform float textureDeltaY;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec4 v_Color;

vec4 toLinear(vec4 color){
  return pow(color, vec4(gamma));
}

vec4 toRGB(vec4 color){
  return pow(color, vec4(1.0/gamma));
}



// vec3 getNormal2(){
//   float hg = texture2D(bumpTexture, v_TexCoord).r;
//   float hr = texture2D(bumpTexture, vec2(v_TexCoord.x+textureDeltaX, v_TexCoord.y)).r;
//   float ha = texture2D(bumpTexture, vec2(v_TexCoord.x, v_TexCoord.y+textureDeltaY)).r;

//   float dx = (hg-ha)*10.0;
//   float dy = (hg-hr)*10.0;

//   float scale = 1.0/sqrt(pow(dx, 2.0) + pow(dy, 2.0) + 1.0);

//   vec3 normal = vec3(dx, dy, 1.0) * scale;

//   vec3 N = normalize(v_Normal);
//   vec3 T = normalize(v_Tangent);
//   vec3 B = normalize(v_Bitangent);
//   mat3 TBN = mat3(T, B, N);

//   return (normalize(TBN*normal) + 1.0) * 0.5;
// }

vec3 getNormal(){
  float hg = texture2D(bumpTexture, v_TexCoord).r;
  float hr = texture2D(bumpTexture, vec2(v_TexCoord.x+textureDeltaX, v_TexCoord.y)).r;
  float ha = texture2D(bumpTexture, vec2(v_TexCoord.x, v_TexCoord.y+textureDeltaY)).r;

  vec3 vr = vec3(1.0, 0.0, (hr-hg)*20.0);
  vec3 va = vec3(0.0, 1.0, (ha-hg)*20.0);
  vec3 normal = cross(vr, va);

  vec3 N = normalize(v_Normal);
  vec3 T = normalize(v_Tangent);
  vec3 B = normalize(v_Bitangent);
  mat3 TBN = mat3(T, B, N);

  return (normalize(TBN*normal) + 1.0) * 0.5;
}

void main() {
  // gl_FragData[0] = toLinear(texture2D(albedoTexture, v_TexCoord));
  // // gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
  // gl_FragData[1] = vec4(getNormal(), 1.0);
  // // gl_FragData[1] = vec4((normalize(v_Normal)+1.0)*0.5, 1.0);
  // gl_FragData[2] = toLinear(texture2D(specularTexture, v_TexCoord));

  gl_FragData[0] = texture2D(albedoTexture, v_TexCoord);
  // gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
  gl_FragData[1] = vec4(getNormal(), 1.0);
  // gl_FragData[1] = vec4((normalize(v_Normal)+1.0)*0.5, 1.0);
  gl_FragData[2] = texture2D(specularTexture, v_TexCoord);
}