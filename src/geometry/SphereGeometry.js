define(function(require){
"use strict"

var Geometry = require('geometry/Geometry');
var Face3 = require('object/Face3');

var SphereGeometry = function(radius, latitudeBands, longitudeBands){
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
    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);
    for(var j=0; j<=this.longitudeBands; ++j){
      phi = -j * (Math.PI*2 / this.longitudeBands);

      x = cosTheta * Math.cos(phi);
      y = sinTheta;
      z = cosTheta * Math.sin(phi);

      this.vertices.push(vec3.fromValues(x*this.radius, y*this.radius, z*this.radius));
      this.texCoords.push(vec2.fromValues(j/this.longitudeBands, i/this.latitudeBands));
      this.normals.push(vec3.fromValues(x, y, z));
    }
  }

  // indices
  for(var i=0; i<this.latitudeBands; ++i){
    for(var j=0; j<this.longitudeBands; ++j){
      var topLeft = i * this.longitudeBands + i + j;
      var bottomLeft = topLeft + this.longitudeBands + 1;

      this.indexData.push(topLeft);
      this.indexData.push(bottomLeft);
      this.indexData.push(bottomLeft + 1);
      this.faces.push(new Face3(topLeft, bottomLeft, bottomLeft+1));

      this.indexData.push(bottomLeft + 1);
      this.indexData.push(topLeft + 1);
      this.indexData.push(topLeft);
      this.faces.push(new Face3(bottomLeft + 1, topLeft + 1, topLeft));
    }
  }
}
var p = SphereGeometry.prototype = Object.create(Geometry.prototype);

return SphereGeometry;

})