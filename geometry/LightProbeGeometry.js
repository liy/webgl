function LightProbeGeometry(size, segments){
  Geometry.call(this);

  this.size = size ? size : 1;
  this.segments = segments ? segments : 1;

  var hw = this.size/2;
  var hh = this.size/2;
  var hd = this.size/2;

  this.numVertices = this.segments*6;


}
var p = LightProbeGeometry.prototype = Object.create(Geometry.prototype);