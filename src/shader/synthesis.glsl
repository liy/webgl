precision mediump float;

varying vec2 v_TexCoord;

#ifdef VERTEX_SHADER
  attribute vec2 a_Vertex;
  attribute vec2 a_TexCoord;

  void main(){
    gl_Position = vec4(a_Vertex, 0.0, 1.0);
    v_TexCoord = a_TexCoord;
  }
#endif


#ifdef FRAGMENT_SHADER
  uniform sampler2D u_AlbedoBuffer;
  uniform sampler2D u_DiffuseLightBuffer;
  uniform sampler2D u_SpecularLightBuffer;
  uniform sampler2D u_LightProbeDebugBuffer;

  void main(){
    vec4 albedo = texture2D(u_AlbedoBuffer, v_TexCoord);
    vec4 diffuseLight = texture2D(u_DiffuseLightBuffer, v_TexCoord);
    vec4 specularLight = texture2D(u_SpecularLightBuffer, v_TexCoord);

    vec4 lightProbe = texture2D(u_LightProbeDebugBuffer, v_TexCoord);

    // gl_FragColor = (albedo*diffuseLight + specularLight) + lightProbe;
    gl_FragColor = albedo;
  }
#endif