precision mediump float;

struct Light {
  vec3 position;
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;

  float attenuationConstant;
  float attenuationLinear;
  float attenuationQuadratic;
};

// material
struct Material {
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;
  vec4 emission;
  float shininess;
};

varying vec4 v_Vertex;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

// texture sampling.
uniform sampler2D u_Sampler;

uniform Light u_Light;

uniform Material u_Material;

// light matrix
uniform mat4 u_LightMatrix;

void main(){
  // light position
  vec4 lightPosition = u_LightMatrix * vec4(u_Light.position, 1.0);
  // light direction, normalized
  vec3 lightDirection = normalize(lightPosition.xyz - v_Vertex.xyz);

  // the normal is interpolated by fragment shader, needs normalization.
  vec3 normal = normalize(v_Normal);

  // distance between fragment and the light source 
  float distance = distance(v_Vertex, lightPosition);
  float attenuation = 1.0/(u_Light.attenuationConstant + u_Light.attenuationLinear*distance + u_Light.attenuationQuadratic * distance*distance);

  // note that ambient term does not have distance attenuation term.
  vec4 ambient = u_Material.ambient * u_Light.ambient;

  // diffuse
  vec4 diffuse = max(dot(lightDirection, normal), 0.0) * u_Material.diffuse * u_Light.diffuse;

  // specular
  vec3 reflection = reflect(-lightDirection, normal);
  vec4 specular = pow(max(dot(reflection, -normalize(v_Vertex.xyz)), 0.0), u_Material.shininess) * u_Material.specular * u_Light.specular;

  gl_FragColor = texture2D(u_Sampler, v_TexCoord) * (u_Material.emission + attenuation*(diffuse + specular) + ambient);
}