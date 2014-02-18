precision mediump float;

uniform sampler2D albedoBuffer;
uniform sampler2D diffuseLightBuffer;
uniform sampler2D specularLightBuffer;
uniform sampler2D lightProbeDebugBuffer;

varying vec2 v_TexCoord;

void main(){
  vec4 albedo = texture2D(albedoBuffer, v_TexCoord);
  vec4 diffuseLight = texture2D(diffuseLightBuffer, v_TexCoord);
  vec4 specularLight = texture2D(specularLightBuffer, v_TexCoord);

  vec4 lightProbe = texture2D(lightProbeDebugBuffer, v_TexCoord);

  // gl_FragColor = (albedo*diffuseLight + specularLight) + lightProbe;
  gl_FragColor = lightProbe;
}