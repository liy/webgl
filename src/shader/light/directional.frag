// needs to specify this line in order to use multiple render targets: gl_FragData[]
// #extension GL_EXT_draw_buffers : require
#ifdef GL_EXT_draw_buffers
  #extension GL_EXT_draw_buffers : require
#endif

precision highp float;

const float pi = 3.1415926;
const float gamma = 2.2;
const vec4 bitShifts = vec4(1.0,
          1.0 / 255.0,
          1.0 / (255.0 * 255.0),
          1.0 / (255.0 * 255.0 * 255.0));

uniform sampler2D albedoBuffer;
uniform sampler2D normalBuffer;
uniform sampler2D specularBuffer;
uniform sampler2D depthBuffer;

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

struct Light {
  vec3 color;
  vec3 direction;
  bool enabled;
};

uniform Light u_Light;


varying vec2 v_TexCoord;
varying vec3 v_EyeRay;

vec3 fresnel(vec3 F0, float vdoth){
  return F0 + (1.0 - F0) * pow(1.0-max(vdoth, 0.0), 5.0);
}

vec4 toLinear(vec4 color){
  return pow(color, vec4(gamma));
}

vec4 toRGB(vec4 color){
  return pow(color, vec4(1.0/gamma));
}

float unpack (vec4 colour)
{
  return dot(colour, bitShifts);
}

/**
 * Using eye ray to recover the eye space position, avoiding inverse projection matrix computation, and transformation.
 */
vec3 getEyeSpacePosition(){
  // depth texture value is [0, 1], the ray's z is at far plane. Think depth texture value as a ratio for eye ray's z component.
  // So just need to directly scale eye ray by the normalized(in range of [0, 1]) depth value.
  return v_EyeRay * unpack(texture2D(depthBuffer, v_TexCoord));
}

void main(){
  vec3 materialSpecular = texture2D(specularBuffer, v_TexCoord).rgb;
  vec4 albedo = texture2D(albedoBuffer, v_TexCoord);

  // get the eye space position of the fragment
  vec3 eyeSpacePosition = getEyeSpacePosition();

  vec3 v = -normalize(eyeSpacePosition);
  vec3 l = normalize(u_Light.direction);
  vec3 n = texture2D(normalBuffer, v_TexCoord).xyz * 2.0 - 1.0;
  vec3 h = normalize(l + v);
  vec3 r = normalize(reflect(-l, n));

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);
  float rdotv = dot(r, v);

  vec3 specularTerm = materialSpecular * pow(max(ndoth, 0.0), 8.0);
  // FIXME: For some reason, the back face is lit using blinn-phong ndoth, so we multiply ndotl which will be 0(or even negative) for back face
  // which remove the back face specular light.
  // However I guess this will bring down the normal front face specular light intensity.
  // http://tech-artists.org/forum/showthread.php?369-Specular-through-surface-shader-bug
  // http://www.arcsynthesis.org/gltut/Illumination/Tut11%20BlinnPhong%20Model.html
  specularTerm *= ndotl;


  vec3 diffuseTerm = u_Light.color * max(ndotl, 0.0);

  gl_FragData[0] = vec4(diffuseTerm, 1);
  // You might see some weird specular hight light on cube model, even the face's normal is perpendicular to light direction.
  // I think it is related to floating point error, especially I was use RGB color texture to encode depth value.
  // I assume that if in the future I can use floating point depth texture, this problem will go away.
  // (Using rdotv is better, but not going to solve the problem)
  gl_FragData[1] = vec4(specularTerm, 1);
}