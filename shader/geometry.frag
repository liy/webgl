// needs to specify this line in order to use multiple render targets: gl_FragData[]
// #extension GL_EXT_draw_buffers : require
#ifdef GL_EXT_draw_buffers
  #extension GL_EXT_draw_buffers : require
#endif

precision mediump float;

const float gamma = 2.2;


uniform vec4 u_AmbientColor;
uniform vec4 u_AlbedoColor;
uniform vec4 u_SpecularColor;
uniform vec4 u_EmissionColor;
uniform float u_Roughness;

uniform mat4 u_InvViewMatrix;

uniform sampler2D u_AlbedoTexture;
uniform sampler2D u_SpecularTexture;
uniform sampler2D u_BumpTexture;
uniform sampler2D u_RoughnessTexture;

uniform samplerCube u_CubeMapTexture;

uniform mat4 u_ProjectionMatrix;

uniform float u_TextureDeltaX;
uniform float u_TextureDeltaY;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
varying vec3 v_Color;

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
//   float hg = texture2D(u_BumpTexture, v_TexCoord).r;
//   float hr = texture2D(u_BumpTexture, vec2(v_TexCoord.x+u_TextureDeltaX, v_TexCoord.y)).r;
//   float ha = texture2D(u_BumpTexture, vec2(v_TexCoord.x, v_TexCoord.y+u_TextureDeltaY)).r;

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
  float hg = texture2D(u_BumpTexture, v_TexCoord).r;
  float hr = texture2D(u_BumpTexture, vec2(v_TexCoord.x+u_TextureDeltaX, v_TexCoord.y)).r;
  float ha = texture2D(u_BumpTexture, vec2(v_TexCoord.x, v_TexCoord.y+u_TextureDeltaY)).r;

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
  // gl_FragData[0] = toLinear(texture2D(u_AlbedoTexture, v_TexCoord));
  // // gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
  // gl_FragData[1] = vec4(getNormal(), 1.0);
  // // gl_FragData[1] = vec4((normalize(v_Normal)+1.0)*0.5, 1.0);
  // gl_FragData[2] = toLinear(texture2D(u_SpecularTexture, v_TexCoord));


  vec3 n = normalize(v_Normal);
  vec3 v = -normalize(v_Position.xyz);
  float vdotn = dot(v, n);

  // note that, the first parameter of reflect function is incoming direction, which is from SOURCE TOWARDS SURFACE!
  vec3 r = normalize(reflect(v_Position.xyz, v_Normal));
  // r = 2.0*vdotn*n - v;

  r = vec3(u_InvViewMatrix * vec4(r, 0.0));


  gl_FragData[0] = texture2D(u_AlbedoTexture, v_TexCoord) + (textureCube(u_CubeMapTexture, r));
  // gl_FragData[0] = vec4(1.0, 1.0, 1.0, 1.0);
  // gl_FragData[0] = textureCube(u_CubeMapTexture, r);
  gl_FragData[1] = vec4(getNormal(), 1.0);
  // gl_FragData[1] = vec4((normalize(v_Normal)+1.0)*0.5, 1.0);
  gl_FragData[2] = texture2D(u_SpecularTexture, v_TexCoord);
  // pack eye depth
  // just want to keep shader consistent with normal procedure, you can use linear depth as well
  // gl_FragData[3] = pack(getLinearDepth());
  gl_FragData[3] = pack(gl_FragCoord.z);
}