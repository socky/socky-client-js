Events = Class.extend({

  // Bind an event, specified by a string name, `ev`, to a `callback` function.
  // Passing `"all"` will bind the callback to all events fired.
  _bind : function(scope, ev, callback) {
    this._callbacks = this._callbacks || {};
    var calls = this._callbacks[scope] || (this._callbacks[scope] = {});
    var list  = this._callbacks[scope][ev] || (this._callbacks[scope][ev] = []);
    list.push(callback);
    return this;
  },

  // Remove one or many callbacks. If `callback` is null, removes all
  // callbacks for the event. If `ev` is null, removes all bound callbacks
  // for all events.
  _unbind : function(scope, ev, callback) {
    var calls;
    if (this._callbacks && !ev) {
      this._callbacks[scope] = {};
    } else if (calls = this._callbacks[scope]) {
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
  _trigger : function(scope, ev) {
    var list, calls, i, l;
    if (!this._callbacks || !(calls = this._callbacks[scope])) return this;
    if (calls[ev]) {
      list = calls[ev].slice(0);
      for (i = 0, l = list.length; i < l; i++) {
        list[i].apply(this, Array.prototype.slice.call(arguments, 2));
      }
    }
    if (calls['all']) {
      list = calls['all'].slice(0);
      for (i = 0, l = list.length; i < l; i++) {
        list[i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
    return this;
  }

});