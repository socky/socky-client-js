var Events = Class.extend({

  // Bind an event, specified by a string name, `ev`, to a `callback` function.
  // Passing `"all"` will bind the callback to all events fired.
  bind : function(ev, callback) {
    var calls = this._callbacks || (this._callbacks = {});
    var list  = this._callbacks[ev] || (this._callbacks[ev] = []);
    list.push(callback);
    return this;
  },

  // Remove one or many callbacks. If `callback` is null, removes all
  // callbacks for the event. If `ev` is null, removes all bound callbacks
  // for all events.
  unbind : function(ev, callback) {
    var calls;
    if (!ev) {
      this._callbacks = {};
    } else if (calls = this._callbacks) {
      if (!callback) {
        calls[ev] = [];
      } else {
        var list = calls[ev];
        if (!list) return this;
        for (var i = 0, l = list.length; i < l; i++) {
          if (callback === list[i]) {
            list.splice(i, 1);
            break;
          }
        }
      }
    }
    return this;
  },

  // Trigger an event, firing all bound callbacks. Callbacks are passed the
  // same arguments as `trigger` is, apart from the event name.
  // Listening for `"all"` passes the true event name as the first argument.
  trigger : function(ev) {
    var list, calls, i, l;
    if (!(calls = this._callbacks)) return this;
    if (calls[ev]) {
      list = calls[ev].slice(0);
      for (i = 0, l = list.length; i < l; i++) {
        list[i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
    if (calls['all']) {
      list = calls['all'].slice(0);
      for (i = 0, l = list.length; i < l; i++) {
        list[i].apply(this, arguments);
      }
    }
    return this;
  }

});