precision mediump float;

uniform sampler2D albedoTarget;
uniform sampler2D diffuseLightTarget;
uniform sampler2D specularLightTarget;

varying vec2 v_TexCoord;

void main(){
  vec4 albedo = texture2D(albedoTarget, v_TexCoord);
  vec4 diffuseLight = texture2D(diffuseLightTarget, v_TexCoord);
  vec4 specularLight = texture2D(specularLightTarget, v_TexCoord);

  // gl_FragColor = albedo*diffuseLight + specularLight;
  gl_FragColor = specularLight;
}