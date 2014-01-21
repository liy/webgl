function Event(type, bubbles){
  this.type = type;
  this.bubbles = bubbles || false;

  this.target = null;

  this.currentTarget = null;

  this._immediatePropagationStopped = false;

  this._propagationStopped = false;

  /**
   * There are three phases of the event.
   * 1, the capturing phase, which is the first phase of the event flow.
   * 2, the target phase, which is the second phase of the event flow.
   * 3, the bubbling phase, which is the third phase of the event flow.
   */
  this.eventPhase = 0;
}
var p = Event.prototype = Object.create(null);

Event.COMPLETE = 'complete';
Event.enterframe = new Event('enterframe');

/**
 * Prevents all other event listeners from being triggered for this event dispatch, including any remaining candidate event listeners.
 * Once it has been called, further calls to this method have no additional effect.
 */
p.stopImmediatePropagation = function(){
  this._immediatePropagationStopped = this._propagationStopped = true;
}

/**
 * Prevents all other event listeners from being triggered, excluding any remaining candidate event listeners.
 * Once it has been called, further calls to this method have no additional effect.
 */
p.stopPropagation = function(){
  this._propagationStopped = true;
}

p.toString = function(){
  return '[Event type="' + this.type + '" ' + 'bubbles='+this.bubbles+' eventPhase=' + this.eventPhase + ']';
}