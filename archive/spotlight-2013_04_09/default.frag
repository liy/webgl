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
  float spotCutOffCos;
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

  if(dot(lightDirection, normalize(-u_Light.spotDirection)) > u_Light.spotCutOffCos){
    // distance between fragment and the light source 
    float distance = distance(v_Vertex.xyz, u_Light.position);
    float attenuation = 1.0/(u_Light.attenuationConstant + u_Light.attenuationLinear*distance + u_Light.attenuationQuadratic * distance*distance);
    
    // diffuse
    vec4 diffuse = max(dot(lightDirection, normal), 0.0) * u_Material.diffuse * u_Light.diffuse;

    // specular
    vec3 reflection = reflect(-lightDirection, normal);
    vec4 specular = pow(max(dot(reflection, -normalize(v_Vertex.xyz)), 0.0), u_Material.shininess) * u_Material.specular * u_Light.specular;

    color *= u_Material.emission + attenuation*(diffuse + specular) + ambient;
  }
  else
    color *= u_Material.emission + ambient;

  gl_FragColor =  color;
}
