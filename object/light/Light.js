// by default position directional light, from (1, 1, 1)
function Light(){
  Object3D.call(this);

  this.enabled = true;

  // whether this light cast shadow or not
  this._castShadow = false;
  this.depthTextureSize = 512;

  // vec4
  this.ambient = vec4.fromValues(0.05, 0.05, 0.05, 1.0);
  // vec4
  this.diffuse = vec4.fromValues(0.95, 0.95, 0.95, 1.0);
  // vec4
  this.specular = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
  // vec3, constant, linear and quadratic
  this.attenuation = vec3.fromValues(1, 0, 0);
  // vec3
  // if any of x, y, z are non-zero, it is spot light
  this.direction = vec3.create();
  this._transformedDirection = vec3.create();

  // shadow map requires the view matrix from the light
  this._viewMatrix = mat4.create();
  this._projectionMatrix = mat4.create();
  this._camera = new PerspectiveCamera(this._outerRadian*2, 1);

  this._modelViewMatrix = mat4.create();

  // if 0, then this light is a directional, if it 1, it is a point or spot light
  this.directional = 1;
}
var p = Light.prototype = Object.create(Object3D.prototype);

p.shadow = function(shader, framebuffer){

}

p.lit = function(shader){

}

Object.defineProperty(p, "castShadow", {
  set: function(value){
    // do nothing if not state changes.
    if(this._castShadow == value) return;

    // if cast shadow, create related depth texture and framebuffer
    if(value){
      // depth texture
      this.depthTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.depthTextureSize, this.depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

      // framebuffer
      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    // delete original texture and framebuffer
    else{
      gl.deleteFramebuffer(this.framebuffer);
      gl.deleteTexture(this.depthTexture);
    }

    this._castShadow = value;
  },
  get: function(){
    return this._castShadow;
  }
});