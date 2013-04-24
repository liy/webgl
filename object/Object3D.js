function Object3D(){
  this.position = vec3.create();

  this.rotationX = 0;
  this.rotationY = 0;
  this.rotationZ = 0;

  this._matrix = mat4.create();
  this._concatMatrix = mat4.create();

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
  mat4.identity(this._matrix);
  mat4.translate(this._matrix, this._matrix, this.position);
  mat4.rotateX(this._matrix, this._matrix, this.rotationX);
  mat4.rotateY(this._matrix, this._matrix, this.rotationY);
  mat4.rotateZ(this._matrix, this._matrix, this.rotationZ);
  // TODO: add scale
}

Object.defineProperty(p, "matrix", {
  get: function(){
    return this._matrix;
  },
  set: function(matrix){
    this._matrix = matrix;

    // translate
    this.position[0] = this._matrix[12];
    this.position[1] = this._matrix[13];
    this.position[2] = this._matrix[14];

    // TODO: rotation

    // TODO: scale
  }
});

Object.defineProperty(p, "concatMatrix", {
  get: function(){
    if(this.parent){
      mat4.mul(this._concatMatrix, this.parent.concatMatrix, this._matrix);
    }
    else{
      mat4.identity(this._concatMatrix);
      mat4.mul(this._concatMatrix, this._concatMatrix, this._matrix);
    }
    return this._concatMatrix;
  }
});


Object3D.id = 0;