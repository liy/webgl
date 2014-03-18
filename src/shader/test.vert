precision highp float;

#include one.glsl
#include three.glsl
#include four.glsl

uniform mat4 worldViewProjection : WORLDVIEWPROJECTION;

uniform vec2 uvRepeat : [1.0, 1.0];

attribute vec2 texcoord : TEXCOORD_0;
attribute vec3 position : POSITION;

attribute vec3 barycentric;

#ifdef SKINNING
attribute vec3 weight : WEIGHT;
attribute vec4 joint : JOINT;

uniform mat4 skinMatrix[JOINT_NUMBER]: SKIN_MATRIX;
#endif

varying vec2 v_Texcoord;
varying vec3 v_Barycentric;

void main()
{

    vec3 skinnedPosition = position;

    v_Texcoord = texcoord * uvRepeat;
    v_Barycentric = barycentric;

    gl_Position = worldViewProjection * vec4(skinnedPosition, 1.0);
}