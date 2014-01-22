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
uniform sampler2D textures[6];
uniform float textureReady[6];

// uniform Material u_Material;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Color;

vec3 getNormal(){
  float ONE_OVER_TEX_WIDTH = 1.0/1024.0;
  float hg = texture2D(textures[2], v_TexCoord).r;
  float hr = texture2D(textures[2], vec2(v_TexCoord.x+ONE_OVER_TEX_WIDTH, v_TexCoord.y)).r;
  float ha = texture2D(textures[2], vec2(v_TexCoord.x, v_TexCoord.y+ONE_OVER_TEX_WIDTH)).r;

  float dx = (hg-ha)*5.0;
  float dy = (hg-hr)*5.0;

  float scale = 1.0/sqrt(pow(dx, 2.0) + pow(dy, 2.0) + 1.0);

  return vec3(dx, dy, 1.0) * scale;
}

vec3 getNormal2(){
  float ONE_OVER_TEX_WIDTH = 1.0/1024.0;
  float hg = texture2D(textures[2], v_TexCoord).r;
  float hr = texture2D(textures[2], vec2(v_TexCoord.x+ONE_OVER_TEX_WIDTH, v_TexCoord.y)).r;
  float ha = texture2D(textures[2], vec2(v_TexCoord.x, v_TexCoord.y+ONE_OVER_TEX_WIDTH)).r;

  vec3 vr = vec3(1.0, 0.0, (hr-hg)*5.0);
  vec3 va = vec3(0.0, 1.0, (ha-hg)*5.0);
  vec3 n = normalize(cross(vr, va));

  return n;
}

void main() {
  // albedo + roughness
  gl_FragData[0] = vec4(
    texture2D(textures[0], v_TexCoord).rgb*textureReady[0],
    roughness*0.1 + texture2D(textures[4], v_TexCoord).r*textureReady[4]
  );
  // normal
  gl_FragData[1] = vec4((v_Normal+1.0)/2.0, 1.0) + texture2D(textures[1], v_TexCoord)*textureReady[1];
  // specular
  gl_FragData[2] = albedoColor + texture2D(textures[3], v_TexCoord)*textureReady[3];
  // roughness
  // gl_FragData[3] = vec4(roughness, 1.0) + texture2D(textures[4], v_TexCoord)*textureReady[4];

}