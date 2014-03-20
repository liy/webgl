precision mediump float;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Position;

#ifdef VERTEX_SHADER
  attribute vec3 a_Vertex;
  attribute vec3 a_Normal;
  attribute vec2 a_TexCoord;

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
  }
#endif


#ifdef FRAGMENT_SHADER
  uniform samplerCube u_CubeMapTexture;
  uniform mat4 u_InvViewMatrix;

  void main() {
    vec3 n = normalize(v_Normal);
    vec3 v = -normalize(v_Position.xyz);
    float vdotn = dot(v, n);

    // vec3 r = 2.0*vdotn*n - v;
    // note that, the first parameter of reflect function is incoming direction, which is from SOURCE TOWARDS SURFACE!
    vec3 r = normalize(reflect(-v, n));
    r = vec3(u_InvViewMatrix * vec4(r, 0.0));

    gl_FragColor = textureCube(u_CubeMapTexture, r);
  }
#endif