var stats = new Stats();
stats.setMode(0); // 0: fps, 1: ms
// Align top-left
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '0px';
document.body.appendChild( stats.domElement );


var renderer = new DeferredRenderer();

// var scene = new Scene();

// var camera = new PerspectiveCamera(Math.PI/3, renderer.canvas.width/renderer.canvas.height, 0.1, 300)
// scene.add(camera);
// camera.z = 100;

var loader = new NewObjLoader();
loader.load("../webgl-meshes/teapot/", "teapot.obj");
var mesh1 = loader.group;
mesh1.y = -30;
// scene.add(mesh1);

// function render(){
//   stats.begin();

//   mesh1.rotationY += 0.02;

//   renderer.render(scene, camera);

//   stats.end();
//   requestAnimFrame(render);
// }

// var loader = new TGALoader();
// loader.load('../webgl-meshes/crytek-sponza/textures/background.tga', onload);

// for(var i=0; i<5; ++i){
//   console.log(gl.TEXTURE_WRAP_S);
// }

// TextureManager.instance.addTexture2D('../webgl-meshes/crytek-sponza/textures/background.tga', 'background.tga');
// TextureManager.instance.load(onload);

// var data  = [["../webgl-meshes/sphere_map/pos-x.png", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
//              ["../webgl-meshes/sphere_map/neg-x.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
//              ["../webgl-meshes/sphere_map/pos-y.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
//              ["../webgl-meshes/sphere_map/neg-y.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
//              ["../webgl-meshes/sphere_map/pos-z.png", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
//              ["../webgl-meshes/sphere_map/neg-z.png", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]];

// var t1 = TextureManager.instance.add(data);
// var t2 = TextureManager.instance.add('../webgl-meshes/crytek-sponza/textures/background.tga');

// TextureManager.instance.load(function(){
//   console.log('all loaded');
//   console.log(TextureManager.instance.textureMap);
// });