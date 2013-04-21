(function(window){
  function Plane(width, height, widthSegments, heightSegments){
    this.material = new LambertianMaterial();

    this.position = vec4.create();
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;

    this.matrix = mat4.create();
    this.normalMatrix = mat3.create();

    this.texture = null;
    
    this.set(width, height, widthSegments, heightSegments);

    this.setColor([1.5, 0.5, 0.5, 1.0]);

    this.createBuffer();

  }
  var p = Plane.prototype;

  p.set = function(width, height, widthSegments, heightSegments){
    this.width = width ? width : 1;
    this.height = height ? height : 1;
    this.widthSegments = widthSegments ? widthSegments : 1;
    this.heightSegments = heightSegments ? heightSegments : 1;

    this.vertices = [];
    this.indices = [];

    var x = 0;
    var y = 0;
    var dx = this.width/this.widthSegments;
    var dy = this.height/this.heightSegments;
    var du = 1/this.widthSegments;
    var dv = 1/this.heightSegments;
    var offsetX = -this.width/2;
    var offsetY = -this.height/2;

    var e = this.material.emission;

    for(var i=0; i<=this.heightSegments; ++i){
      for(var j=0; j<=this.widthSegments; ++j){
        // vertex
        var x = j*dx - this.width/2;
        var y = i*dy - this.height/2;

        var index = i*12 + j;
        // x, y, z 
        this.vertices.push(x);
        this.vertices.push(y);
        this.vertices.push(0);

        // uv
        this.vertices.push(du * j);
        // flip y
        this.vertices.push(1-dv * i);

        // normal
        this.vertices.push(0);
        this.vertices.push(0);
        this.vertices.push(1);

      }
    }

    for(var i=0; i<this.heightSegments; ++i){
      for(var j=0; j<this.widthSegments; ++j){
        var bottomLeft = i * (this.widthSegments + 1) + j;
        var topLeft = bottomLeft + this.widthSegments + 1;


        this.indices.push(bottomLeft);
        this.indices.push(bottomLeft+1);
        this.indices.push(topLeft+1);

        this.indices.push(topLeft+1);
        this.indices.push(topLeft);    
        this.indices.push(bottomLeft);
      }
    }
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
  }

  window.Plane = Plane;
})(window);