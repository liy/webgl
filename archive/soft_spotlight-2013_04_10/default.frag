precision mediump float;

struct Light {
  vec3 position;
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;

  float attenuationConstant;
  float attenuationLinear;
  float attenuationQuadratic;

  vec3 spotDirection;
  // float cosInner;
  // float cosOuter;
  float cosOuter;
  // outter cos - inner cos
  float cosFalloff;
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

void main(){
  // light direction, normalized
  vec3 lightDirection = normalize(u_Light.position - v_Vertex.xyz);

  // the normal is interpolated by fragment shader, needs normalization.
  vec3 normal = normalize(v_Normal);

  // note that ambient term does not have distance attenuation term.
  vec4 ambient = u_Material.ambient * u_Light.ambient;

  vec4 color = texture2D(u_Sampler, v_TexCoord);

  // distance between fragment and the light source 
  float distance = distance(v_Vertex.xyz, u_Light.position);
  float attenuation = 1.0/(u_Light.attenuationConstant + u_Light.attenuationLinear*distance + u_Light.attenuationQuadratic * distance*distance);
  
  // diffuse
  vec4 diffuse = max(dot(lightDirection, normal), 0.0) * u_Material.diffuse * u_Light.diffuse;

  // specular
  vec3 reflection = reflect(-lightDirection, normal);
  vec4 specular = pow(max(dot(reflection, -normalize(v_Vertex.xyz)), 0.0), u_Material.shininess) * u_Material.specular * u_Light.specular;

  // calculate soft cutoff
  // dot(lightDirection, normalize(-u_Light.spotDirection))
  // float spot = clamp((dot(lightDirection, normalize(-u_Light.spotDirection)) - u_Light.cosOuter)/(u_Light.cosInner - u_Light.cosOuter), 0.0, 1.0);

  float spot = clamp((u_Light.cosOuter - dot(lightDirection, normalize(-u_Light.spotDirection)))/u_Light.cosFalloff, 0.0, 1.0);

  color *= u_Material.emission + ambient + attenuation*(diffuse + specular) * spot;

  gl_FragColor =  color;
}
