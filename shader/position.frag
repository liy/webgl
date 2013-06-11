precision mediump float;

varying vec4 v_EyeSpacePosition;
varying vec4 v_WorldPosition;
varying vec4 v_ClipSpace;

void main(){
  // ****************
  // NOTICE that the eye position is not in the range of [0, 1]
  // you CANNOT sample this position texture to get the eye space position
  // this is just for debugging use only!!!!!!!!!!!!
  // ****************
  //
  gl_FragColor = vec4(v_EyeSpacePosition.xyz, 1.0);



  // If you really want to store position, better to store ndc, sample it, times w component convert to clip space, then apply the inverse of projection matrix.
  // This results the proper eye space position.
  //
  // w is -Ze, the depth in eye space. So divide it by the (far plane - near plane) should result a range between [0, 1].
  // vec3 ndc = vec3(v_ClipSpace.xyz/v_ClipSpace.w);
  // gl_FragColor = vec4((ndc+1.0) * 0.5, v_ClipSpace.w/(10.0 - 0.1));
}