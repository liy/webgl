precision mediump float;

struct Light {
  vec4 position;
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;

  vec3 attenuation;

  vec3 direction;
  float cosOuter;
  // outer cos - inner cos
  float cosFalloff;
};

struct Material {
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;
  vec4 emission;
  float shininess;
};

uniform sampler2D u_Sampler;

uniform Light u_Light;
uniform Material u_Material;

varying vec4 v_Position;
varying vec2 v_TexCoord;
varying vec3 v_Normal;
varying vec4 v_Color;

void main(){
  vec3 normal = normalize(v_Normal);
  vec4 color = texture2D(u_Sampler, v_TexCoord) + v_Color;

  vec4 intensity = u_Material.ambient*u_Light.ambient;

  float attenuation = 1.0;

  vec3 photonDirection;
  // directional light
  if(u_Light.position.w == 0.0)
    photonDirection = normalize(u_Light.position).xyz;
  // point light or spot light
  else
    photonDirection = normalize(u_Light.position - v_Position).xyz;

  float lambertian = max(dot(normal, photonDirection.xyz), 0.0);
  
  if(lambertian > 0.0){
    float dis = distance(v_Position, u_Light.position);
    attenuation = 1.0/(u_Light.attenuation[0] + dis*u_Light.attenuation[1] + dis*dis*u_Light.attenuation[2]);

    vec4 diffuse = u_Material.diffuse*u_Light.diffuse * lambertian;

    vec3 reflection = reflect(photonDirection, normal);
    vec4 specular = pow(max(dot(reflection, normalize(v_Position.xyz)), 0.0), u_Material.shininess) * u_Material.specular*u_Light.specular;

    intensity += (diffuse + specular) * attenuation;
  }

  gl_FragColor = color * intensity;
  // gl_FragColor = vec4(photonDirection.x, photonDirection.y, photonDirection.z, 1.0);
  // gl_FragColor = vec4(normal, 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  // gl_FragColor = color;
}