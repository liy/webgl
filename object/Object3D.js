function Object3D(){
  this._position = new Vec3();
  // eye space position, used by sorting function in renderer only.
  this._viewSpacePosition = new Vec3();
  this._rotationX = 0;
  this._rotationY = 0;
  this._rotationZ = 0;
  this._scale = new Vec3(1,1,1);

  // the matrix apply to this object
  this._matrix = new Mat4();
  // read only, the concatenated matrix from root scene apply to this object.
  this.worldMatrix = new Mat4();

  // if you directly set xyz, scale, rotation, this field will be set to false.
  // that means, matrix will be generated from those field.
  // However, if you manually set the matrix value, this field will be auto set to true,
  // matrix will not be updated according to simple xyz, scale and rotation values.
  this.autoMatrix = true;

  this.children = [];
  this.parent = null;
  this.scene = null;

  this.id = Object3D.id++;
}
var p = Object3D.prototype;

// If use convenient setter methods, the matrix must be updated, sync with the position.
p.update = function(){
  // if user set the simple xyz, rotation or scale values, autoMatrix will be set to true.
  // The object's matrix will be computed by those values instead.
  if(this.autoMatrix){
    // mat4.identity(this._matrix);
    this._matrix.identity();

    // mat4.translate(this._matrix, this._matrix, this._position);
    this._matrix.translate(this._position);

    // mat4.rotateX(this._matrix, this._matrix, this._rotationX);
    this._matrix.rotateX(this._rotationX);

    // mat4.rotateY(this._matrix, this._matrix, this._rotationY);
    this._matrix.rotateY(this._rotationY);

    // mat4.rotateZ(this._matrix, this._matrix, this._rotationZ);
    this._matrix.rotateZ(this._rotationZ);

    // mat4.scale(this._matrix, this._matrix, this._scale);
    this._matrix.scale(this._scale);

  }

  // update the world matrix apply to this object
  this._updateWorldMatrix();

  // update the matrix of its children
  this._updateChildrenMatrix();
}

p._updateWorldMatrix = function(){
  if(this.parent === null){
    // directly override the world matrix with the local matrix. No need to clone.
    // mat4.copy(this.worldMatrix, this._matrix);
    this.worldMatrix.copy(this._matrix);
  }
  else{
    // mat4.mul(this.worldMatrix, this.parent.worldMatrix, this._matrix);
    Mat4.multiply(this.worldMatrix, this.parent.worldMatrix, this._matrix);
  }
}

p._updateChildrenMatrix = function(){
  var len = this.children.length
  for(var i=0; i<len; ++i){
    this.children[i].update();
  }
}

p.add = function(obj3D){
  if(this.children.indexOf(obj3D) === -1){
    if(obj3D.parent)
      obj3D.parent.remove(obj3D);

    this.children.push(obj3D);
    obj3D.parent = this;

    if(this.scene)
      this.scene.track(obj3D);
  }
}

p.remove = function(obj3D){
  var index = this.children.indexOf(obj3D)
  if(index !== -1){
    this.children.splice(index, 1);
    obj3D.parent = null;

    if(this.scene)
      this.scene.untrack(obj3D);
  }
}


Object.defineProperty(p, "x", {
  get: function(){
    return this._position.x;
  },
  set: function(x){
    this._position.x = x;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "y", {
  get: function(){
    return this._position.y;
  },
  set: function(y){
    this._position.y = y;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "z", {
  get: function(){
    return this._position.z;
  },
  set: function(z){
    this._position.z = z;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "rotationX", {
  get: function(){
    return this._rotationX;
  },
  set: function(x){
    this._rotationX = x;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "rotationY", {
  get: function(){
    return this._rotationY;
  },
  set: function(y){
    this._rotationY = y;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "rotationZ", {
  get: function(){
    return this._rotationZ;
  },
  set: function(z){
    this._rotationZ = z;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "scale", {
  get: function(){
    return this._scale.x;
  },
  set: function(v){
    this._scale.x = this._scale.y = this._scale.z = v;
    this.autoMatrix = true;
  }
});


Object.defineProperty(p, "scaleX", {
  get: function(){
    return this._scale.x;
  },
  set: function(x){
    this._scale.x = x;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "scaleY", {
  get: function(){
    return this._scale.y;
  },
  set: function(y){
    this._scale.y = y;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "scaleZ", {
  get: function(){
    return this._scale.z;
  },
  set: function(z){
    this._scale.z = z;
    this.autoMatrix = true;
  }
});

Object.defineProperty(p, "matrix", {
  get: function(){
    return this._matrix;
  },
  set: function(value){
    this._matrix = value;

    // TODO: decompose the xyz, scale and rotaion value

    this.autoMatrix = false;
  }
});

Object3D.origin = new Vec3();
Object3D.id = 0;