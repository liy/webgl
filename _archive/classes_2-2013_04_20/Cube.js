(function(window){
  function Cube(width, height, depth){
    this.material = new LambertianMaterial();

    this.position = vec4.create();
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;

    this.matrix = mat4.create();
    this.normalMatrix = mat3.create();

    this.texture = null;
    
    this.set(width, height, depth);

    this.setColor([0.9, 0.9, 0.9, 1.0]);

    this.createBuffer();
  }
  var p = Cube.prototype;

  p.set = function(width, height, depth){
    this.width = width ? width : 1;
    this.height = height ? height : 1;
    this.depth = depth ? depth : 1;

    var hw = this.width/2;
    var hh = this.height/2;
    var hd = this.depth/2;

    var c = this.material.color;
    this.vertices = [
      // x y z   u v  nx ny nz
      // front
      -hw, -hh,  hd,   0.0, 1.0,    0,  0,  1,
       hw, -hh,  hd,   1.0, 1.0,    0,  0,  1,
       hw,  hh,  hd,   1.0, 0.0,    0,  0,  1,
      -hw,  hh,  hd,   0.0, 0.0,    0,  0,  1,
      // back
       hw, -hh, -hd,   0.0, 1.0,    0,  0, -1,
      -hw, -hh, -hd,   1.0, 1.0,    0,  0, -1,
      -hw,  hh, -hd,   1.0, 0.0,    0,  0, -1,
       hw,  hh, -hd,   0.0, 0.0,    0,  0, -1,
      // top
      -hw,  hh,  hd,   0.0, 1.0,    0,  1,  0,
       hw,  hh,  hd,   1.0, 1.0,    0,  1,  0,
       hw,  hh, -hd,   1.0, 0.0,    0,  1,  0,
      -hw,  hh, -hd,   0.0, 0.0,    0,  1,  0,
      // bottom
      -hw, -hh, -hd,   0.0, 1.0,    0, -1,  0,
       hw, -hh, -hd,   1.0, 1.0,    0, -1,  0,
       hw, -hh,  hd,   1.0, 0.0,    0, -1,  0,
      -hw, -hh,  hd,   0.0, 0.0,    0, -1,  0,
      // left
      -hw, -hh, -hd,   0.0, 1.0,   -1,  0,  0,
      -hw, -hh,  hd,   1.0, 1.0,   -1,  0,  0,
      -hw,  hh,  hd,   1.0, 0.0,   -1,  0,  0,
      -hw,  hh, -hd,   0.0, 0.0,   -1,  0,  0,
      // right
       hw, -hh,  hd,   0.0, 1.0,    1,  0,  0,
       hw, -hh, -hd,   1.0, 1.0,    1,  0,  0,
       hw,  hh, -hd,   1.0, 0.0,    1,  0,  0,
       hw,  hh,  hd,   0.0, 0.0,    1,  0,  0
    ];

    this.indices = [
      0,  1,  2,   0,  2,  3,  // front
      4,  5,  6,   4,  6,  7,  // back
      8,  9,  10,  8,  10, 11, // top
      12, 13, 14,  12, 14, 15, // bottom
      16, 17, 18,  16, 18, 19, // left
      20, 21, 22,  20, 22, 23  // right
    ];
  }

  p.setColor = function(color){
    // color
    this.colors = [];
    for(var i=0; i<24; ++i){
      for(var j=0; j<4; ++j){
        this.colors.push(color[j]);
      }
    }
  }

  p.room = function(){
    for(var i=0; i<24; ++i){
      this.vertices[12*i + 5] *= -1;
      this.vertices[12*i + 6] *= -1;
      this.vertices[12*i + 7] *= -1;
    }
    this.indices = this.indices.reverse();
  }

  p.createBuffer = function(){
    this.vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    this.cb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);

    this.ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
  }

  p.setAttribute = function(attribute){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.vertexAttribPointer(attribute['a_Vertex'], 3, gl.FLOAT, false, 32, 0);
    gl.vertexAttribPointer(attribute['a_TexCoord'], 2, gl.FLOAT, false, 32, 12);
    gl.vertexAttribPointer(attribute['a_Normal'], 3, gl.FLOAT, false, 32, 20);
    gl.enableVertexAttribArray(attribute['a_Vertex']);
    gl.enableVertexAttribArray(attribute['a_TexCoord']);
    gl.enableVertexAttribArray(attribute['a_Normal']);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.cb);
    gl.vertexAttribPointer(attribute['a_Color'], 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribute['a_Color']);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
  }

  p.draw = function(shader, light){
    this.rotationX += 0.007;
    this.rotationY -= 0.009;
    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.position);
    mat4.rotateX(this.matrix, this.matrix, this.rotationX);
    mat4.rotateY(this.matrix, this.matrix, this.rotationY);
    mat4.rotateZ(this.matrix, this.matrix, this.rotationZ);
    // TODO: Change into model matrix instead.
    gl.uniformMatrix4fv(shader.uniform['u_ModelViewMatrix'], false, this.matrix);

    // transform model normal
    mat3.normalFromMat4(this.normalMatrix, this.matrix);
    gl.uniformMatrix3fv(shader.uniform['u_NormalMatrix'], false, this.normalMatrix);

    // apply light
    light.setUniforms(shader.uniform);
    this.material.setUniforms(shader.uniform);

    this.setAttribute(shader.attribute);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ib);
    gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    // gl.drawArrays(gl.POINTS, 0, 1);
  }

  window.Cube = Cube;
})(window);