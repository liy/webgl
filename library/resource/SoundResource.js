"use strict"
function SoundResource(url){
  Resource.call(this, url);
}
var p = SoundResource.prototype = Object.create(Resource.prototype);