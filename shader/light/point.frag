precision mediump float;

const float pi = 3.1415926;
const float gamma = 2.2;

uniform sampler2D albedoTarget;
uniform sampler2D normalTarget;
uniform sampler2D specularTarget;
uniform sampler2D depthTarget;

// point light attributes
// TODO: make it into struct
uniform float u_LightRadius;
uniform vec3 u_LightPosition;

// scene projection matrix
uniform mat4 u_ProjectionMatrix;

// For restore eye space position from depth.
varying vec4 v_ViewSpacePosition;
// The clip space position of the light volume. Use it to find out the texture coordinate.
varying vec4 v_ClipSpacePosition;

vec2 getTexCoord(){
  // By dividing the w component of the clip space position.
  // It gives gives NDC coordinate(here just we just need x and y), which is in [-1, 1].
  // We need to map to texture coordinate [0, 1]
  return (v_ClipSpacePosition.xy/v_ClipSpacePosition.w + 1.0) * 0.5;
}

float linearEyeSpaceDepth(vec2 texCoord){
  // depth texture value is [0, 1], convert to [-1, 1], normalized device coordinate
  float zn = texture2D(depthTarget, texCoord).z * 2.0 - 1.0;

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
  float zFar = b/(1.0 + a);
  float ze = -b/(zn + a);

  // because ze is negative, so needs reverse to positive number.
  return -ze/zFar;
}

vec3 getEyeSpacePosition(vec3 viewRay, vec2 texCoord){
  return viewRay * linearEyeSpaceDepth(texCoord);
}

void main(){
  vec2 texCoord = getTexCoord();

  vec3 materialSpecular = texture2D(specularTarget, texCoord).rgb;
  vec3 albedo = texture2D(albedoTarget, texCoord).rgb;

  // Imagine view space position is a ray, by dividing all its components by z.
  // Its direction is still unchanged. But we later can multiply it by eye space z position calculated from depth
  // texture to restore the actual eye space position of this fragment.
  vec3 viewRay = vec3(v_ViewSpacePosition.xy/v_ViewSpacePosition.z, 1.0);
  // get the eye space position of the fragment
  vec3 eyeSpacePosition = getEyeSpacePosition(viewRay, texCoord);
  
  // the view direction is the inverse of the eye space position
  vec3 v = -normalize(eyeSpacePosition);
  vec3 l = normalize(u_LightPosition - eyeSpacePosition);
  vec3 n = normalize(texture2D(normalTarget, texCoord).xyz) * 2.0 - 1.0;
  vec3 h = normalize(l + v);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);

  vec3 lightColor = vec3(1.5, 1.5, 1.5);
  vec3 specularTerm = pow(max(ndoth, 0.0), 8.0) * materialSpecular*lightColor;

  gl_FragColor = vec4(albedo*max(ndotl, 0.0) + specularTerm, 1.0);
}