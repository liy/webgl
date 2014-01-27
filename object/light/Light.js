// by default position directional light, from (1, 1, 1)
function Light(){
  Object3D.call(this);

  // model view matrix
  this.modelViewMatrix = mat4.create();

  this.enabled = true;

  // whether this light cast shadow or not
  this._castShadow = false;
  this.framebufferSize = 512;

  // color of the light
  this.color = vec3.fromValues(1.0, 1.0, 1.0);
  // intensity of the light
  this.intensity = 1.0;
}
var p = Light.prototype = Object.create(Object3D.prototype);

Object.defineProperty(p, "castShadow", {
  set: function(value){
    // do nothing if not state changes.
    if(this._castShadow == value) return;

    // if cast shadow, create related depth texture and framebuffer
    if(value){
      // depth texture
      this.colorTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.framebufferSize, this.framebufferSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

      this.depthTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, this.framebufferSize, this.framebufferSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_SHORT, null);

      this.framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
    // delete original texture and framebuffer
    else{
      gl.deleteTexture(this.depthTexture);
      gl.deleteFramebuffer(this.framebuffer);
    }

    this._castShadow = value;
  },
  get: function(){
    return this._castShadow;
  }
});