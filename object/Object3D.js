function Object3D(){
  this.position = vec3.create();

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this.scaleX = 1;
  this.scaleY = 1;
  this.scaleZ = 1;

  // the matrix apply to this object
  this.matrix = mat4.create();
  // the concatenated matrix from root scene apply to this object.
  this.worldMatrix = mat4.create();

  this.children = [];
  this.parent = null;
  this.scene = null;

  this.id = Object3D.id++;
}
var p = Object3D.prototype;

p.add = function(obj3D){
  if(this.children.indexOf(obj3D) === -1){
    if(obj3D.parent)
      obj3D.parent.remove(obj3D);

    this.children.push(obj3D);
    obj3D.parent = this;

    if(this.scene)
      this.scene.addToSortList(obj3D);
  }
}

p.remove = function(obj3D){
  var index = this.children.indexOf(obj3D)
  if(index !== -1){
    this.children.splice(index, 1);
    obj3D.parent = null;

    if(this.scene)
      this.scene.removeFromSortList(obj3D);
  }
}

Object.defineProperty(p, "x", {
  get: function(){
    return this.position[0];
  },
  set: function(x){
    this.position[0] = x;
  }
});

Object.defineProperty(p, "y", {
  get: function(){
    return this.position[1];
  },
  set: function(y){
    this.position[1] = y;
  }
});

Object.defineProperty(p, "z", {
  get: function(){
    return this.position[2];
  },
  set: function(z){
    this.position[2] = z;
  }
});

// If use convenient setter methods, the matrix must be updated, sync with the position.
p.updateMatrix = function(){
  // transform this matrix
  mat4.identity(this.matrix);
  mat4.translate(this.matrix, this.matrix, this.position);
  mat4.rotateX(this.matrix, this.matrix, this.rotationX);
  mat4.rotateY(this.matrix, this.matrix, this.rotationY);
  mat4.rotateZ(this.matrix, this.matrix, this.rotationZ);
  mat4.scale(this.matrix, this.matrix, [this.scaleX, this.scaleY, this.scaleZ]);

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update the matrix of its children, depth first traversing.
  this._updateChildrenMatrix();
}

p._updateWorldMatrix = function(){
  if(this.parent){
    mat4.mul(this.worldMatrix, this.parent.worldMatrix, this.matrix);
  }
  else{
    mat4.identity(this.worldMatrix);
    mat4.mul(this.worldMatrix, this.worldMatrix, this.matrix);
  }
}

p._updateChildrenMatrix = function(){
  var len = this.children.length
  for(var i=0; i<len; ++i){
    this.children[i].updateMatrix();
  }
}

p.draw = function(shader, camera){

}


Object3D.id = 0;