precision mediump float;

uniform sampler2D u_AlbedoBuffer;
uniform sampler2D u_DiffuseLightBuffer;
uniform sampler2D u_SpecularLightBuffer;
uniform sampler2D u_LightProbeDebugBuffer;

varying vec2 v_TexCoord;

void main(){
  vec4 albedo = texture2D(u_AlbedoBuffer, v_TexCoord);
  vec4 diffuseLight = texture2D(u_DiffuseLightBuffer, v_TexCoord);
  vec4 specularLight = texture2D(u_SpecularLightBuffer, v_TexCoord);

  vec4 lightProbe = texture2D(u_LightProbeDebugBuffer, v_TexCoord);

  gl_FragColor =lightProbe;
}