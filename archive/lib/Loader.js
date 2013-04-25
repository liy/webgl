(function(window){
  function Loader(){

  }
  var p = Loader.prototype;

  p.load = function(path, callback, async){
    if(async == undefined) async = true;
    this.callback = callback;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, async);
    xhr.onload = bind(this, this.onload);
    xhr.send();
  }

  p.onload = function(e){
    this.data = e.target.responseText;
    this.callback(e);
  }

  window.Loader = Loader;
})(window)