precision mediump float;

// depth, normal and albedo(texture) passes rendered textures
uniform sampler2D u_Sampler[3];

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

// Normalized already, [-1, 1], can be directly used for NDC's x and y
varying vec2 v_Position;
varying vec2 v_TexCoord;

float getDepth(){
  // depth texture value is [0, 1], convert to [-1, 1]
  return texture2D(u_Sampler[0], v_TexCoord).x*2.0 - 1.0;
}

vec4 getEyeSpace(){
  // gl_FragColor = texture2D(u_Sampler[2], v_TexCoord) * texture2D(u_Sampler[1], v_TexCoord) * texture2D(u_Sampler[0], v_TexCoord);
  vec3 ndc = vec3(v_Position, getDepth());

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
  vec4 eyeSpace = getEyeSpace();

  // test directional light
  vec3 lightDirection = normalize(vec3(1.0, 0.0, 0.0));
  vec3 normal = normalize(texture2D(u_Sampler[1], v_TexCoord).xyz);

  float ratio = dot(lightDirection, normal);
  if(ratio < 0.0)
    ratio = 0.0;
  gl_FragColor = vec4(texture2D(u_Sampler[2], v_TexCoord).rgb * ratio, 1.0);

  // gl_FragColor = vec4(eyeSpace.xyz, 1.0);
}