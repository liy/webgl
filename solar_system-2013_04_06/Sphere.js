(function(window){

  function Sphere(){
    // variables
    this.vertices = [];
    this.indices = [];
    this.texCoord = [];
    this.normals = [];

    // sphere
    var axialTilt = -23.439 * Math.PI/180;
    var latitudeBands = 40;
    var longitudeBands = 40;
    var radius = 2;
    var theta = Math.PI/2;
    var phi = Math.PI/2;
    var x = 0;
    var y = 0;
    var z = 0;
    for(var i=0; i<=latitudeBands; ++i){
      theta = Math.PI/2 - i * (Math.PI/latitudeBands);
      cosTheta = Math.cos(theta);
      sinTheta = Math.sin(theta);
      for(var j=0; j<=longitudeBands; ++j){
        phi = j * (Math.PI*2 / longitudeBands);
        
        x = cosTheta * Math.cos(phi);
        y = sinTheta;
        z = cosTheta * Math.sin(phi);

        // normals
        this.normals.push(x);
        this.normals.push(y);
        this.normals.push(z);

        this.vertices.push(x * radius);
        this.vertices.push(y * radius);
        this.vertices.push(z * radius);

        this.texCoord.push(1 - j/longitudeBands);
        this.texCoord.push(i/latitudeBands);
      }
    }
    // indices
    for(var i=0; i<latitudeBands; ++i){
      for(var j=0; j<longitudeBands; ++j){
        var topLeft = i * longitudeBands + i + j;
        var bottomLeft = topLeft + longitudeBands + 1;

        this.indices.push(topLeft);
        this.indices.push(bottomLeft);
        this.indices.push(bottomLeft + 1);
        this.indices.push(bottomLeft + 1);
        this.indices.push(topLeft + 1);
        this.indices.push(topLeft);
      }
    }
  }
  var p = Sphere.prototype;

  p.init = function(path, program){
    this.texCoordLocation = gl.getUniformLocation(program, 'a_TexCoord');
    this.normalLocation = gl.getUniformLocation(program, 'a_TexCoord');
    this.vertexLocation = gl.getUniformLocation(program, 'a_Vertex');
    
    this.image = createImage(path, this.imageLoaded);
  }

  p.imageLoaded = function(){
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    
    this.tb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoord), gl.STATIC_DRAW);
    gl.vertexAttribPointer(this.texCoordLocation, 2, gl.FLOAT, false, 0, 0);
    
    
  }

  p.draw = function(){

  }

})(window);