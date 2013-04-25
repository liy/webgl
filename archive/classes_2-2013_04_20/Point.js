(function(window){
  function Point(x, y, z){
    this.matrix = mat4.create();
    
    this.set(x, y, z);

    this.createBuffer();
  }
  var p = Point.prototype;

  p.set = function(x, y, z){
    this.x = x ? x : 1;
    this.y = y ? y : 1;
    this.z = z ? z : 1;

    this.position = vec4.fromValues(this.x, this.y, this.z, 1);

    this.vertices = [
      // x y z   u v  nx ny nz  r g b a
      0,  0,  0,   0.0, 1.0,    0,  0,  1,    1, 0, 1, 1
    ];
  }

  p.createBuffer = function(){
    this.vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
  }

  p.setAttribute = function(attribute){
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vb);
    gl.vertexAttribPointer(attribute['a_Vertex'], 3, gl.FLOAT, false, 48, 0);
    gl.vertexAttribPointer(attribute['a_TexCoord'], 2, gl.FLOAT, false, 48, 12);
    gl.vertexAttribPointer(attribute['a_Normal'], 3, gl.FLOAT, false, 48, 20);
    gl.vertexAttribPointer(attribute['a_Color'], 4, gl.FLOAT, false, 48, 32);
    gl.enableVertexAttribArray(attribute['a_Vertex']);
    gl.enableVertexAttribArray(attribute['a_TexCoord']);
    gl.enableVertexAttribArray(attribute['a_Normal']);
    gl.enableVertexAttribArray(attribute['a_Color']);
  }

  p.draw = function(shader){
    mat4.identity(this.matrix);
    mat4.translate(this.matrix, this.matrix, this.position);

    // TODO: Change into model matrix instead.
    gl.uniformMatrix4fv(shader.uniform['u_ModelViewMatrix'], false, this.matrix);

    this.setAttribute(shader.attribute);

    gl.uniform1i(shader.uniform['u_UseColor'], 1);
    gl.drawArrays(gl.POINTS, 0, 1);
    gl.uniform1i(shader.uniform['u_UseColor'], 0);
  }

  window.Point = Point;
})(window);