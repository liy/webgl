function MRTDebugger(renderer){
  this.renderer = renderer;
  this.shader = this.renderer.screenPass.shader;

  this.enabled = true;

  this.camera = new OrthoCamera(0, window.innerWidth, 0, window.innerHeight);

  this.createViews();

  document.addEventListener('keyup', this.onKeyDown);
  window.addEventListener('resize', bind(this, this.resize));
}
var p = MRTDebugger.prototype;

p.draw = function(){
  if(this.enabled){
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    this.camera.project(this.shader);

    for(var i=0; i<this.views.length; ++i){
      this.views[i].updateMatrix();

      // model view matrix of the views
      mat4.mul(this.views[i].modelViewMatrix, this.camera.worldMatrix, this.views[i].worldMatrix);

      gl.bindTexture(gl.TEXTURE_2D, this.renderer.targets[i].texture);
      this.views[i].draw(this.shader, this.camera);
    }

    gl.disable(gl.BLEND);
  }
}

p.onKeyDown = function(e){
  console.log(e.keyCode);
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
  for(var i=0; i<this.views.length; ++i){
    this.views[i].scaleX = width/this.views[i].geometry.width;
    this.views[i].scaleY = -height/this.views[i].geometry.height;
    this.views[i].x = width/2 + tx;
    this.views[i].y = height/2;

    tx += width;
  }

  this.camera.ortho(0, window.innerWidth, 0, window.innerHeight);
}

p.createViews = function(){
  // create views
  this.viewHeightScale = 0.2;
  var height = window.innerHeight * this.viewHeightScale;
  var width = window.innerWidth/window.innerHeight * height;
  var tx = 0;
  this.views = [];
  for(var i=0; i<this.renderer.targets.length; ++i){
    this.views[i] = new Mesh(new PlaneGeometry(width, height), new PhongMaterial());
    this.views[i].useColor = false;
    this.views[i].scaleY *= -1;
    this.views[i].x = width/2 + tx;
    this.views[i].y = height/2;

    tx += width;
  }
}