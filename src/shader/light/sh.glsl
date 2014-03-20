precision mediump float;

#include common.glsl

varying vec2 v_TexCoord;
varying vec2 v_Position;

// For restore eye space position.
// The idea is having the ray from the eye position(origin), point towards fragments.
// Once we get the eye position z in fragment shader, simply multiply the v_EyeRay by
// the amount recovers the original eye space position x, y z.
varying vec3 v_EyeRay;


#ifdef VERTEX_SHADER
  attribute vec2 a_Vertex;
  attribute vec2 a_TexCoord;

  void main(){
    gl_Position = vec4(a_Vertex, 0.0, 1.0);
    v_TexCoord = a_TexCoord;
    v_Position = a_Vertex;

    // the v_TexCoord in the range of [0, 1].
    // We need to make the ray's x and y to be in the range of [-1, 1], so it covers the
    // whole screen.
    v_EyeRay = vec3(2.0*a_TexCoord - 1.0, -1.0);
  }
#endif


#ifdef FRAGMENT_SHADER
  uniform sampler2D albedoTarget;
  uniform sampler2D normalTarget;
  uniform sampler2D specularTarget;
  uniform sampler2D depthColorTarget;

  // scene projection matrix
  uniform mat4 u_ProjectionMatrix;
  // Invert of the scene projection matrix. Apply to the clip-space coordinate to yield eye-space coordinate.
  uniform mat4 u_InvProjectionMatrix;

  struct Light {
    vec3 color;
    vec3 direction;
    bool enabled;
  };

  uniform Light u_Light;

  vec3 fresnel(vec3 F0, float vdoth){
    return F0 + (1.0 - F0) * pow(1.0-max(vdoth, 0.0), 5.0);
  }


  float linearEyeSpaceDepth(){
    // depth texture value is [0, 1], convert to [-1, 1], normalized device coordinate
    float zn = unpack(texture2D(depthColorTarget, v_TexCoord)) * 2.0 - 1.0;

    // calculate clip-space coordinate: http://stackoverflow.com/questions/14523588/calculate-clipspace-w-from-clipspace-xyz-and-inv-projection-matrix
    // http://web.archive.org/web/20130416194336/http://olivers.posterous.com/linear-depth-in-glsl-for-real
    //
    // |  -   -   -   - |     | Xe |       | Xc |       | Xc/-Ze|   | Xn |
    // |  -   -   -   - |  *  | Ye |   =   | Yc |  ==>  | Yc/-Ze| = | Yn |
    // |  0   0   a   b |     | Ze |       | Zc |       | Zc/-Ze|   | Zn |
    // |  0   0  -1   0 |     |  1 |       |-Ze |
    //
    // Zn = Zc/-Ze = (a*Ze + b)/-Ze
    // Zn = (a*Ze + b)/-Ze
    //
    // Therefore:
    // Ze = -b/(Zn + a)
    //
    // clip-space coordinate will be:
    // | Xc | = | Xn * -Ze |
    // | Yc | = | Yn * -Ze |
    // | Zc | = | Zn * -Ze |
    // | Wc | = | -Ze      |

    // u_ProjectionMatrix[2][2] can be also written as u_ProjectionMatrix[2].z
    float a = u_ProjectionMatrix[2][2];
    float b = u_ProjectionMatrix[3][2];
    // float zNear = - b / (1.0 - a);
    // float zFar = b/(1.0 + a);
    float ze = -b/(zn + a);

    return -ze;
  }

  /**
   * Using eye ray to recover the eye space position, avoid inverse projection matrix computation, and transformation.
   */
  vec3 getEyeSpacePosition(){
    // http://www.opengl.org/wiki/Compute_eye_space_from_window_space#Optimized_method_from_XYZ_of_gl_FragCoord
    return normalize(v_EyeRay) * linearEyeSpaceDepth();
  }










  const float ScaleFactor = 1.0;

  const float C1 = 0.429043;
  const float C2 = 0.511664;
  const float C3 = 0.743125;
  const float C4 = 0.886227;
  const float C5 = 0.247708;

  // Constants for Old Town Square lighting
  // const vec3 L00  = vec3( 0.871297,  0.875222,  0.864470);
  // const vec3 L1m1 = vec3( 0.175058,  0.245335,  0.312891);
  // const vec3 L10  = vec3( 0.034675,  0.036107,  0.037362);
  // const vec3 L11  = vec3(-0.004629, -0.029448, -0.048028);
  // const vec3 L2m2 = vec3(-0.120535, -0.121160, -0.117507);
  // const vec3 L2m1 = vec3( 0.003242,  0.003624,  0.007511);
  // const vec3 L20  = vec3(-0.028667, -0.024926, -0.020998);
  // const vec3 L21  = vec3(-0.077539, -0.086325, -0.091591);
  // const vec3 L22  = vec3(-0.161784, -0.191783, -0.219152);
  const vec3 L00  = vec3( 0.79, 0.44, 0.54);
  const vec3 L1m1 = vec3( 0.39, 0.35, 0.60);
  const vec3 L10  = vec3( -0.34,-0.18,-0.27);
  const vec3 L11  = vec3(-0.29, -0.06, 0.01);
  const vec3 L2m2 = vec3(-0.11, -0.05, -0.12);
  const vec3 L2m1 = vec3(-0.26, -0.22, -0.47);
  const vec3 L20  = vec3(-0.16, -0.09, -0.15);
  const vec3 L21  = vec3(0.56, 0.21, 0.14);
  const vec3 L22  = vec3(0.21, -0.05, -0.30);



  void main(){
    vec3 materialSpecular = texture2D(specularTarget, v_TexCoord).rgb;
    vec4 albedo = texture2D(albedoTarget, v_TexCoord);

    vec3 eyeSpacePosition = getEyeSpacePosition();

    vec3 v = -normalize(eyeSpacePosition);
    vec3 l = normalize(u_Light.direction);
    vec3 n = texture2D(normalTarget, v_TexCoord).xyz * 2.0 - 1.0;
    vec3 h = normalize(l + v);

    float ndoth = dot(n, h);


    vec4 specularTerm = pow(max(ndoth, 0.0), 8.0) * vec4(materialSpecular, 1.0);

    vec3 DiffuseColor =  C1 * L22 * (n.x * n.x - n.y * n.y) +
                      C3 * L20 * n.z * n.z +
                      C4 * L00 -
                      C5 * L20 +
                      2.0 * C1 * L2m2 * n.x * n.y +
                      2.0 * C1 * L21  * n.x * n.z +
                      2.0 * C1 * L2m1 * n.y * n.z +
                      2.0 * C2 * L11  * n.x +
                      2.0 * C2 * L1m1 * n.y +
                      2.0 * C2 * L10  * n.z;
    gl_FragColor = vec4(DiffuseColor*0.8, 1.0);
  }
#endif