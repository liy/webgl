function SphereGeometry(radius, latitudeBands, longitudeBands){
  Geometry.call(this);

  this.radius = radius || 0.5;
  this.latitudeBands = latitudeBands || 10;
  this.longitudeBands = longitudeBands || 10;

  var theta = Math.PI/2;
  var phi = Math.PI/2;
  var x = 0;
  var y = 0;
  var z = 0;
  for(var i=0; i<=this.latitudeBands; ++i){
    theta = Math.PI/2 - i * (Math.PI/this.latitudeBands);
    cosTheta = Math.cos(theta);
    sinTheta = Math.sin(theta);
    for(var j=0; j<=this.longitudeBands; ++j){
      phi = j * (Math.PI*2 / this.longitudeBands);

      x = cosTheta * Math.cos(phi);
      y = sinTheta;
      z = cosTheta * Math.sin(phi);

      // normals
      this.normals.push(x);
      this.normals.push(y);
      this.normals.push(z);

      this.vertices.push(x * this.radius);
      this.vertices.push(y * this.radius);
      this.vertices.push(z * this.radius);

      this.texCoords.push(1 - j/this.longitudeBands);
      this.texCoords.push(i/this.latitudeBands);
    }
  }

  // indices
  this.indices = [];
  for(var i=0; i<this.latitudeBands; ++i){
    for(var j=0; j<this.longitudeBands; ++j){
      var topLeft = i * this.longitudeBands + i + j;
      var bottomLeft = topLeft + this.longitudeBands + 1;

      this.indices.push(topLeft);
      this.indices.push(bottomLeft);
      this.indices.push(bottomLeft + 1);
      this.indices.push(bottomLeft + 1);
      this.indices.push(topLeft + 1);
      this.indices.push(topLeft);
    }
  }

  this.numVertices = this.indices.length;
}
var p = SphereGeometry.prototype = Object.create(Geometry.prototype);