// needs to specify this line in order to use multiple render targets: gl_FragData[]
// #extension GL_EXT_draw_buffers : require
#ifdef GL_EXT_draw_buffers
  #extension GL_EXT_draw_buffers : require
#endif

precision mediump float;

#include common.glsl

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec3 v_Tangent;
varying vec3 v_Bitangent;
// encode eye space position
varying vec4 v_Position;


#ifdef VERTEX_SHADER
  attribute vec3 a_Vertex;
  attribute vec3 a_Normal;
  attribute vec2 a_TexCoord;
  attribute vec3 a_Tangent;
  attribute vec3 a_Bitangent;

  // set by camera
  uniform mat4 u_ProjectionMatrix;
  uniform mat4 u_ViewMatrix;

  // set by mesh
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ModelViewMatrix;
  uniform mat3 u_NormalMatrix;

  void main(){
    v_Position = u_ModelViewMatrix * vec4(a_Vertex, 1.0);
    gl_Position = u_ProjectionMatrix * v_Position;
    v_TexCoord = a_TexCoord;

    v_Normal = u_NormalMatrix * a_Normal;
    v_Tangent = u_NormalMatrix * a_Tangent;
    v_Bitangent = u_NormalMatrix * a_Bitangent;
  }
#endif


#ifdef FRAGMENT_SHADER
  uniform vec4 u_AmbientColor;
  uniform vec4 u_AlbedoColor;
  uniform vec4 u_SpecularColor;
  uniform vec4 u_EmissionColor;
  uniform float u_Roughness;

  uniform mat4 u_InvViewMatrix;

  uniform sampler2D u_AlbedoTexture;
  uniform sampler2D u_SpecularTexture;
  uniform sampler2D u_BumpTexture;
  uniform sampler2D u_RoughnessTexture;

  uniform samplerCube u_CubeMapTexture;

  uniform float u_TextureDeltaX;
  uniform float u_TextureDeltaY;

  void main() {
    vec3 n = normalize(v_Normal);

    gl_FragData[0] = vec4(1,0,0,1);//texture2D(albedoTexture, v_TexCoord);
    gl_FragData[1] = vec4((n + 1.0) * 0.5, 1.0);
    gl_FragData[2] = texture2D(u_SpecularTexture, v_TexCoord);
    gl_FragData[3] = pack(gl_FragCoord.z);
  }
#endif