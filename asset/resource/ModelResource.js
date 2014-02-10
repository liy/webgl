function ModelResource(url){
  Resource.call(this, url);
}
var p = ModelResource.prototype = Object.create(Resource.prototype);