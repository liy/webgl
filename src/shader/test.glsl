precision highp float;

#include common.glsl

uniform mat4 worldViewProjection : WORLDVIEWPROJECTION;
uniform vec2 uvRepeat : [1.0, 1.0];

#ifdef SKINNING
uniform mat4 skinMatrix[JOINT_NUMBER]: SKIN_MATRIX;
#endif

varying vec2 v_Texcoord;
varying vec3 v_Barycentric;


#ifdef VERTEX_SHADER
  attribute vec2 texcoord : TEXCOORD_0;
  attribute vec3 position : POSITION;
  attribute vec3 barycentric;

  #ifdef SKINNING
    attribute vec3 weight : WEIGHT;
    attribute vec4 joint : JOINT;
  #endif

  void main()
  {

      vec3 skinnedPosition = position;

      v_Texcoord = texcoord * uvRepeat;
      v_Barycentric = barycentric;

      gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0);
  }
#endif

#ifdef FRAGMENT_SHADER
  void main(){
    gl_FragColor = vec4(1,1,1,1);
  }
#endif