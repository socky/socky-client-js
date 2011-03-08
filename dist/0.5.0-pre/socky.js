/*!
 * Socky JavaScript Library
 *
 * @version 0.5.0-pre
 * @author  Bernard Potocki <bernard.potocki@imanel.org>
 * @author  Stefano Verna <stefano.verna@welaika.com>
 * @licence The MIT licence.
 * @source  http://github.com/socky/socky-js
 */
/*!
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 *
 * Inspired by base2 and Prototype
 */

(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  // The base Class implementation (does nothing)
  this.Class = function(){};

  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;

    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;

    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;

            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];

            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);
            this._super = tmp;

            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }

    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }

    // Populate our constructed prototype object
    Class.prototype = prototype;

    // Enforce the constructor to be what we expect
    Class.constructor = Class;

    // And make this class extendable
    Class.extend = arguments.callee;

    return Class;
  };
})();

Socky = Class.extend({

  init: function(options) {
    this._options = options || {};

    this._channels = new Socky.ChannelCollection();
    this._is_connected = false;
    this._connection_id = null;
    this._connection = null;

    if (SockyManager.is_driver_loaded()) {
      this.connect();
    }

    SockyManager.add_socky_instance(this);
  },

  is_connected: function() {
    return this._is_connected;
  },

  connect: function() {
    var self = this;

    if (window.WebSocket) {
      var url = SockyManager.websocket_url();
      this.log('connecting', url);
      this._connection = new WebSocket(url);
      this._connection.onopen = Socky.Utils.bind(this.on_socket_open, this);
      this._connection.onmessage = Socky.Utils.bind(this.on_socket_message, this);
      this._connection.onclose = Socky.Utils.bind(this.on_socket_close, this);
    } else {
      Socky.log('WebSocket unavailable');
      this._connection = {};
    }
  },

  on_socket_open: function() {
    this.log('connected');
  },

  on_socket_message: function(evt) {
    this.log('received message', evt.data);
  },

  on_socket_close: function() {
    this.log('disconnected');
  },

  log: function() {
    Socky.Utils.log.apply(SockyManager, arguments);
  },

  subscribe: function(channel_names) {
    if (!(channel_names instanceof Array)) {
      channel_names = [ channels ];
    }

    if (this._is_connected) {
      var self = this;
      channel.authorize(this, function(data) {
        self.send_event('socky:subscribe', {
          channels: channel_names,
          auth: data.auth
        });
        Socky.Utils.each(channel_names, function(channel_name) {
          self._channels.add(channel_name, self);
        });
      });
    }

    return channel;
  },

  unsubscribe: function(channels) {
    Socky.Utils.each(channels, function(channel) {
      this._channels.remove(channel);
    });
    if (this._is_connected) {
      this.send_event('socky:unsubscribe', {
        channels: channel
      });
    }
  },

  send_event: function(event_name, data, channels) {
    Socky.Utils.log("event sent (channels,event,data)", channels, event_name, data);

    var payload = {
      event: event_name,
      data: data
    };

    if (channels) {
      payload['channels'] = channels
    }

    this._connection.send(JSON.stringify(payload));

    return this;
  }

});

var SockyManager = {

  // private attributes
  _is_websocket_driver_loaded: false,
  _socky_instances: [],
  _default_options: {
    assets_location: 'http://js.socky.org/v0.5/assets',
    app_name: "",
    websocket_debug: false,
    websocket_path: '/websocket',
    websocket_host: window.location.hostname,
    websocket_port: 8080,
    websocket_secure: false,
    channel_auth_endpoint: "/socky/auth",
    channel_auth_transport: "ajax"
  },

  // public methods

  is_driver_loaded: function() {
    return this._is_websocket_driver_loaded;
  },

  add_socky_instance: function(socky) {
    this._socky_instances.push(socky);
  },

  websocket_url: function() {
    var url = 'ws';
    if (this._options.websocket_secure) {
      url += "s";
    }
    url += "://" + this._options.websocket_host + ":" + this._options.websocket_port + this._options.websocket_path + "/" + this._options.app_name;

    return url;
  },

  init: function(options) {

    Socky.Utils.log("inited");

    this._options = Socky.Utils.extend({}, this._default_options, options);

    var scripts_to_require = [];

    var success_callback = Socky.Utils.bind(function() {
      Socky.Utils.log("Websockets driver loaded");
      this._web_sockets_loaded();
    }, this);

    // Check for JSON dependency
    if (window['JSON'] == undefined) {
      Socky.Utils.log("no JSON support, requiring it");
      scripts_to_require.push(this._options.assets_location + '/json2.js');
    }

    // Check for Flash fallback dep. Wrap initialization.
    if (window['WebSocket'] == undefined) {

      Socky.Utils.log("no WebSocket driver available, requiring it");

      // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
      window.WEB_SOCKET_SWF_LOCATION = this._options.assets_location + "/WebSocketMain.swf";
      window.WEB_SOCKET_DEBUG = this._options.websocket_debug;

      scripts_to_require.push(this._options.assets_location + '/flashfallback.js');
    }

    if (scripts_to_require.length > 0){
      this._require_scripts(scripts_to_require, success_callback);
    } else {
      success_callback();
    }
  },

  // private methods

  _web_sockets_loaded: function() {
    this._is_websocket_driver_loaded = true;
    for (var i = 0; i < this._socky_instances.length; i++) {
      var socky = this._socky_instances[i];
      if (!socky.is_connected()) {
        socky.connect();
      }
    }
  },

  _require_scripts: function(scripts, callback) {

    var scripts_count = 0;
    var handle_script_loaded;

    if (document.addEventListener) {
      handle_script_loaded = function(elem, callback) {
        elem.addEventListener('load', callback, false)
      }
    } else {
      handle_script_loaded = function(elem, callback) {
        elem.attachEvent('onreadystatechange', function() {
          if (elem.readyState == 'loaded' || elem.readyState == 'complete') {
            callback();
          }
        });
      }
    }

    var check_if_ready = Socky.Utils.bind(function(callback) {
      scripts_count++;
      if (scripts.length == scripts_count) {
        // Opera needs the timeout for page initialization weirdness
        Socky.Utils.log("All the require script have been loaded!");
        setTimeout(callback, 0);
      }
    }, this);

    var add_script = Socky.Utils.bind(function(src, callback) {
      callback = callback || function() {}
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('async', true);

      Socky.Utils.log("Adding script", src);

      handle_script_loaded(script, function() {
        check_if_ready(callback);
      });

      head.appendChild(script);
    }, this);

    for (var i = 0; i < scripts.length; i++) {
      add_script(scripts[i], callback);
    }
  }

};

Socky.Channel = Class.extend({
  init: function(channel_name, socky) {
    this.socky = socky;
    this.name = channel_name;
    this.callbacks = {};
    this.global_callbacks = [];
    this.subscribed = false;
  },

  disconnect: function(){
  },

  // Activate after successful subscription. Called on top-level socky:subscription_succeeded
  acknowledge_subscription: function(data){
    this.subscribed = true;
  },

  bind: function(event_name, callback) {
    this.callbacks[event_name] = this.callbacks[event_name] || [];
    this.callbacks[event_name].push(callback);
    return this;
  },

  bind_all: function(callback) {
    this.global_callbacks.push(callback);
    return this;
  },

  trigger: function(event_name, data) {
    this.socky.send_event(event_name, data, this.name);
    return this;
  },

  dispatch_with_all: function(event_name, data) {
    if (this.name != 'socky_global_channel') {
      Socky.Utils.log("event recd (channel,event,data)", this.name, event_name, data);
    }
    this.dispatch(event_name, data);
    this.dispatch_global_callbacks(event_name, data);
  },

  dispatch: function(event_name, event_data) {
    var callbacks = this.callbacks[event_name];

    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](event_data);
      }
    } else if (!this.global) {
      Socky.Utils.log('No callbacks for ' + event_name);
    }
  },

  dispatch_global_callbacks: function(event_name, event_data) {
    for (var i = 0; i < this.global_callbacks.length; i++) {
      this.global_callbacks[i](event_name, event_data);
    }
  },

  is_private: function(){
    return false;
  },

  authorize: function(socky, callback){
    // normal channels don't require auth
    callback({});
  }

});

Socky.PrivateChannel = Socky.Channel.extend({

  is_private: function(){
    return true;
  },

  authorize: function(socky, callback){
    if (SockyManager.channel_auth_transport() == "ajax") {
      this.authorize_via_ajax(socky, callback);
    } else {
      this.authorize_via_jsonp(socky, callback);
    }
  },

  authorize_via_ajax: function(socky, callback){
    var self = this;
    var xhr = window.XMLHttpRequest ?
      new XMLHttpRequest() :
      new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", SockyManger.channel_auth_endpoint(), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = Socky.Utils.parseJSON(xhr.responseText);
          callback(data);
        } else {
          Socky.Utils.log("Couldn't get auth info from your webapp" + status);
        }
      }
    };
    xhr.send('socket_id=' + encodeURIComponent(socky.socket_id) + '&channel_name=' + encodeURIComponent(self.name));
  },

  authorize_via_jsonp: function(socky, callback){
    var qstring = 'socket_id=' + encodeURIComponent(socky.socket_id) + '&channel_name=' + encodeURIComponent(this.name);
    var script = document.createElement("script");
    Pusher.auth_callbacks[this.name] = callback;
    var callback_name = "Pusher.auth_callbacks['" + this.name + "']";
    script.src = Pusher.channel_auth_endpoint+'?callback='+encodeURIComponent(callback_name)+'&'+qstring;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore( script, head.firstChild );
  }
});

Socky.ChannelCollection = Class.extend({

  init: function() {
    this._channels = {};
  },

  add: function(channel_name, socky) {
    var existing_channel = this.find(channel_name);
    if (!existing_channel) {
      var channel = null;

      if (channel_name.indexOf("private-") === 0) {
        channel = new Socky.PrivateChannel(channel_name, socky);
      } else {
        channel = new Socky.Channel(channel_name, socky);
      }

      this._channels[channel_name] = channel;
      return channel;
    } else {
      return existing_channel;
    }
  },

  find: function(channel_name) {
    return this._channels[channel_name];
  },

  remove: function(channel_name) {
    delete this._channels[channel_name];
  }

});

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

