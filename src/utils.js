Socky.Utils = {
  log: function() {
    if (console && console.log) {
      var params = ['Socky'];
      for (var i = 0; i < arguments.length; i++) {
        params.push(arguments[i]);
      }
      console.log(params.join(' : '));
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
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
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
      Socky.Utils.log("data attribute not valid JSON", "you may wish to implement your own SockyManger.parseJSON");
      return data;
    }
  }
};