const float pi = 3.1415926;


// linear lighting conversion
#ifdef GAMMA
  const float gamma = GAMMA;
#else
  const float gamma = 2.2;
#endif

vec4 toLinear(vec4 color) {
  return pow(color, vec4(gamma));
}

vec4 toRGB(vec4 color) {
  return pow(color, vec4(1.0/gamma));
}


// pack and unpack depth information into RGBA values.
// http://devmaster.net/posts/3002/shader-effects-shadow-mapping#vertex-tabs-3
const vec4 bitShifts = vec4(1.0,
                            1.0 / 255.0,
                            1.0 / (255.0 * 255.0),
                            1.0 / (255.0 * 255.0 * 255.0));

const vec4 bias = vec4(1.0 / 255.0,
                       1.0 / 255.0,
                       1.0 / 255.0,
                       0.0);

vec4 pack(float depth){
  float r = depth;
  float g = fract(r * 255.0);
  float b = fract(g * 255.0);
  float a = fract(b * 255.0);
  vec4 colour = vec4(r, g, b, a);

  return colour - (colour.yzww * bias);
}

float unpack (vec4 colour) {
  return dot(colour, bitShifts);
}