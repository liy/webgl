precision mediump float;

uniform sampler2D sampler;

uniform float u_Kernel[9];
uniform vec2 u_CanvasSize;

varying vec3 v_Normal;
varying vec2 v_TexCoord;
varying vec4 v_Position;

void main(){
  // vec2 pixel = vec2(1.0, 1.0)/u_CanvasSize;

  // vec4 colorSum = texture2D(sampler, v_TexCoord + pixel * vec2(-1, -1)) * u_Kernel[0] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 0, -1)) * u_Kernel[1] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 1, -1)) * u_Kernel[2] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2(-1,  0)) * u_Kernel[3] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 0,  0)) * u_Kernel[4] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 1,  0)) * u_Kernel[5] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2(-1,  1)) * u_Kernel[6] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 0,  1)) * u_Kernel[7] +
  //                 texture2D(sampler, v_TexCoord + pixel * vec2( 1,  1)) * u_Kernel[8];

  // float kernelWeight = u_Kernel[0] + u_Kernel[1] + u_Kernel[2] + u_Kernel[3] + u_Kernel[4] + u_Kernel[5] + u_Kernel[6] + u_Kernel[7] + u_Kernel[8];

  // if (kernelWeight <= 0.0)
  //   kernelWeight = 1.0;

  // gl_FragColor = vec4((colorSum / kernelWeight).rgb, 1.0);

  gl_FragColor = texture2D(sampler, v_TexCoord);
}