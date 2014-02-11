// needs to specify this line in order to use multiple render targets: gl_FragData[]
// #extension GL_EXT_draw_buffers : require
#ifdef GL_EXT_draw_buffers
  #extension GL_EXT_draw_buffers : require
#endif

precision mediump float;

const float pi = 3.1415926;
const float gamma = 2.2;

const vec4 bitShifts = vec4(1.0,
          1.0 / 255.0,
          1.0 / (255.0 * 255.0),
          1.0 / (255.0 * 255.0 * 255.0));

uniform sampler2D albedoTarget;
uniform sampler2D normalTarget;
uniform sampler2D specularTarget;
uniform sampler2D depthTarget;

// point light attributes
struct Light {
  vec3 color;
  vec3 position;
  // FIXME: on windows chrome canery, this float type(int type as well) is not working, also
  // breaks any properties after the float type!!
  float radius;
};

uniform float radius;

uniform Light u_Light;


// scene projection matrix
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_InvProjectionMatrix;

// For restore eye space position from depth.
varying vec4 v_ViewSpacePosition;
// The clip space position of the light volume. Use it to find out the texture coordinate.
varying vec4 v_ClipSpacePosition; // correct

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

// correct
vec2 getTexCoord(){
  // By dividing the w component of the clip space position.
  // It gives gives NDC coordinate(here just we just need x and y), which is in [-1, 1].
  // We need to map to texture coordinate [0, 1]
  return (v_ClipSpacePosition.xy/v_ClipSpacePosition.w + 1.0) * 0.5;
}

float linearEyeSpaceDepth(vec2 texCoord){
  // depth texture value is [0, 1], convert to [-1, 1], normalized device coordinate
  float zn = unpack(texture2D(depthTarget, texCoord)) * 2.0 - 1.0;

  // calculate clip-space coordinate: http://stackoverflow.com/questions/14523588/calculate-clipspace-w-from-clipspace-xyz-and-inv-projection-matrix
  // http://web.archive.org/web/20130416194336/http://olivers.posterous.com/linear-depth-in-glsl-for-real
  //
  // |  -   -   -   - |     | Xe |       | Xc |       | Xc/-Ze|   | Xn |
  // |  -   -   -   - |  *  | Ye |   =   | Yc |  ==>  | Yc/-Ze| = | Yn |
  // |  0   0   a   b |     | Ze |       | Zc |       | Zc/-Ze|   | Zn |
  // |  0   0  -1   0 |     |  1 |       |-Ze |
  //
  // Zn = Zc/-Ze = (a*Ze + b)/-Ze
  // Zn = (a*Ze + b)/-Ze
  //
  // Therefore:
  // Ze = -b/(Zn + a)
  //
  // clip-space coordinate will be:
  // | Xc | = | Xn * -Ze |
  // | Yc | = | Yn * -Ze |
  // | Zc | = | Zn * -Ze |
  // | Wc | = | -Ze      |

  // u_ProjectionMatrix[2][2] can be also written as u_ProjectionMatrix[2].z
  float a = u_ProjectionMatrix[2][2];
  float b = u_ProjectionMatrix[3][2];
  // float zNear = - b / (1.0 - a);
  // float zFar = b/(1.0 + a);
  float ze = -b/(zn + a);

  return ze;
}

vec3 getEyeSpacePosition(vec3 viewRay, vec2 texCoord){
  return viewRay * linearEyeSpaceDepth(texCoord);
}

vec4 getEyeSpacePosition2(vec2 texCoord){
  // depth texture value is [0, 1], convert to [-1, 1]
  float zn = texture2D(depthTarget, texCoord).x*2.0 - 1.0;
  vec3 ndc = vec3(v_ClipSpacePosition.xy/v_ClipSpacePosition.w, zn);

  // calculate clip-space coordinate: http://stackoverflow.com/questions/14523588/calculate-clipspace-w-from-clipspace-xyz-and-inv-projection-matrix
  //
  // |  -   -   -   - |     | Xe |       | Xc |       | Xc/-Ze|   | Xn |
  // |  -   -   -   - |  *  | Ye |   =   | Yc |  ==>  | Yc/-Ze| = | Yn |
  // |  0   0   a   b |     | Ze |       | Zc |       | Zc/-Ze|   | Zn |
  // |  0   0  -1   0 |     |  1 |       |-Ze |
  //
  // Zn = Zc/-Ze = (a*Ze + b)/-Ze
  // Zn = (a*Ze + b)/-Ze
  //
  // Therefore:
  // Ze = -b/(Zn + a)
  //
  // clip-space coordinate will be:
  // | Xc | = | Xn * -Ze |
  // | Yc | = | Yn * -Ze |
  // | Zc | = | Zn * -Ze |
  // | Wc | = | -Ze      |
  float a = u_ProjectionMatrix[2][2];
  float b = u_ProjectionMatrix[3][2];
  float ze = -b/(ndc.z + a);
  vec4 clipSpace = vec4(ndc * -ze, -ze);

  // apply inverse of the projection matrix to the clip space coordinate yields final eye space coordinate
  return u_InvProjectionMatrix * clipSpace;
}



void main(){
  vec2 texCoord = getTexCoord();

  vec3 materialSpecular = texture2D(specularTarget, texCoord).rgb;
  vec4 albedo = texture2D(albedoTarget, texCoord);

  // Imagine view space position is a ray, by dividing all its components by z.
  // Its direction is still unchanged. But we later can multiply it by eye space z position calculated from depth
  // texture to restore the actual eye space position of this fragment.
  vec3 viewRay = vec3(v_ViewSpacePosition.xy/v_ViewSpacePosition.z, 1.0);
  // get the eye space position of the fragment
  vec3 eyeSpacePosition = getEyeSpacePosition(viewRay, texCoord);
  // vec3 eyeSpacePosition = getEyeSpacePosition2(texCoord).xyz;

  // the view direction is the inverse of the eye space position
  vec3 v = -normalize(eyeSpacePosition);
  vec3 l = normalize(u_Light.position - eyeSpacePosition);
  // !!!!!!!!!!!!!!!!!!!!!!! never ever normalize the normal value sampled from texture, it is already normalized!!!!!!!!!
  // You will get strange artifacts
  vec3 n = texture2D(normalTarget, texCoord).xyz * 2.0 - 1.0;
  vec3 h = normalize(l + v);

  // TODO: squared fall off, physically correct? distance calculation seems wrong!!??!?
  float attenuation = clamp(1.0 - distance(u_Light.position, eyeSpacePosition)/radius, 0.0, 1.0);
  attenuation *= attenuation;

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);

  vec4 specularTerm = vec4(materialSpecular, 1.0) * pow(max(ndoth, 0.0), 8.0);
  vec4 diffuseTerm = vec4(u_Light.color, 1.0) * max(ndotl, 0.0);

  // vec4 color = albedo*max(ndotl, 0.0)*attenuation + specularTerm*attenuation;
  // gl_FragColor = vec4(color.rgb * u_Light.color, color.a);

  gl_FragData[0] = diffuseTerm;
  gl_FragData[1] = specularTerm;
}