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
  vec3 n = normalize(v_Normal);

  gl_FragData[0] = vec4(1,0,0,1);//texture2D(albedoTexture, v_TexCoord);
  gl_FragData[1] = vec4((n + 1.0) * 0.5, 1.0);
  gl_FragData[2] = texture2D(u_SpecularTexture, v_TexCoord);
  gl_FragData[3] = pack(gl_FragCoord.z);
}