function compileShader(gl, source, type){
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success)
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);

  return shader;
}

function createProgram(gl, vshader, fshader){
  var program = gl.createProgram();
  gl.attachShader(program, vshader);
  gl.attachShader(program, fshader);
  gl.linkProgram(program);

  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success)
    throw ("program filed to link:" + gl.getProgramInfoLog (program));

  return program;
}

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/**
 * http://stackoverflow.com/questions/183214/javascript-callback-scope
 * bind function create a closure of a desired scope for the passed in function parameter.
 *
 */
function bind(scope, func) {
    return function () {
        func.apply(scope, arguments);
    };
}

/*
  http://blog.bripkens.de/2011/05/maintaining-and-testing-scope-in-javascript/
  Don't konw which way is better... probably, this is slower than former function approach.
*/
Function.prototype.bind = function(scope){
  var func = this;
  return function(){
    return func.apply(scope, arguments);
  };
};




var pointerLocker;
function lockPointer(){
  if(!pointerLocker){
    // lock
    pointerLocker = document.createElement('div');
    pointerLocker.setAttribute('id', 'pointer-lock');
    document.body.appendChild(pointerLocker);

    // Element is fullscreen, now we can request pointer lock
    pointerLocker.requestPointerLock = pointerLocker.requestPointerLock    ||
                              pointerLocker.mozRequestPointerLock ||
                              pointerLocker.webkitRequestPointerLock;
  }
  pointerLocker.requestPointerLock();
}

function pointerLockError(){
  console.log("Error while locking pointer.");
}

function isPointerLocked(){
  return document.pointerLockElement || document.mozPointerLockElement || document.webkitPointerLockElement;
}

document.addEventListener('pointerlockerror', pointerLockError, false);
document.addEventListener('mozpointerlockerror', pointerLockError, false);
document.addEventListener('webkitpointerlockerror', pointerLockError, false);