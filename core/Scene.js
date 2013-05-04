function Scene(){
  Object3D.call(this);

  this.scene = this;

  // lights array contains only light
  this.lights = [];
  // sort list also contains light
  this.sortList = [];
}
var p = Scene.prototype = Object.create(Object3D.prototype);

p.addToSortList = function(obj3D){
  var index = this.sortList.indexOf(obj3D);
  if(index === -1){
    this.sortList.push(obj3D);
    obj3D.scene = this;

    // scan all its children to add them to the sort list
    for(var i=0; i<obj3D.children.length; ++i){
      this.addToSortList(obj3D.children[i]);
    }

    // if it is a light, add it to the light list.
    if(obj3D instanceof Light)
      this.lights.push(obj3D);
  }
}

p.removeFromSortList = function(obj3D){
  var index = this.sortList.indexOf(obj3D);
  if(index !== -1){
    this.sortList.splice(index, 1);
    obj3D.scene = null;

    // scan all its children to remove them from the sort list
    for(var i=0; i<obj3D.children.length; ++i){
      this.removeFromSortList(obj3D.children[i]);
    }

    // if it is a light, also remove it from light list.
    if(obj3D instanceof Light){
      index = this.lights.indexOf(obj3D);
      this.lights.splice(index, 1);
    }
  }
}

p.sort = function(){

}