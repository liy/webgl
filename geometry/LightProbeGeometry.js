/**
 * No use at all
 * @param {[type]} size     [description]
 * @param {[type]} segments [description]
 */
function LightProbeGeometry(size, segments){
  Geometry.call(this);

  // http://mathproofs.blogspot.co.uk/2005/07/mapping-cube-to-sphere.html
  // the equation only works on [-1, 1], so it should be 2
  this.size = size ? size : 2;
  this.segments = segments ? segments : 2;

  // There are this.segments^2 squares on each face, every square has 6 vertices, and there are 6 faces.
  // this.numVertices = this.segments*this.segments * 6 * 6;
  this.numVertices = this.segments*this.segments * 6;

  this.indices = [];

  var indexOffset = 0;

  var x = 0;
  var y = 0;
  var vertexDelta = this.size/this.segments;
  var texCoordDelta = 1/this.segments;

  var scale = 1/2;

  // front
  var sign = 1;
  for(var i=0; i<=this.segments; ++i){
    for(var j=0; j<=this.segments; ++j){
      // vertex on cube
      var cx = j*vertexDelta - 1;
      var cy = i*vertexDelta - 1;
      var cz = 1 * sign;

      var xx = cx*cx;
      var yy = cy*cy;
      var zz = cz*cz;

      // map to sphere
      // http://mathproofs.blogspot.co.uk/2005/07/mapping-cube-to-sphere.html
      var x = cx*Math.sqrt(1 - yy/2 - zz/2 + yy*zz/3) * scale;
      var y = cy*Math.sqrt(1 - zz/2 - xx/2 + zz*xx/3) * scale;
      var z = cz*Math.sqrt(1 - xx/2 - yy/2 + xx*yy/3) * scale;

      // x, y, z
      this.vertices.push(x);
      this.vertices.push(y);
      this.vertices.push(z);

      // normal
      this.normals.push(0);
      this.normals.push(0);
      this.normals.push(1);

      this.texCoords.push(1/this.segments * j);
      this.texCoords.push(1-1/this.segments * i);
    }
  }
  // indices
  for(var i=0; i<this.segments; ++i){
    for(var j=0; j<this.segments; ++j){
      var bottomLeft = i * (this.segments + 1) + j + indexOffset;
      var topLeft = bottomLeft + this.segments + 1 + indexOffset;

      this.indices.push(bottomLeft);
      this.indices.push(bottomLeft+1);
      this.indices.push(topLeft);

      this.indices.push(topLeft);
      this.indices.push(bottomLeft+1);
      this.indices.push(topLeft+1);
    }
  }
  // back

  // left
  // indexOffset = 0;
  // console.log(indexOffset);
  // var sign = -1;
  // for(var i=0; i<=this.segments; ++i){
  //   for(var j=0; j<=this.segments; ++j){
  //     // vertex on cube
  //     var cx = 1 * sign;
  //     var cy = i*vertexDelta - 1;
  //     var cz = j*vertexDelta - 1;

  //     var xx = cx*cx;
  //     var yy = cy*cy;
  //     var zz = cz*cz;

  //     // map to sphere
  //     // http://mathproofs.blogspot.co.uk/2005/07/mapping-cube-to-sphere.html
  //     var x = cx*Math.sqrt(1 - yy/2 - zz/2 + yy*zz/3) * scale;
  //     var y = cy*Math.sqrt(1 - zz/2 - xx/2 + zz*xx/3) * scale;
  //     var z = cz*Math.sqrt(1 - xx/2 - yy/2 + xx*yy/3) * scale;

  //     // x, y, z
  //     this.vertices.push(x);
  //     this.vertices.push(y);
  //     this.vertices.push(z);

  //     // normal
  //     this.normals.push(-1);
  //     this.normals.push(0);
  //     this.normals.push(0);

  //     this.texCoords.push(1/this.segments * j);
  //     this.texCoords.push(1-1/this.segments * i);
  //   }
  // }
  // for(var i=0; i<=this.segments; ++i){
  //   for(var j=0; j<=this.segments; ++j){
  //     var bottomLeft = i * (this.segments + 1) + j + indexOffset;
  //     var topLeft = bottomLeft + this.segments + 1 + indexOffset;

  //     this.indices.push(bottomLeft);
  //     this.indices.push(bottomLeft+1);
  //     this.indices.push(topLeft);

  //     this.indices.push(topLeft);
  //     this.indices.push(bottomLeft+1);
  //     this.indices.push(topLeft+1);
  //   }
  // }
  // right
  // top and bottom


}
var p = LightProbeGeometry.prototype = Object.create(Geometry.prototype);