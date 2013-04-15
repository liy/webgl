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

uniform sampler2D sampler;

uniform Light u_Light;
uniform Material u_Material;

varying vec2 v_TexCoord;
varying vec4 v_Position;
varying vec3 v_Normal;

void main(){
  gl_FragColor = texture2D(sampler, v_TexCoord);
}