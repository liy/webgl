precision highp float;

const float pi = 3.1415926;
const float gamma = 2.2;

varying vec4 v_Vertex;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec4 v_Tangent;
varying vec3 v_Bitangent;

varying vec3 v_WorldNormal;
varying vec4 v_WorldPosition;

uniform mat3 u_ModelViewMatrixInverseTranspose;

// texture sampling.
uniform sampler2D diffuseTexture;
uniform sampler2D bumpTexture;
uniform sampler2D specularTexture;
uniform sampler2D glossTexture;

uniform samplerCube cubeMapTexture;

// light source
// 3 terms of the light source
uniform vec3 u_LightAmbient;
uniform vec3 u_LightColor;

// material
// coefficient of the fraction of incoming light which is reflected. This is material dependent, therefore
// it is material- prefixed.
uniform vec4 u_MaterialColor;
// shininess only apply to the specular term.
uniform float u_Gloss;
uniform float u_GlossFactor;

// if we calculate lighting in camera space(eye space), camera position will be at (0, 0)
uniform vec3 u_CameraPosition;
// in eye space(camera space)
uniform vec3 u_LightPosition;

vec3 fresnel(vec3 F0, float vdoth){
  return F0 + (1.0 - F0) * pow(1.0-max(vdoth, 0.0), 5.0);
}

vec4 toLinear(vec4 color){
  return pow(color, vec4(gamma));
}

vec4 toRGB(vec4 color){
  return pow(color, vec4(1.0/gamma));
}

vec3 calculateNormal(){
  vec3 permuted = normalize(texture2D(bumpTexture, v_TexCoord) * 2.0 - 1.0).xyz ;

  vec3 N = normalize(v_Normal);
  vec3 T = normalize(u_ModelViewMatrixInverseTranspose * v_Tangent.xyz);
  vec3 B = normalize(v_Bitangent);
  // transform from tangent space into world space
  // T,B,N corresponds to first, second and third column?
  mat3 TBN = mat3(T, B, N);

  return TBN * permuted;
}

void main(){
  vec3 l = normalize(u_LightPosition - v_Vertex.xyz);
  vec3 v = -normalize(v_Vertex.xyz);
  vec3 h = normalize(l + v);
  vec3 n = normalize(calculateNormal());
  // vec3 n = normalize(v_Normal);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);
  float vdoth = dot(v, h);

  float gloss = toLinear(texture2D(glossTexture, v_TexCoord)).r * u_GlossFactor;

  // Fresnel, Schlick's approximation
  vec3 F0 = toLinear(texture2D(specularTexture, v_TexCoord)).xyz;
  vec3 F = fresnel(F0, vdoth);

  // blinn phong distribution function
  // http://simonstechblog.blogspot.co.uk/2011/12/microfacet-brdf.html
  float D = ((gloss + 2.0)/2.0*pi) * pow(ndoth, gloss);

  // Geometry term, Cook-Torrance
  // http://simonstechblog.blogspot.co.uk/2011/12/microfacet-brdf.html
  // http://graphicrants.blogspot.co.uk/2013/08/specular-brdf-reference.html
  float G = min(1.0, min(2.0*ndoth*ndotv/vdoth, 2.0*ndoth*ndotl/vdoth));

  // microfacet specular
  // pi or 4.0 ?
  vec3 microfacetSpecular = F*G*D/(4.0*ndotl*ndotv);
  // vec3 microfacetSpecular = F*G*D/(pi*ndotl*ndotv);
  vec3 specularTerm = u_LightColor * microfacetSpecular;

  // diffuse, (1-fresnel) term ensures then only light energy left after surface reflection(specular) will be contributed to the body reflection(diffuse).
  // 1.0/pi is the normalization factor of BRDF for diffuse term. pi is the integral over the hemisphere, which means the
  // max energy of sum of all diffuse should be pi, so we have to divide it by pi to normalize into [0, 1] range.
  vec3 diffuseTerm = u_LightColor * (1.0/pi) * (1.0-F);

  // gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * vec4((diffuseTerm + specularTerm) * max(ndotl, 0.0), 1.0));

  vec3 r = reflect(-v, normalize(v_Normal));
  gl_FragColor = textureCube(cubeMapTexture, r);
  // gl_FragColor = toRGB(toLinear(textureCube(cubeMapTexture, r)) * vec4((diffuseTerm + specularTerm) * max(ndotl, 0.0), 1.0));

}










/*
void main(){
  vec3 l = normalize(u_LightPosition - v_Vertex.xyz);
  vec3 v = -normalize(v_Vertex.xyz);
  vec3 h = normalize(l + v);
  vec3 n = normalize(calculateNormal());
  // vec3 n = normalize(v_Normal);

  float ndotl = dot(n, l);
  float ndoth = dot(n, h);
  float ndotv = dot(n, v);

  // roughness
  // float m = sqrt(2.0/(2.0+u_Gloss));
  // float gloss = u_Gloss;
  float gloss = toLinear(texture2D(glossTexture, v_TexCoord)).r * u_GlossFactor;
  float m = sqrt(2.0/(2.0 + gloss));


  // gold
  // vec3 F0 = vec3(1.0,0.71,0.29);
  // silver
  // vec3 F0 = vec3(0.95,0.93,0.88);
  // // copper
  // vec3 F0 = vec3(0.95,0.64,0.54);
  // // iron
  // vec3 F0 = vec3(0.56,0.57,0.58);
  // // Aluminum
  // vec3 F0 = vec3(0.91,0.92,0.92);
  // // water
  // vec3 F0 = vec3(0.02,0.02,0.02);
  // // plastic
  vec3 F0 = toLinear(texture2D(specularTexture, v_TexCoord)).xyz;

  vec3 F = fresnel(F0, ndoth);
  float D = ((gloss + 2.0)/2.0*pi) * pow(ndoth, gloss);

  // geometry
  // http://simonstechblog.blogspot.co.uk/search?updated-max=2011-12-31T22:48:00%2B08:00&max-results=3&start=12&by-date=false
  // implicit
  // float G = ndotl * ndotv;
  // Schlick's approximation
  float k = m * sqrt(2.0/pi);
  float G = ndotv/(ndotv * (1.0-k) + k);

  // note that ambient term does not have distance attenuation term.
  vec4 ambientContrib = u_LightAmbient;
  // specular
  vec4 specularMicrofacetTerm = vec4(F*G*D, 1.0)/(4.0*ndotl*ndotv);
  vec4 specularTerm = u_LightColor * pow(max(ndoth, 0.0), gloss) * specularMicrofacetTerm * specularConservation(gloss);
  vec4 specularContrib =  specularTerm *  max(ndotl, 0.0);
  // diffuse
  vec4 diffuseTerm = u_LightColor * diffuseConservation() * vec4(1.0 - F0, 1.0);
  vec4 diffuseContrib = u_MaterialColor * diffuseTerm * max(ndotl, 0.0);

  gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + ambientContrib + specularContrib));
}
*/





























// void main(){
//   vec3 l = normalize(v_LightDirTangentSpace);
//   vec3 v = normalize(v_viewDirTangentSpace);
//   vec3 h = normalize(l + v);
//   // vec3 h = normalize(v_halfDirTangentSpace);
//   // vec3 n = normalize(calculateNormal());
//   vec3 n = vec3(0.0, 0.0, 1.0);

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

//   gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + ambientContrib + specularContrib));
//   // gl_FragColor = toRGB(ambientContrib + diffuseContrib);
//   // gl_FragColor = toRGB(ambientContrib + diffuseContrib + specularContrib);
//   // gl_FragColor = toRGB(vec4(1.0, 0.0, 0.0, 1.0));
//   // if(ndotl > 0.0)
//   //   gl_FragColor = vec4(1, 0, 0, 1.0);

//   // gl_FragColor = toRGB(vec4(v_Vertex.xyz, 1.0));
// }





// void main(){
//   // light direction, normalized
//   vec3 l = normalize(u_LightPosition - v_Vertex.xyz);
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
//   gl_FragColor = toRGB(toLinear(texture2D(diffuseTexture, v_TexCoord)) * (diffuseContrib + specularContrib + ambientContrib));
//   // gl_FragColor = toRGB(ambientContrib + diffuseContrib + specularContrib);
//   // gl_FragColor = ambientContrib + diffuseContrib + specularContrib;
//   // gl_FragColor += toRGB(vec4(v, 1.0));
// }