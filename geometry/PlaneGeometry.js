function PlaneGeometry(width, height, widthSegments, heightSegments){
  Geometry.call(this);

  this.width = width || 1;
  this.height = height || 1;
  this.widthSegments = widthSegments || 1;
  this.heightSegments = heightSegments || 1;

  var x = 0;
  var y = 0;
  var dx = this.width/this.widthSegments;
  var dy = this.height/this.heightSegments;
  var du = 1/this.widthSegments;
  var dv = 1/this.heightSegments;
  var offsetX = -this.width/2;
  var offsetY = -this.height/2;

  for(var i=0; i<=this.heightSegments; ++i){
    for(var j=0; j<=this.widthSegments; ++j){
      // vertex
      var x = j*dx - this.width/2;
      var y = i*dy - this.height/2;

      // x, y, z
      this.vertices.push(x);
      this.vertices.push(y);
      this.vertices.push(0);

      // normal
      this.normals.push(0);
      this.normals.push(0);
      this.normals.push(1);

      this.texCoords.push(1/this.widthSegments * j);
      this.texCoords.push(1-1/this.heightSegments * i);
    }
  }



  this.indices = [];
  for(var i=0; i<this.heightSegments; ++i){
    for(var j=0; j<this.widthSegments; ++j){
      var bottomLeft = i * (this.widthSegments + 1) + j;
      var topLeft = bottomLeft + this.widthSegments + 1;

      this.indices.push(bottomLeft);
      this.indices.push(bottomLeft+1);
      this.indices.push(topLeft);

      this.indices.push(topLeft);
      this.indices.push(bottomLeft+1);
      this.indices.push(topLeft+1);
    }
  }

  this.numVertices = this.indices.length;
}
var p = PlaneGeometry.prototype;