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
uniform float textureDeltaX;
uniform float textureDeltaY; 

// uniform Material u_Material;

varying vec4 v_EyeSpacePosition;
varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec4 v_Color;

vec3 getNormal2(){
  float hg = texture2D(textures[2], v_TexCoord).r;
  float hr = texture2D(textures[2], vec2(v_TexCoord.x+textureDeltaX, v_TexCoord.y)).r;
  float ha = texture2D(textures[2], vec2(v_TexCoord.x, v_TexCoord.y+textureDeltaY)).r;

  float dx = (hg-ha)*2.0;
  float dy = (hg-hr)*2.0;

  float scale = 1.0/sqrt(pow(dx, 2.0) + pow(dy, 2.0) + 1.0);

  vec3 normal = vec3(dx, dy, 1.0) * scale;

  vec3 N = normalize(v_Normal);
  vec3 T = normalize(v_Tangent);
  vec3 B = normalize(v_Bitangent);
  mat3 TBN = mat3(T, B, N);

  return normalize(TBN*normal);
}

vec3 getNormal(){
  float hg = texture2D(textures[2], v_TexCoord).r;
  float hr = texture2D(textures[2], vec2(v_TexCoord.x+textureDeltaX, v_TexCoord.y)).r;
  float ha = texture2D(textures[2], vec2(v_TexCoord.x, v_TexCoord.y+textureDeltaY)).r;

  vec3 vr = vec3(1.0, 0.0, (hr-hg)*5.0);
  vec3 va = vec3(0.0, 1.0, (ha-hg)*5.0);
  vec3 normal = cross(vr, va);

  vec3 N = normalize(v_Normal);
  vec3 T = normalize(v_Tangent);
  vec3 B = normalize(v_Bitangent);
  mat3 TBN = mat3(T, B, N);

  return TBN*normal;
}

void main() {
  // albedo + roughness
  gl_FragData[0] = vec4(
    texture2D(textures[0], v_TexCoord).rgb*textureReady[0],
    roughness*0.1 + texture2D(textures[4], v_TexCoord).r*textureReady[4]
  );
  // normal
  gl_FragData[1] = vec4((normalMapping()+1.0)*0.5 , 1.0);
  // gl_FragData[1] = vec4((getNormal()+1.0)*0.5 , 1.0);
  // gl_FragData[1] = vec4((v_Normal+1.0)*0.5 , 1.0);
  // position
  gl_FragData[2] = vec4(texture2D(textures[3], v_TexCoord), 1.0);

  // gl_FragData[0] = vec4(1.0, 0.0, 0.0, 1.0);
  // gl_FragData[1] = vec4(0.0, 1.0, 0.0, 1.0);
  // gl_FragData[2] = vec4(0.0, 0.0, 1.0, 1.0);
}