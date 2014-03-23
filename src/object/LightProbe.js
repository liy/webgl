define(function(require){
"use strict"

var Node = require('object/Node');
var LightProbePass = require('core/pipeline/LightProbePass');
var PerspectiveCamera = require('object/camera/PerspectiveCamera');
var TextureCube = require('texture/TextureCube');
var SynthesisPass = require('core/pipeline/SynthesisPass');
var Shader = require('assets/resource/Shader');
var RenderPass = require('core/pipeline/RenderPass');
var CubeGeometry = require('geometry/CubeGeometry');
var Material = require('material/Material');
var SphereGeometry = require('geometry/SphereGeometry');

var LightProbe = function(size){
  Node.call(this);

  // keep capturing every frame
  this.dynamic = true;
  // whether the light probe captured the scene.
  this.captured = false;

  // width and height value
  this.width = this.height = size || LightProbePass.instance.defaultProbeWidth;

  this.camera = new PerspectiveCamera(Math.PI/2, 1, 0.1, 100);
  this.add(this.camera);

  this.cubeTexture = new TextureCube();
  this.cubeTexture.complete = true;

  // in order to save memory, light probe will share depth and stencil buffer
  this.depthBuffer = LightProbePass.instance.depthBuffer;
  this.depthStencilBuffer = LightProbePass.instance.depthStencilBuffer;
  this.geometryPass = LightProbePass.instance.geometryPass;
  this.lightPass = LightProbePass.instance.lightPass;

  if(this.width !== LightProbePass.instance.defaultProbeWidth || this.height !== LightProbePass.instance.defaultProbeHeight){
    // Both depth target and depth stencil render buffer will be shared across all the render passes!
    this.depthBuffer = RenderPass.createColorDepthTexture(this.width, this.height);
    this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.width, this.height);

    // geometry and light pass to render each side
    this.geometryPass = new GeometryPass({
      width: this.width,
      height: this.height,

      init: (function(depthBuffer, depthStencilRenderBuffer){
        return function(){
          this.shader = new Shader(require('text!shader/geometry.glsl'));

          this.export.albedoBuffer = RenderPass.createColorTexture(this.width, this.height);
          this.export.normalBuffer = RenderPass.createColorTexture(this.width, this.height);
          this.export.specularBuffer = RenderPass.createColorTexture(this.width, this.height);

          this.framebuffer = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.albedoBuffer.glTexture, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.normalBuffer.glTexture, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+2, gl.TEXTURE_2D, this.export.specularBuffer.glTexture, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+3, gl.TEXTURE_2D, depthBuffer.glTexture, 0);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, depthStencilRenderBuffer);
          gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT0+1, gl.COLOR_ATTACHMENT0+2, gl.COLOR_ATTACHMENT0+3]);
        }
      })(this.depthBuffer, this.depthStencilRenderBuffer)
    });

    this.lightPass = new LightPass({
      inputs: [this.geometryPass],
      width: this.width,
      height: this.height,

      init: (function(depthBuffer){
        return function(){
          this.pointLightShader = new Shader(require('text!shader/light/point.glsl'));
          this.dirLightShader = new Shader(require('text!shader/light/directional.glsl'));
          this.stencilShader = new Shader(require('text!shader/stencil.glsl'));

          this.export.diffuseLightBuffer = RenderPass.createColorTexture(this.width, this.height);
          this.export.specularLightBuffer = RenderPass.createColorTexture(this.width, this.height);

          this.depthBuffer = depthBuffer;

          this.framebuffer = gl.createFramebuffer();
          gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.export.diffuseLightBuffer.glTexture, 0);
          gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+1, gl.TEXTURE_2D, this.export.specularLightBuffer.glTexture, 0);
          gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
          gl.drawBuffersWEBGL([gl.COLOR_ATTACHMENT0+0, gl.COLOR_ATTACHMENT0+1]);
        }
      })(this.depthBuffer)
    });
  }


  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
  // LightProbes does not share the finial texture!
  this.synthesisPass = new SynthesisPass({
    inputs: [this.geometryPass, this.lightPass],
    width: this.width,
    height: this.height,

    init: (function(depthStencilRenderBuffer, cubeTexture, framebuffer){
      return function(){
        this.synthesisShader = new Shader(require('text!shader/probe/probe_synthesis.glsl'));
        this.skyBoxShader = new Shader(require('text!shader/skybox.glsl'));

        this.export.compositeBuffer = RenderPass.createColorTexture(this.width, this.height);

        this.framebuffer = framebuffer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
        // create texture for each face of cubemap
        cubeTexture.bind();
        for(var i=0; i<6; ++i){
          gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }
        cubeTexture.unbind();
      }
    })(this.depthStencilRenderBuffer, this.cubeTexture, this.framebuffer)
  });


  this.rotations = [
    // right, GL_TEXTURE_CUBE_MAP_POSITIVE_X
    { x:0, y:-Math.PI/2, z:Math.PI },
    // left, GL_TEXTURE_CUBE_MAP_NEGATIVE_X
    { x:0, y:Math.PI/2, z:Math.PI },
    // top, GL_TEXTURE_CUBE_MAP_POSITIVE_Y
    { x:Math.PI/2, y:0, z:0 },
    // bottom, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
    { x:-Math.PI/2, y:0, z:0 },
    // back, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
    { x:0, y:-Math.PI, z:Math.PI },
    // front, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
    { x:0, y:0, z:Math.PI }
  ];

  // TODO: create coefficient texture

  // mesh to display light probe, for testing
  // var material = new Material();
  // material.setCubeTexture(this.cubeTexture);
  // this.mesh = new Mesh(new SphereGeometry(0.5,30,30), material);
  // this.add(this.mesh);

  // model view matrix
  this.modelViewMatrix = mat4.create();
  // for normal transformation and tangent transformation
  this.normalMatrix = mat3.create();

  this.geometry = new SphereGeometry(0.5, 30, 30);
  // this.geometry = new CubeGeometry();
  this.material = new Material();
  this.material.textures.cubeMap = this.cubeTexture;

  this.createBuffer();
}
var p = LightProbe.prototype = Object.create(Node.prototype);

p.capture = function(scene){
  // if(this.dynamic || !this.captured){
  //   this.cubeTexture.bind();
  //   // draw 6 faces
  //   for(var i=0; i<6; ++i){
  //     // update camera direction
  //     this.camera.rotationX = this.rotations[i].x;
  //     this.camera.rotationY = this.rotations[i].y;
  //     this.camera.rotationZ = this.rotations[i].z;
  //     // since the camera rotation is changed after DeferredRender perform model matrix update, we need to update its matrix manually.
  //     this.camera.update();
  //     // update scene object's view dependent matrix using current light probe's camera setup.
  //     scene.updateViewMatrix(this.camera);

  //     // draw side
  //     this.geometryPass.render(scene, this.camera);
  //     this.lightPass.render(scene, this.camera);

  //     gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  //     gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, this.cubeTexture.glTexture, 0);
  //     this.synthesisPass.render(scene, this.camera);
  //   }
  //   this.cubeTexture.unbind();

  //   this.captured = true;
  // }
}

p.generateCoefficients = function(){

}










p.createBuffer = function(){
  this.geometry.computeFaceNormal();
  // compute vertex normal, if there is no vertex normal defined
  // if(this.geometry.normals.length === 0)
    this.geometry.computeVertexNormal();

  // vertices information
  var data = [];
  var len = this.geometry.vertices.length;
  for(var i=0; i<len; ++i){
    // vertex
    var v = this.geometry.vertices[i];
    data.push(v[0]);
    data.push(v[1]);
    data.push(v[2]);

    // normal
    if(this.geometry.normals.length !== 0){
      var n = this.geometry.normals[i];
      data.push(n[0]);
      data.push(n[1]);
      data.push(n[2]);
    }

    // texCoords
    if(this.geometry.texCoords.length !== 0){
      var t = this.geometry.texCoords[i];
      data.push(t[0]);
      data.push(t[1]);
    }
  }

  // create the buffer contains all the data
  this.buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  // index information
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.geometry.indexData), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

p.createVertexArray = function(shader){
  // vertex array buffer object, needs extension support! For simplify the attribute binding
  this.vao = gl.createVertexArrayOES();
  gl.bindVertexArrayOES(this.vao);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);

  // calculate stride bytes
  var strideBytes = 12;
  if(this.geometry.normals.length !== 0)
    strideBytes += 12;
  if(this.geometry.texCoords.length !== 0)
    strideBytes += 8;

  // starting point of each attribute data
  var pointerOffset = 0;
  // vertex
  gl.enableVertexAttribArray(shader.attributes.a_Vertex);
  gl.vertexAttribPointer(shader.attributes.a_Vertex, 3, gl.FLOAT, false, strideBytes, pointerOffset);

  // normal
  if(this.geometry.normals.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Normal);
    gl.vertexAttribPointer(shader.attributes.a_Normal, 3, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // texture coordinate
  if(this.geometry.texCoords.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_TexCoord);
    gl.vertexAttribPointer(shader.attributes.a_TexCoord, 2, gl.FLOAT, false, strideBytes, pointerOffset+=12);
  }

  // index information
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.bindVertexArrayOES(null);
}

p.uploadUniforms = function(shader){
  shader.mat4('u_ModelMatrix', this.worldMatrix);
  shader.mat4('u_ModelViewMatrix', this.modelViewMatrix);
  shader.mat3('u_NormalMatrix', this.normalMatrix);

  if(this.material)
    this.material.uploadUniforms(shader);
}

p.draw = function(shader){
  // Any better way to setup vertex array object? It needs shader attributes access...
  if(this.vao === undefined)
    this.createVertexArray(shader);

  this.uploadUniforms(shader);

  gl.bindVertexArrayOES(this.vao);
  gl.drawElements(gl.TRIANGLES, this.geometry.indexData.length, gl.UNSIGNED_SHORT, 0);
  gl.bindVertexArrayOES(null);
}

return LightProbe
});