(function(window){
  function Plane(width, height, widthSegments, heightSegments){
    this.set(width, height, widthSegments, heightSegments);
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

    this.material = new Material();

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

        // color
        this.vertices.push(e[0]);
        this.vertices.push(e[1])
        this.vertices.push(e[2]);
        this.vertices.push(e[3]);
      }
    }

    // this.vertices = [
    //   // x y z   u v  nx ny nz
    //   // front
    //   -hw, -hh,  0,   0.0, 1.0,    0,  0,  1,    e[0], e[1], e[2], e[3],
    //    hw, -hh,  0,   1.0, 1.0,    0,  0,  1,    e[0], e[1], e[2], e[3],
    //    hw,  hh,  0,   1.0, 0.0,    0,  0,  1,    e[0], e[1], e[2], e[3],
    //   -hw,  hh,  0,   0.0, 0.0,    0,  0,  1,    e[0], e[1], e[2], e[3]
    // ];

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

  window.Plane = Plane;
})(window);