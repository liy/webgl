function Scene(){
  Object3D.call(this);

  this.scene = this;

  // contains lights only
  this.lights = [];
  // contains meshes only
  this.meshes = [];
  // contains cameras only
  this.cameras = [];
  // sort list contains every objects in the scene.
  this.sortList = [];

  // if it is dirty, the buffer will be updated
  this.dirty = true;
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

    // add object to specific category
    if(obj3D instanceof Mesh)
      this.meshes.push(obj3D);
    else if(obj3D instanceof Light)
      this.lights.push(obj3D);
    else
      this.cameras.push(obj3D);

    this.dirty = true;
  }
}

p.removeFromSortList = function(obj3D){
  var index = this.sortList.indexOf(obj3D);
  if(index !== -1){
    this.sortList.splice(index, 1);
    obj3D.scene = null;

    // recursively, scan all its children and remove them from the sort list and their categories
    for(var i=0; i<obj3D.children.length; ++i){
      this.removeFromSortList(obj3D.children[i]);
    }

    // remove object from specific category
    if(obj3D instanceof Mesh){
      index = this.meshes.indexOf(obj3D);
      this.meshes.splice(index, 1);
    }
    else if(obj3D instanceof Light){
      index = this.lights.indexOf(obj3D);
      this.lights.splice(index, 1);
    }
    else{
      index = this.cameras.indexOf(obj3D);
      this.cameras.splice(index, 1);
    }

    this.dirty = true;
  }
}