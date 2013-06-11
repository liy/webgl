precision mediump float;

varying vec3 v_Normal;

void main(){
  // since the texture color component value is in the range of [0, 1],
  // but the normalized normal's component value is in the range of [-1, 1].
  // We must convert the normal to the correct [0, 1] range for storing in texture.
  vec3 normal = normalize(v_Normal);
  gl_FragColor = vec4((normal+1.0) * 0.5, 1.0);
}