precision mediump float;

struct Light {
  vec3 position;
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;

  float attenuationConstant;
  float attenuationLinear;
  float attenuationQuadratic;

  // spot light only
  vec3 direction;
  float cosOuter;
  // outer cos - inner cos
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

varying vec4 v_Position;
varying vec3 v_Normal;
varying vec2 v_TexCoord;

uniform sampler2D u_Sampler;

uniform Light u_Light;

uniform Material u_Material;

void main(){
  vec3 normal = normalize(v_Normal);
  vec3 lightDirection = normalize(u_Light.position - v_Position.xyz);
  float lambertian = max(dot(normal, lightDirection), 0.0);

  vec4 color = texture2D(u_Sampler, v_TexCoord);

  vec4 ambient = u_Material.ambient * u_Light.ambient;

  color *= u_Material.emission + ambient;

  // draw light
  if(lambertian > 0.0){
    // distance between fragment and the light source 
    float distance = distance(v_Position.xyz, u_Light.position);
    float attenuation = 1.0/(u_Light.attenuationConstant + u_Light.attenuationLinear*distance + u_Light.attenuationQuadratic * distance*distance);

    // diffuse
    vec4 diffuse = max(dot(lightDirection, normal), 0.0) * u_Material.diffuse * u_Light.diffuse;

    vec3 reflection = reflect(-lightDirection, normal);
    vec4 specular = pow(max(dot(reflection, -normalize(v_Position.xyz)), 0.0), u_Material.shininess) * u_Material.specular * u_Light.specular;

    // spot
    float spot = clamp((u_Light.cosOuter - dot(lightDirection, normalize(-u_Light.direction)))/u_Light.cosFalloff, 0.0, 1.0);

    color += color * attenuation*(diffuse + specular) * spot;
  }
  
  gl_FragColor =  color;
}
