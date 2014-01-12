function MRTDebugger(renderer){
  this.enabled = true;

  this.program = gl.createProgram();
  this.shader = new Shader(this.program, 'shader/debugger.vert', 'shader/debugger.frag');

  this.renderer = renderer;

  this.createViews();
  this.camera = new OrthoCamera(0, window.innerWidth, 0, window.innerHeight);

  document.addEventListener('keyup', this.onKeyDown);
  window.addEventListener('resize', bind(this, this.resize));
}
var p = MRTDebugger.prototype;

p.render = function(){
  if(this.enabled){
    gl.useProgram(this.program);
    this.shader.locateAttributes(this.program);
    this.shader.locateUniforms(this.program);

    gl.disable(gl.DEPTH_TEST);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    // make views transparent
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    // FIXME: for some reason the result texture from framebuffer is upside down, have to flip Y and ensure the back face cull is disabled
    gl.disable(gl.CULL_FACE);

    this.camera.updateMatrix();
    this.camera.setUniforms(this.shader.uniforms);

    for(var i=0; i<this.viewPanes.length; ++i){
      // manually update local and world matrix
      this.viewPanes[i].updateMatrix();

      // use ortho camera's view matrix calculate the model view matrix
      mat4.mul(this.viewPanes[i].modelViewMatrix, this.camera.worldMatrix, this.viewPanes[i].worldMatrix);

      this.viewPanes[i].draw(this.shader, this.camera);
    }

    // re-enable back face cull
    gl.enable(gl.CULL_FACE);
    gl.disable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
  }
}

p.onKeyDown = function(e){
  // console.log(e.keyCode);
  switch(e.keyCode){
    // normal target, 1
    case 49:
    this.state = MRTDebugger.normal;
    break;
    // depth target, 2
    case 50:
    this.state = MRTDebugger.depth;
    break;
    // albedo target, 3
    case 51:
    this.state = MRTDebugger.albedo;
    break;
    // show all targets, 4
    case 52:
    this.state = MRTDebugger.all;
    break;
    // enabled, space
    case 32:
    this.enabled = !this.enabled;
    break;
  }
}

p.resize = function(e){
  var height = window.innerHeight * this.viewHeightScale;
  var width = window.innerWidth/window.innerHeight * height;
  var tx = 0;
  for(var i=0; i<this.viewPanes.length; ++i){
    this.viewPanes[i].scaleX = width/this.viewPanes[i].geometry.width;
    // FIXME: for some reason the result texture from framebuffer is upside down, have to flip Y and ensure the back face cull is disabled
    this.viewPanes[i].scaleY = -height/this.viewPanes[i].geometry.height;
    this.viewPanes[i].x = width/2 + tx;
    this.viewPanes[i].y = height/2;
    this.viewPanes[i].z = 2;
    tx += width;
  }

  this.camera.ortho(0, window.innerWidth, 0, window.innerHeight);
}

p.createViews = function(){
  // create viewPanes
  this.viewHeightScale = 0.2;
  var height = window.innerHeight * this.viewHeightScale;
  var width = window.innerWidth/window.innerHeight * height;
  var tx = 0;
  this.viewPanes = [];
  for(var i=0; i<this.renderer.passes.length; ++i){
    this.viewPanes[i] = new Mesh(new PlaneGeometry(width, height), new PhongMaterial({texture: this.renderer.passes[i].texture}));
    this.viewPanes[i].x = width/2 + tx;
    this.viewPanes[i].y = height/2;
    this.viewPanes[i].z = 2;
    // FIXME: for some reason the result texture from framebuffer is upside down, have to flip Y and ensure the back face cull is disabled
    this.viewPanes[i].scaleY = -1;
    tx += width;
  }
}