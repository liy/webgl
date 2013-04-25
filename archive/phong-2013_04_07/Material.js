(function(window){
  function Material(){
    this.ambient = vec4.create();
    this.diffuse = vec4.create();
    this.specular = vec4.create();
    this.emission = vec4.create();
    this.shininess = 35;
  }
})(window;)