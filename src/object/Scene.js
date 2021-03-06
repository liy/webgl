define(function(require){

var Node = require('object/Node');
var Mesh = require('object/Mesh');
var Light = require('object/light/Light');
var LightProbe = require('object/LightProbe');
var DirectionalLight = require('object/light/DirectionalLight');
var SkyBox = require('object/SkyBox');

"use strict"
var Scene = function(){
  Node.call(this);

  this.scene = this;

  // contains all lights
  this.lights = [];
  // TODO: do I need to categorize them, for easier lighting pass?
  // contains spot lights, point lights, which have position
  this.positionalLights = [];
  // only contains directional lights.
  this.directionalLights = [];

  // contains meshes only
  this.meshes = [];
  // contains cameras only
  this.cameras = [];
  // contains every objects in the scene.
  this.objects = [];
  // sky box
  this.skyBoxes = [];
  // light probes
  this.lightProbes = [];

  // if it is dirty, the buffer will be updated
  this.dirty = true;
}
var p = Scene.prototype = Object.create(Node.prototype);

p.track = function(node){
  var index = this.objects.indexOf(node);
  if(index === -1){
    this.objects.push(node);
    node.scene = this;

    // scan all its children to add them to the sort list
    for(var i=0; i<node.children.length; ++i){
      this.track(node.children[i]);
    }

    // add object to specific category
    if(node instanceof Mesh){
      // TODO: Feel not right here, SkyBox should not be a Mesh?!
      if(node instanceof SkyBox)
        this.skyBoxes.push(node);
      else
        this.meshes.push(node);
    }
    else if(node instanceof Light){
      this.lights.push(node);
      // further categorization.
      if(node instanceof DirectionalLight)
        this.directionalLights.push(node);
      else
        this.positionalLights.push(node);
    }
    else if(node instanceof LightProbe)
      this.lightProbes.push(node);
    else
      this.cameras.push(node);



    this.dirty = true;
  }
}

p.untrack = function(node){
  var index = this.objects.indexOf(node);
  if(index !== -1){
    this.objects.splice(index, 1);
    node.scene = null;

    // recursively, scan all its children and remove them from the sort list and their categories
    for(var i=0; i<node.children.length; ++i){
      this.untrack(node.children[i]);
    }

    // remove object from specific category
    if(node instanceof Mesh){
      // sky box
      if(node instanceof SkyBox){
        index = this.skyBoxes.indexOf(node);
        this.skyBoxes.splice(node);
      }
      else{
        index = this.meshes.indexOf(node);
        this.meshes.splice(index, 1);
      }
    }
    else if(node instanceof Light){
      index = this.lights.indexOf(node);
      this.lights.splice(index, 1);

      if(node instanceof DirectionalLight){
        index = this.directionalLights.indexOf(node);
        this.directionalLights.splice(index, 1);
      }
      else{
        index = this.positionalLights.indexOf(node);
        this.positionalLights.splice(index, 1);
      }
    }
    else if(node instanceof LightProbe){
      index = this.lightProbes.indexOf(node);
      this.lightProbes.splice(index, 1);
    }
    else{
      index = this.cameras.indexOf(node);
      this.cameras.splice(index, 1);
    }

    this.dirty = true;
  }
}

p.update = p.updateModelMatrix = function(){
  // update all object's matrix, which are not dependent on the view matrix
  var len = this.children.length;
  for(var i=0; i<len; ++i){
    this.children[i].update();
  }
}

p.updateModelViewMatrix = function(camera){
  // update meshes' view dependent matrix
  var len = this.meshes.length;
  for(var i=0; i<len; ++i){
    var mesh = this.meshes[i];
    // update model view matrix, normal matrix
    mat4.mul(mesh.modelViewMatrix, camera.viewMatrix, mesh.worldMatrix);
    mat3.normalFromMat4(mesh.normalMatrix, mesh.modelViewMatrix);
  }

  // light probe
  len = this.lightProbes.length;
  for(var i=0; i<len; ++i){
    var probe = this.lightProbes[i];
    // update light's view dependent matrix, and related position, etc.
    mat4.mul(probe.modelViewMatrix, camera.viewMatrix, probe.worldMatrix);
    mat3.normalFromMat4(probe.normalMatrix, probe.modelViewMatrix);
  }

  // update skybox view dependent matrix
  len = this.skyBoxes.length;
  for(var i=0; i<len; ++i){
    var skyBox = this.skyBoxes[i];
    // update model view matrix, normal matrix
    // TODO: Where to drop the translation part? Here or in sky box's vertex shader.
    mat4.mul(skyBox.modelViewMatrix, camera.viewMatrix, skyBox.worldMatrix);
    // no normal matrix needed.
    // mat3.normalFromMat4(skyBox.normalMatrix, skyBox.modelViewMatrix);
  }

  // update the lights' view dependent matrix
  len = this.lights.length;
  for(var i=0; i<len; ++i){
    var light = this.lights[i];
    // update light's view dependent matrix, and related position, etc.
    mat4.mul(light.modelViewMatrix, camera.viewMatrix, light.worldMatrix);
    vec3.transformMat4(light._viewSpacePosition, light._position, camera.viewMatrix);
  }
}

return Scene;

});