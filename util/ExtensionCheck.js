function ExtensionCheck(){
}

ExtensionCheck.check = function(exts){
  for(var i=0; i<exts.length; ++i){
    if(exts[i] === null){
    // if(true){
      var info = document.getElementById('info');
      info.style.display = 'block'
      return;
    }
  }
}