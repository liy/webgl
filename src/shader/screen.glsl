precision mediump float;

uniform sampler2D compositeBuffer;

varying vec2 v_TexCoord;

/**
 * final composition
 */

#ifdef VERTEX_SHADER
  attribute vec2 a_Vertex;
  attribute vec2 a_TexCoord;

  void main(){
    gl_Position = vec4(a_Vertex, 0.0, 1.0);
    v_TexCoord = a_TexCoord;
  }
#endif


#ifdef FRAGMENT_SHADER
  void main(){
    gl_FragColor = texture2D(compositeBuffer, v_TexCoord);
  }
#endif