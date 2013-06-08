precision mediump float;

// clip space position, exactly the same as vertex shader's gl_Position
varying vec4 v_ClipSpacePosition;

// depth, normal and albedo(texture) passes rendered textures
uniform sampler2D u_Sampler[3];

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

vec3 getNDC(){
  return v_ClipSpacePosition.xyz/v_ClipSpacePosition.w;
}

vec2 getTexCoord(){
  return (v_ClipSpacePosition.xy/v_ClipSpacePosition.w + 1.0) * 0.5;
}

float getDepth(vec2 texCoord){
  // depth texture value is [0, 1], convert to [-1, 1]
  return texture2D(u_Sampler[0], texCoord).x*2.0 - 1.0;
}

void main(){
  vec3 ndc = getNDC();
  vec2 texCoord = getTexCoord();
  float depth = getDepth(texCoord);

    vec4 color = texture2D(u_Sampler[2], texCoord);
    gl_FragColor = color;

  // gl_FragColor += vec4(0.2, 0.2, 0.2, 1.0);
}