Socky.Utils = {
  breaker: {},
  log: function() {
    if (console && console.log) {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("Socky");
      Function.prototype.apply.apply(console.log, [console, args]);
    }
  },
  is_number: function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  },
  each: function(obj, iterator, context) {
    if (obj == null) return;
    if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
      obj.forEach(iterator, context);
    } else if (Socky.Utils.is_number(obj.length)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === Socky.Utils.breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === Socky.Utils.breaker) return;
        }
      }
    }
  },
  find: function(obj, iterator, context) {
    var result;
    Socky.Utils.any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  },
  any: function(obj, iterator, context) {
    var result = false;
    if (obj == null) return result;
    Socky.Utils.each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) return Socky.Utils.breaker;
    });
    return result;
  },
  extend: function(obj) {
    Socky.Utils.each(Array.prototype.slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  },
  bind: function(f, context, args) {
    return function() {
      return f.apply(context, Array.prototype.slice.call(args || []).concat(Array.prototype.slice.call(arguments)));
    }
  },
  parseJSON: function(data) {
    try {
      return JSON.parse(data);
    } catch(e) {
      Socky.Utils.log("data attribute not valid JSON", "you may wish to implement your own Socky.Manager.parseJSON");
      return data;
    }
  }
};
