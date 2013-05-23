precision mediump float;

varying vec3 v_Normal;

void main(){
  gl_FragColor = vec4(normalize(v_Normal), 1.0);
}