function TextureCube(faces){
  Texture.call(this, gl.TEXTURE_CUBE_MAP);

  this.bind();
  // The edge must be clamp. Otherwise there will be artifact on face joint edges.
  gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameterf(this.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameterf(this.target, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  this.unbind();

  this.load(faces);
}
var p = TextureCube.prototype = Object.create(Texture.prototype);

p.load = function(faces){
  this.faces = faces;

  var toload = faces.length;

  for(var i=0; i<faces.length; ++i){
    var faceInfo = faces[i];

    this.resource = Library.instance.get(faceInfo.url);
    this.resource.loader.addEventListener(Event.COMPLETE, (function(face, loader, texture){
      return function(e){
        if(loader.data)
          texture.setCubeMapData(loader.data, face);

        if(--toload === 0)
          texture.onComplete();
      }
    })(faceInfo.face, this.resource.loader, this));

    this.resource.loader.load();
  }
}

p.onComplete = function(e){
  this.bind();

  if(this.setParameters)
    this.setParameters(this);

  this.ready = true;

  this.unbind();
}

p.setCubeMapData = function(data, face){
  this.bind();

  // flip the texture content in y direction.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  if(data instanceof Image)
    gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
  else
    gl.texImage2D(face, 0, gl.RGBA, data.width, data.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  
  this.unbind();
}