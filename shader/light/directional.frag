precision highp float;

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

float linearEyeSpaceDepth(){
  // depth texture value is [0, 1], convert to [-1, 1], normalized device coordinate
  float zn = unpack(texture2D(depthTarget, v_TexCoord)) * 2.0 - 1.0;

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

  // ze is negative
  return -ze;
}

/**
 * Using eye ray to recover the eye space position, avoiding inverse projection matrix computation, and transformation.
 */
vec3 getEyeSpacePosition(){
  // scale all the components of eye ray by its -z, its direction is not changed, still points to
  // correct eye space position. If now we scale eye ray will give you the correct eye space position.
  // (You can start from 1.0*linearEyeSpaceDepth(), of course it will produce correct depth, then x and y components will
  // also be correct eye space coordinate, since eye ray direction is always pointed to the right location, never changed).
  return vec3(v_EyeRay.xy/-v_EyeRay.z, -1.0) * linearEyeSpaceDepth();
}

void main(){
  vec3 materialSpecular = texture2D(specularTarget, v_TexCoord).rgb;
  vec4 albedo = texture2D(albedoTarget, v_TexCoord);

  // get the eye space position of the fragment
  vec3 eyeSpacePosition = getEyeSpacePosition();

  vec3 v = -normalize(eyeSpacePosition);
  vec3 l = normalize(u_Light.direction);
  vec3 n = texture2D(normalTarget, v_TexCoord).xyz * 2.0 - 1.0;
  vec3 h = normalize(l + v);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);

  vec3 specularTerm = materialSpecular * pow(max(ndoth, 0.0), 8.0);
  vec3 diffuseTerm = u_Light.color * max(ndotl, 0.0);

  gl_FragData[0] = vec4(diffuseTerm, 1.0);
  // You might see some weird specular hight light on cube model, even the face's normal is perpendicular to light direction.
  // I think it is related to floating point error, especially I was use RGB color texture to encode depth value.
  // I assume that if in the future I can use floating point depth texture, this problem will go away.
  // (Using rdotv is better, but not going to solve the problem)
  gl_FragData[1] = vec4(specularTerm, 1.0);

  // gl_FragData[1] = vec4(eyeSpacePosition, 1.0);
}