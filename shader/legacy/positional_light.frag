precision mediump float;

struct Light {
  // eye space position
  vec3 position;
  vec3 color;
  bool enabled;
  // radius will control the attenuation of the light, smooth drop off at the edge.
  float radius;
  // extra light intensity factor
  float intensity;
};

// The clip space position of the light volume. Use it to find out the texture coordinate.
varying vec4 v_ClipSpacePosition;

// depth, normal and albedo(texture) passes rendered textures
uniform sampler2D u_Sampler[4];

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ViewMatrix;

uniform vec2 u_Viewport;

uniform Light u_Light;


vec4 extractEyeSpace(vec3 ndc){
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
  // // calculate the texture coordinate
  // vec2 texCoord = (v_ClipSpacePosition.xy/v_ClipSpacePosition.w + 1.0) * 0.5;

  // // // get the ndc of the scene. [-1, 1]
  // vec4 depth = texture2D(u_Sampler[0], texCoord) * 2.0 - 1.0;
  // vec3 ndc = vec3(gl_FragCoord.xy/u_Viewport * 2.0 - 1.0, depth);
  // vec4 surfacePosition = extractEyeSpace(ndc);

  // float ratio = 0.0;
  // vec3 color = texture2D(u_Sampler[2], texCoord).rgb;

  // // if(distance(u_Light.position, surfacePosition.xyz) < u_Light.radius){
  //   vec3 lightDirection = normalize(u_Light.position - surfacePosition.xyz);
  //   vec3 normal = normalize(texture2D(u_Sampler[1], texCoord).xyz);

  //   ratio = max(0.0, dot(lightDirection, normal));
  // // }
  // gl_FragColor = vec4(color * ratio, 1.0);




  // [-1, 1]
  vec2 ndcXY = v_ClipSpacePosition.xy/v_ClipSpacePosition.w;
  vec2 texCoord = (ndcXY + 1.0) * 0.5;

  vec3 ndc = vec3(ndcXY, texture2D(u_Sampler[0], texCoord).z*2.0 - 1.0);
  vec4 surfacePosition = extractEyeSpace(ndc);

  float diffuse = 0.0;
  vec3 color = texture2D(u_Sampler[2], texCoord).rgb * u_Light.color;

  float dis = distance(u_Light.position, surfacePosition.xyz);

  // check whether the position under fragment is in the light volume, the do the expensive lighting calculation.
  if(dis <= u_Light.radius){
    vec3 lightDirection = normalize(u_Light.position - surfacePosition.xyz);
    vec3 normal = normalize(texture2D(u_Sampler[1], texCoord).xyz*2.0 - 1.0);

    float attenuation = clamp(1.0 - dis/u_Light.radius, 0.0, 1.0);

    // attenuation = 1.0/(u_Light.attenuation[0] + dis*u_Light.attenuation[1] + dis*dis*u_Light.attenuation[2]);

    diffuse = max(0.0, dot(lightDirection, normal)) * attenuation * u_Light.intensity;
  }


  // no gamma correction
  // gl_FragColor = vec4(color, 1.0) * diffuse;
  // Gamma corrected, translate linear space color to gamma space to compensate the monitor's 2.2 display curve.
  gl_FragColor = pow(vec4(color, 1.0) * diffuse, vec4(1.0/2.2));

















  // vec2 texCoord = (v_ClipSpacePosition.xy/v_ClipSpacePosition.w + 1.0) * 0.5;

  // float ratio = 0.0;
  // vec3 color = texture2D(u_Sampler[2], texCoord).rgb;
  // vec3 surfacePosition = texture2D(u_Sampler[3], texCoord).rgb;

  // float dis = distance(u_Light.position, surfacePosition.xyz);

  // // if(dis < u_Light.radius){
  //   vec3 lightDirection = normalize(u_Light.position - surfacePosition);
  //   vec3 normal = normalize(texture2D(u_Sampler[1], texCoord).xyz);

  //   ratio = max(0.0, dot(lightDirection, normal));
  // // }



  // gl_FragColor = vec4(surfacePosition, 1.0);
}