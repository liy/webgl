precision mediump float;

// uniform sampler2D texture0;
// uniform sampler2D texture1;
// uniform sampler2D texture2;

uniform sampler2D textures[3];

varying vec2 v_TexCoord;

void main(){
  // gl_FragColor = texture2D(textures[0], v_TexCoord) + texture2D(textures[1], v_TexCoord) + texture2D(textures[2], v_TexCoord);
  // gl_FragColor = vec4(texture2D(textures[0], v_TexCoord).rgb, 1.0) * texture2D(textures[1], v_TexCoord);
  gl_FragColor = texture2D(textures[1], v_TexCoord);
  // gl_FragColor = texture2D(textures[2], v_TexCoord);
}