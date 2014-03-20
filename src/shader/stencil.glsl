precision mediump float;

uniform mat4 u_ModelViewMatrix;
uniform mat4 u_ProjectionMatrix;

#ifdef VERTEX_SHADER
  // in the range of 0 to 1
  attribute vec3 a_Vertex;

  void main(){
    gl_Position = u_ProjectionMatrix * u_ModelViewMatrix * vec4(a_Vertex, 1.0);
  }
#endif


#ifdef FRAGMENT_SHADER
  void main(){
    // gl_FragColor = vec4(1,1,1,1);
  }
#endif