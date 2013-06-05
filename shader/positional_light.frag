precision mediump float;

varying vec4 v_Color;
varying vec4 v_FragCoord;

// depth, normal and albedo(texture) passes rendered textures
uniform sampler2D u_Sampler[3];

// scene projection matrix
uniform mat4 u_ProjectionMatrix;
// Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
uniform mat4 u_InvProjectionMatrix;

vec2 getTexCoord(){
  return (v_FragCoord.xy + 1.0) * 0.5;
}

void main(){
  vec2 texCoord = getTexCoord();

  vec4 color = texture2D(u_Sampler[1], texCoord);
  gl_FragColor = color;
  // gl_FragColor = vec4(texCoord.xy, 0.0, 1.0);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}