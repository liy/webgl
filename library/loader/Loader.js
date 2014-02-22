function Loader(resolver){
  this.xhr = new XMLHttpRequest();
}
var p = Loader.prototype;

p.load = function(url, responseType){
  this.url = url;

  return new Promise((function(xhr, url, responseType){
    return function(resolve, reject){
      xhr.open('GET', url, true);
      xhr.responseType = responseType;
      xhr.onload = function(){
        if(xhr.status === 200)
          resolve(xhr.response);
        else
          reject(new Error(xhr.statusText));
      };

      xhr.onerror = function(error){
        reject(error)
      }
      
      xhr.send();
    };
  })(this.xhr, this.url, responseType));
}