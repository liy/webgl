precision mediump float;

uniform sampler2D u_Sampler;

varying vec4 v_Position;
varying vec2 v_TexCoord;

void main(){
  // No gamma correction, the texture normally will be gamma encoded(1.0/2.2)
  // gl_FragColor = texture2D(u_Sampler, v_TexCoord);
  // 
  // Translate texture data(normally gamma encoded 1.0/2.2) into linear space, getting ready for applying lighting
  gl_FragColor = pow(texture2D(u_Sampler, v_TexCoord), vec4(2.2));
  
  // No gamma correction, linear space colour 
  // gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
  // 
  // Gamma corrected, translate linear space colour to gamma space to compensate the monitor's 2.2 display curve.
  // gl_FragColor = pow(vec4(0.5, 0.5, 0.5, 1.0), vec4(1.0/2.2));
}