precision mediump float;

const float pi = 3.1415926;
const float gamma = 2.2;

uniform sampler2D albedoTarget;
uniform sampler2D normalTarget;
uniform sampler2D specularTarget;
uniform sampler2D depthTarget;

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

varying vec2 v_TexCoord;
varying vec2 v_Position;
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

vec3 getDirectionalLight(){
  return normalize(vec3(-1, 0.5, 1));
}

float linearEyeSpaceDepth(){
  // depth texture value is [0, 1], convert to [-1, 1], normalized device coordinate
  float zn = texture2D(depthTarget, v_TexCoord).z * 2.0 - 1.0;

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

float linearEyeSpaceDepth2()
{
  float A = u_ProjectionMatrix[2].z;
  float B = u_ProjectionMatrix[3].z;
  float zNear = - B / (1.0 - A);
  float zFar  =   B / (1.0 + A);

  // depth texture stores value in [0, 1], normalize device coordinate is [-1, 1]
  float z_n = texture2D(depthTarget, v_TexCoord).x*2.0 - 1.0;
  float z_e = 2.0 * zNear * zFar / (zFar + zNear - z_n * (zFar - zNear));

  // map to [0, 1], dividing the max value.
  return z_e/zFar;
}

float linearEyeSpaceDepth3()
{
  float A = u_ProjectionMatrix[2].z;
  float B = u_ProjectionMatrix[3].z;
  float zNear = - B / (1.0 - A);
  float zFar  =   B / (1.0 + A);

  // depth texture stores value in [0, 1], normalize device coordinate is [-1, 1]
  float z_n = texture2D(depthTarget, v_TexCoord).x*2.0 - 1.0;
  float z_e = (zNear/(zFar - z_n*(zFar-zNear))) * zFar;

  // map to [0, 1], dividing the max value.
  return z_e/zFar;
}

/**
 * Using eye ray to recover the eye space position, avoid inverse projection matrix computation, and transformation.
 */
vec3 getEyeSpacePosition(){
  // http://www.opengl.org/wiki/Compute_eye_space_from_window_space#Optimized_method_from_XYZ_of_gl_FragCoord
  return normalize(v_EyeRay) * linearEyeSpaceDepth();
}

/**
 * Naive way to rever the eye space position, by reverse transform from NDC to clip space, then apply invert projection matrix
 * to rever the eye space position.
 */
vec4 getEyeSpacePosition2(){
  // depth texture value is [0, 1], convert to [-1, 1]
  float zn = texture2D(depthTarget, v_TexCoord).z*2.0 - 1.0;
  vec3 ndc = vec3(v_Position, zn);

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
  float roughness = texture2D(normalTarget, v_TexCoord).a;

  vec3 materialSpecular = texture2D(specularTarget, v_TexCoord).rgb;
  vec4 albedo = texture2D(albedoTarget, v_TexCoord);

  vec3 v = -normalize(getEyeSpacePosition().xyz);
  vec3 l = normalize(getDirectionalLight());
  vec3 n = normalize(texture2D(normalTarget, v_TexCoord).xyz) * 2.0 - 1.0;
  vec3 h = normalize(l + v);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);

  vec3 lightColor = vec3(0.3, 0.3, 0.3);

  vec4 specularTerm = pow(max(ndoth, 0.0), 8.0) * vec4(materialSpecular, 1.0);

  gl_FragColor = vec4(albedo*max(ndotl, 0.0) + specularTerm);
  gl_FragColor.rgb *= lightColor;
  // gl_FragColor = vec4(n, 1.0);
  // gl_FragColor = vec4(materialSpecular, 1.0);
  // gl_FragColor = vec4(linearEyeSpaceDepth(), linearEyeSpaceDepth(), linearEyeSpaceDepth(), 1.0);
}