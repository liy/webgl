"use strict"
function LightProbe(size){
  Node.call(this);

  // keep capturing every frame
  this.dynamic = true;
  // whether the light probe captured the scene.
  this.captured = false;

  // width and height value
  this.bufferWidth = this.bufferHeight = 128 || size;

  this.camera = new PerspectiveCamera(Math.PI/2, 1, 0.01, 5);
  this.add(this.camera);

  this.cubeTexture = new TextureCube();
  this.cubeTexture.ready = true;

  // Both depth target and depth stencil render buffer will be shared across all the render passes!
  this.depthBuffer = RenderPass.createColorDepthTexture(this.bufferWidth, this.bufferHeight);
  this.depthStencilRenderBuffer = RenderPass.createDepthStencilRenderBuffer(this.bufferWidth, this.bufferHeight);

  // geometry and light pass to render each side
  this.geometryPass = new GeometryPass(this, new Shader('shader/geometry.vert', 'shader/geometry.frag'));
  this.lightPass = new LightPass(this);

  // framebuffer to hold cube texture
  this.framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.depthStencilRenderBuffer);
  // create texture for each face of cubemap
  this.cubeTexture.bind();
  for(var i=0; i<6; ++i){
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, 0, gl.RGBA, this.bufferWidth, this.bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  }
  this.synthesisPass = new SynthesisPass(this, this.framebuffer, this.cubeTexture);
  this.cubeTexture.unbind();

  // setup input and export relationship
  this.lightPass.input([this.geometryPass]);
  this.synthesisPass.input([this.geometryPass, this.lightPass]);



  // 0 GL_TEXTURE_CUBE_MAP_POSITIVE_X
  // 1 GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  // 2 GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  // 3 GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  // 4 GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  // 5 GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  // camera rotations for 6 sides
  // this.rotations = [
  //   // right, GL_TEXTURE_CUBE_MAP_POSITIVE_X
  //   { x:0, y:-Math.PI/2, z:0 },
  //   // left, GL_TEXTURE_CUBE_MAP_NEGATIVE_X
  //   { x:0, y:Math.PI/2, z:0 },
  //   // top, GL_TEXTURE_CUBE_MAP_POSITIVE_Y
  //   { x:Math.PI/2, y:0, z:0 },
  //   // bottom, GL_TEXTURE_CUBE_MAP_NEGATIVE_Y
  //   { x:-Math.PI/2, y:0, z:0 },
  //   // back, GL_TEXTURE_CUBE_MAP_POSITIVE_Z
  //   { x:0, y:-Math.PI, z:0 },
  //   // front, GL_TEXTURE_CUBE_MAP_NEGATIVE_Z
  //   { x:0, y:0, z:0 }
  // ];
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
  var material = new Material();
  material.setCubeTexture(this.cubeTexture);
  this.mesh = new Mesh(new SphereGeometry(0.5,30,30), material);
  this.add(this.mesh);

  // this.geometry = new SphereGeometry(0.5, 30, 30);
}
var p = LightProbe.prototype = Object.create(Node.prototype);

p.capture = function(scene){
  if(this.dynamic || !this.captured){
    this.cubeTexture.bind();
    // draw 6 faces
    for(var i=0; i<6; ++i){
      // update camera direction
      this.camera.rotationX = this.rotations[i].x;
      this.camera.rotationY = this.rotations[i].y;
      this.camera.rotationZ = this.rotations[i].z;
      // since the camera rotation is changed, we need to update its matrix
      this.camera.update();
      scene.updateViewMatrix(this.camera);

      // draw side
      this.geometryPass.render(scene, this.camera);
      this.lightPass.render(scene, this.camera);

      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X+i, this.cubeTexture.glTexture, 0);
      this.synthesisPass.render(scene, this.camera);
    }
    this.cubeTexture.unbind();

    this.captured = true;
  }
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

    // tint color, RGBA
    if(this.material.color.length !== 0){
      data.push(this.material.color[0]);
      data.push(this.material.color[1]);
      data.push(this.material.color[2]);
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
  if(this.material.color.length !== 0)
    strideBytes += 12;

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

  // tint color
  if(this.material.color.length !== 0){
    gl.enableVertexAttribArray(shader.attributes.a_Color);
    gl.vertexAttribPointer(shader.attributes.a_Color, 3, gl.FLOAT, false, strideBytes, pointerOffset+=8);
  }

  // index information
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.bindVertexArrayOES(null);
}

p.uploadUniforms = function(shader){
  gl.uniformMatrix4fv(shader.uniforms['u_ModelMatrix'], false, this.worldMatrix);
  gl.uniformMatrix4fv(shader.uniforms['u_ModelViewMatrix'], false, this.modelViewMatrix);
  gl.uniformMatrix3fv(shader.uniforms['u_NormalMatrix'], false, this.normalMatrix);

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