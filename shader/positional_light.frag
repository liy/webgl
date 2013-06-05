precision mediump float;

varying vec4 v_Color;
varying vec4 v_FragCoord;
varying vec4 v_Position;

// depth, normal and albedo(texture) passes rendered textures
uniform sampler2D u_Sampler[3];

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

vec3 getNDC(){
  return v_FragCoord.xyz/v_FragCoord.w;
}

vec2 getTexCoord(){
  return (v_FragCoord.xy/v_FragCoord.w + 1.0) * 0.5;
}

float getDepth(vec2 texCoord){
  // depth texture value is [0, 1], convert to [-1, 1]
  return texture2D(u_Sampler[0], texCoord).x*2.0 - 1.0;
}

void main(){
  vec3 ndc = getNDC();
  vec2 texCoord = getTexCoord();
  float depth = getDepth(texCoord);

  if(ndc.z < depth){
    vec4 color = texture2D(u_Sampler[2], texCoord);
    gl_FragColor = color;
  }
  else
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  // gl_FragColor = vec4(texCoord.xy, 0.0, 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}