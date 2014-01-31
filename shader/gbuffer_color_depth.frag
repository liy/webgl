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

uniform mat4 u_ProjectionMatrix;

uniform float textureDeltaX;
uniform float textureDeltaY;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec4 v_Color;

varying vec4 v_Position;

const vec4 bias = vec4(1.0 / 255.0,
        1.0 / 255.0,
        1.0 / 255.0,
        0.0);

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

float getLinearDepth(){
  float a = u_ProjectionMatrix[2][2];
  float b = u_ProjectionMatrix[3][2];
  float zNear = - b / (1.0 - a);
  float zFar = b/(1.0 + a);

  return length(v_Position)/(zFar - zNear);
}

// http://devmaster.net/posts/3002/shader-effects-shadow-mapping#vertex-tabs-3
vec4 pack(float depth){
  float r = depth;
  float g = fract(r * 255.0);
  float b = fract(g * 255.0);
  float a = fract(b * 255.0);
  vec4 colour = vec4(r, g, b, a);
  
  return colour - (colour.yzww * bias);
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
  // pack eye depth
  // just want to keep shader consistent with normal procedure, you can use linear depth as well
  // gl_FragData[3] = pack(getLinearDepth());
  gl_FragData[3] = pack(gl_FragCoord.z);
}