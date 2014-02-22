"use strict"
var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );

var renderer = new DeferredRenderer();

var scene = new Scene();

var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.01, 5);
var cameraRadian = 0.0;
var rotationRadius = 1.75;
// camera.y = -0.07;
camera.z = rotationRadius;
function rotateCamera(){
  cameraRadian += 0.003;
  camera.x = Math.cos(cameraRadian) * rotationRadius;
  camera.z = Math.sin(cameraRadian) * rotationRadius;
}
camera.lookTarget = vec3.fromValues(0, camera.y, 0);
scene.add(camera);

var p3 = new DirectionalLight();
p3.z = 1;
p3.x = 1;
p3.y = 1;
scene.add(p3);

// var p1 = new PointLight();
// p1.x = 0.2;
// p1.z = 0.2;
// p1.color = vec3.fromValues(1.0, 0.2, 0.0);

// var p2 = new PointLight();
// p2.x = -0.2;
// p2.z = 0.2;
// p2.color = vec3.fromValues(0.0, 0.8, 1.0);

// scene.add(p1);
// scene.add(p2);

setTimeout(init1, 1000);

function init1(){
  console.log('init 1');

  var loader = new ObjectFile();
  loader.load("../webgl-meshes/head/head.obj");
  var obj = loader.object;
  obj.x = 0.6;
  scene.add(obj);

  setTimeout(init2, 2000);
}

function init2(){
  console.log('init 2');
  var skyBox = new SkyBox([
    {url: "../webgl-meshes/cube_map/posx.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_X},
    {url: "../webgl-meshes/cube_map/negx.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X},
    {url: "../webgl-meshes/cube_map/posy.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y},
    {url: "../webgl-meshes/cube_map/negy.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y},
    {url: "../webgl-meshes/cube_map/posz.jpg", face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z},
    {url: "../webgl-meshes/cube_map/negz.jpg", face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z}
  ]);
  scene.add(skyBox);

  setTimeout(init3, 2000);
}

function init3(){
  console.log('init 3');

  var probe = new LightProbe();
  scene.add(probe);

  setTimeout(render, 2000);
}


function render(){
  stats.begin();

  rotateCamera();

  // obj.rotationY += 0.003;

  renderer.render(scene, camera);

  stats.end();
  requestAnimFrame(render);
}







// var FACTORIAL = [1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368000,20922789888000,355687428096000,
// 6402373705728000,121645100408832000,2432902008176640000,51090942171709440000,1124000727777607680000,25852016738884976640000,620448401733239439360000,
// 15511210043330985984000000,403291461126605635584000000,10888869450418352160768000000,304888344611713860501504000000,8841761993739701954543616000000,
// 265252859812191058636308480000000,8222838654177922817725562880000000,263130836933693530167218012160000000,8683317618811886495518194401280000000]

// function SHSample(sqrtSamples, numBands){
//   // store all the samples
//   var samples = new Array(sqrtSamples*sqrtSamples);

//   var index = 0;
//   var oneOverN = 1/sqrtSamples;
//   for(var i=0; i<sqrtSamples; ++i){
//     for(var j=0; j<sqrtSamples; ++j){
//       // chop domain into sqrtSamples*sqrtSamples number of square, pick random sample in each square.
//       var x = (i+Math.random()) * oneOverN;
//       var y = (j+Math.random()) * oneOverN;
//       // not sure why I need acos.
//       var theta = 2 * Math.acos(Math.sqrt(1-x));
//       // y starts from 0, to 1; phi starts from 0 to 2 pi
//       var phi = 2*Math.PI * y;

//       // sample object contains the sample information
//       var sample = {
//         sphere: vec3.fromValues(theta, phi, 1),
//         dir: vec3.fromValues(Math.sin(theta)*Math.cos(phi), Math.sin(theta)*Math.sin(phi), Math.cos(theta)),
//         // stores Spherical harmonics values(basis function's result, length 9 if we choose band 2), so later we can multiply to the rendering equation and using
//         // monte carlo estimator to sum them all to produce a series(9 if we choose band 2) of coefficients which approximate the diffuse map.
//         basis: []
//       }

//       // Generate a sequence of SH values(basis function's result) for this sample.
//       for(var l=0; l<numBands; ++l){
//         for(var m=-l; m<=l; ++m){
//           sample.basis.push(sh(l, m, theta, phi));
//         }
//       }

//       // console.log(sample.basis);

//       samples[index] = sample;
//       ++index;
//     }
//   }

//   return samples;
// }

// /**
//  * evaluate an Associated Legendre Polynomial P(l,m,x) at x
//  * @param  {[type]} l [description]
//  * @param  {[type]} m [description]
//  * @param  {[type]} x [description]
//  * @return {[type]}
//  */
// function p(l, m, x){
//   // p00 = 1
//   var pmm = 1;

//   // rule 2, since m always < l. We can directly calculate the polynomial value when m == l.
//   // But because l should be non-negative, we have to make sure m is non-negative before doing the process.
//   if(m>0) {
//     var somx2 = Math.sqrt((1-x)*(1+x));
//     // TODO: double factorial: 1,3,5,7,9... might be better to use a table
//     var fact = 1;
//     for(var i=1; i<=m; ++i) {
//       pmm *= (-fact) * somx2;
//       fact += 2;
//     }
//   }
//   // catch the case l == m, simply return P
//   if(l===m)
//     return pmm;

//   // rule 3 to rise the band l by 1
//   var pmmp1 = x * (2*m+1) * pmm;
//   // catch the case that l == m+1
//   if(l===m+1)
//     return pmmp1;

//   // rule 1, keep increasing l, until l reaches target l
//   var pll = 0;
//   for(var ll=m+2; ll<=l; ++ll) {
//     pll = ( (2*ll-1)*x*pmmp1-(ll+m-1)*pmm ) / (ll-m);
//     pmm = pmmp1;
//     pmmp1 = pll;
//   }
//   return pll;
// }

// /**
//  * normalization factor
//  * @param  {[type]} l [description]
//  * @param  {[type]} m [description]
//  * @return {[type]}   [description]
//  */
// function k(l, m){
//   // renormalization constant for SH function
//   return Math.sqrt(((2*l+1)*FACTORIAL[l-m]) / (4*Math.PI*FACTORIAL[l+m]));
// }

// /**
//  * Calculate the value using the Spherical Harmonic basis function
//  * @param  {[type]} l     [description]
//  * @param  {[type]} m     [description]
//  * @param  {[type]} theta [description]
//  * @param  {[type]} phi   [description]
//  * @return {[type]}       [description]
//  */
// function sh(l, m, theta, phi){
//   if(m>0)
//     return Math.SQRT2 * k(l, m) * Math.cos(m*phi) * p(l, m, Math.cos(theta));
//   else if(m<0)
//     // note that normalization function k() expect a absolute value of m. Just invert the sign.
//     return Math.SQRT2 * k(l, -m) * Math.sin(-m*phi) * p(l, -m, Math.cos(theta));
//   else
//     return k(l,0) * p(l, 0, Math.cos(theta));
// }

// function shProjection(samples, numCoefficients){
//   // The final coefficients approximate diffuse environment map data.
//   var coefficients = Array.apply(null, new Array(numCoefficients)).map(Number.prototype.valueOf, 0);

//   // loop through all samples, sum the light function result multiply the SH function result through all basis functions
//   var numSamples = samples.length;
//   for(var i=0; i<numSamples; ++i){
//     var theta = samples[i].sphere[0];
//     var phi = samples[i].sphere[1];

//     // summation of the light()*SH() through all the basis functions
//     for(var j=0; j<numCoefficients; ++j){
//       coefficients[j] += light(theta, phi) * samples[i].basis[j];
//     }
//   }

//   // since the samples are unbiased, the probably density function represents the relative probability
//   // picking a point on the sphere surface, they are equal probability, so it is pdf(x) = 1/(4*PI).
//   // Monte Carlo estimator use 1/pdf(x), called weight, so it is 4*PI.
//   var weight = 4*Math.PI;
//   // TODO: combine weight and the factor together.
//   var factor = weight/numSamples;

//   // divide by the weight/number of sample according to Monte Carlo estimator
//   for(var i=0; i<numCoefficients; ++i){
//     coefficients[i] *= factor;
//   }

//   return coefficients;
// }

// // just a light testing function produce two low frequency spot lights
// function light(theta, phi){
//   return Math.max(0, 5*Math.cos(theta)-4) + Math.max(0, -4*Math.sin(theta-Math.PI)*Math.cos(phi-2.5)-3);
// }

// // just a util function to get num of coefficients(or number of basis function) will be produced
// // for number of bands used.
// function numCoefficients(numBands){
//   return numBands*numBands;
// }


// console.time('sh');
// var numBands = 3;
// var sqrtSamples = 100;
// var samples = SHSample(sqrtSamples, numBands);
// var coefficients = shProjection(samples, numCoefficients(numBands));
// console.timeEnd('sh');
// console.log(coefficients);