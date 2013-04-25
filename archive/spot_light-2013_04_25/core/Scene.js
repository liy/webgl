function Scene(){
  Object3D.call(this);

  this.lights = [];
  this.scene = this;

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
  }
}

p.sort = function(){

}