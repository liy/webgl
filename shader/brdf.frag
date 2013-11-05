precision highp float;

const float pi = 3.1415926;
const float gamma = 2.2;

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;

// texture sampling.
uniform sampler2D diffuseTexture;
uniform sampler2D bumpTexture;

// phong model
// light source
// position
uniform vec3 u_LightPosition;
// 3 terms of the light source
uniform vec4 u_LightAmbient;
uniform vec4 u_LightColor;

// material
// coefficient of the fraction of incoming light which is reflected. This is material dependent, therefore
// it is material- prefixed.
uniform vec4 u_MaterialColor;
// shininess only apply to the specular term.
uniform float u_Gloss;

// light matrix
uniform mat4 u_LightMatrix;

uniform bool u_TextureAvailable;

vec3 fresnel(vec3 R0, float ndotl){
  return R0 + (1.0 - R0) * pow(1.0-max(ndotl, 0.0), 5.0);
}

float diffuseConservation(){
  return 1.0/pi;
}

float specularConservation(){
  return (u_Gloss+8.0)/(8.0*pi);
}

vec4 toLinear(vec4 color){
  return pow(color, vec4(gamma));
}

vec4 toRGB(vec4 color){
  return pow(color, vec4(1.0/gamma));
}



vec3 calculateBumpNormal(vec3 N){
  // float d = 1.0/400.0;
  // float dfx = -texture2D(bumpTexture, vec2(v_TexCoord.x+d, v_TexCoord.y)).r + texture2D(bumpTexture, vec2(v_TexCoord.x-d, v_TexCoord.y)).x;
  // float dfy = -texture2D(bumpTexture, vec2(v_TexCoord.x, v_TexCoord.y+d)).r + texture2D(bumpTexture, vec2(v_TexCoord.x, v_TexCoord.y-d)).x;



  vec3 T = normalize(v_Tangent);
  T = normalize(T - dot(T, N) * N);
  vec3 B = cross(T, N);
  vec3 BumpMapNormal = normalize(texture2D(bumpTexture, v_TexCoord)).xyz;
  BumpMapNormal = 2.0 * BumpMapNormal - vec3(1.0, 1.0, 1.0);
  mat3 TBN = mat3(T.x, T.y, T.z,
                  B.x, B.y, B.z,
                  N.x, N.y, N.z);
  vec3 NewNormal = TBN * BumpMapNormal;
  NewNormal = normalize(NewNormal);




  return NewNormal;
}


void main(){
  // light position
  vec4 lightPosition = u_LightMatrix * vec4(u_LightPosition, 1.0);

  // light direction, normalized
  vec3 l = normalize(lightPosition.xyz - v_Vertex.xyz);
  // view direction
  vec3 v = -normalize(v_Vertex.xyz);
  // half angle
  vec3 h = normalize(v + l);
  // the normal is interpolated by fragment shader, needs normalization.
  vec3 n = normalize(v_Normal);

  n = calculateBumpNormal(n);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);

  // roughness
  float m = sqrt(2.0/(2.0+u_Gloss));

  // fresnel
  vec3 F0 = vec3(0.05,0.05,0.05);
  vec3 F = fresnel(F0, ndoth);
  // distribution
  float D = ((u_Gloss + 2.0)/2.0*pi) * pow(ndoth, u_Gloss);

  // geometry
  // Schlick's approximation
  float k = m * sqrt(2.0/pi);
  float G = ndotv/(ndotv * (1.0-k) + k);

  // note that ambient term does not have distance attenuation term.
  vec4 ambientContrib = u_LightAmbient;
  // specular
  vec4 specularMicrofacetTerm = vec4(F*G*D, 1.0)/(4.0*ndotl*ndotv);
  vec4 specularTerm = u_LightColor * pow(max(ndoth, 0.0), u_Gloss) * specularMicrofacetTerm * specularConservation();
  vec4 specularContrib =  specularTerm *  max(ndotl, 0.0);
  // diffuse
  vec4 diffuseTerm = u_LightColor * diffuseConservation() * vec4(1.0 - F0, 1.0);
  vec4 diffuseContrib = u_MaterialColor * diffuseTerm * max(ndotl, 0.0);

  // gl_FragColor = vec4(n, 1.0);
  gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + specularContrib + ambientContrib));
  // gl_FragColor = toRGB(toLinear(texture2D(bumpTexture, v_TexCoord)) * (diffuseContrib + specularContrib + ambientContrib));
}

































// void main(){
//   // light position
//   vec4 lightPosition = u_LightMatrix * vec4(u_LightPosition, 1.0);

//   // light direction, normalized
//   vec3 l = normalize(lightPosition.xyz - v_Vertex.xyz);
//   // view direction
//   vec3 v = -normalize(v_Vertex.xyz);
//   // half angle
//   vec3 h = normalize(v + l);
//   // the normal is interpolated by fragment shader, needs normalization.
//   vec3 n = normalize(v_Normal);

//   float ndotl = dot(n, l);
//   float ndoth = dot(n, h);
//   float ndotv = dot(n, v);

//   // roughness
//   float m = sqrt(2.0/(2.0+u_Gloss));

//   // gold
//   // vec3 F0 = vec3(1.0,0.71,0.29);
//   // silver
//   // vec3 F0 = vec3(0.95,0.93,0.88);
//   // // copper
//   // vec3 F0 = vec3(0.95,0.64,0.54);
//   // // iron
//   // vec3 F0 = vec3(0.56,0.57,0.58);
//   // // Aluminum
//   // vec3 F0 = vec3(0.91,0.92,0.92);
//   // // water
//   // vec3 F0 = vec3(0.02,0.02,0.02);
//   // // plastic
//   vec3 F0 = vec3(0.05,0.05,0.05);

//   vec3 F = fresnel(F0, ndoth);
//   float D = ((u_Gloss + 2.0)/2.0*pi) * pow(ndoth, u_Gloss);

//   // geometry
//   // http://simonstechblog.blogspot.co.uk/search?updated-max=2011-12-31T22:48:00%2B08:00&max-results=3&start=12&by-date=false
//   // implicit
//   // float G = ndotl * ndotv;
//   // Schlick's approximation
//   float k = m * sqrt(2.0/pi);
//   float G = ndotv/(ndotv * (1.0-k) + k);

//   // note that ambient term does not have distance attenuation term.
//   vec4 ambientContrib = u_LightAmbient;
//   // specular
//   vec4 specularMicrofacetTerm = vec4(F*G*D, 1.0)/(4.0*ndotl*ndotv);
//   vec4 specularTerm = u_LightColor * pow(max(ndoth, 0.0), u_Gloss) * specularMicrofacetTerm * specularConservation();
//   vec4 specularContrib =  specularTerm *  max(ndotl, 0.0);
//   // diffuse
//   vec4 diffuseTerm = u_LightColor * diffuseConservation() * vec4(1.0 - F0, 1.0);
//   vec4 diffuseContrib = u_MaterialColor * diffuseTerm * max(ndotl, 0.0);

//   // gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + ambientContrib));
//   if(u_TextureAvailable)
//     gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + specularContrib + ambientContrib));
//   else
//     gl_FragColor = toRGB(ambientContrib + diffuseContrib + specularContrib);
//   // gl_FragColor = toRGB(ambientContrib + diffuseContrib + specularContrib);
//   // gl_FragColor = ambientContrib + diffuseContrib + specularContrib;
//   // gl_FragColor = toRGB(vec4(1.0, 0.0, 0.0, 1.0));
// }