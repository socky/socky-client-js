/*!
 * Socky JavaScript Library
 *
 * @version 0.5.0-pre
 * @author  Bernard Potocki <bernard.potocki@imanel.org>
 * @licence The MIT licence.
 * @source  http://github.com/socky/socky-js
 */

if(typeof Function.prototype.scoped_to == 'undefined'){
  Function.prototype.scoped_to = function(context, args){
    var f = this;
    return function(){
      return f.apply(context, Array.prototype.slice.call(args || [])
        .concat(Array.prototype.slice.call(arguments)));
    };
  };
};
var Socky = function(options) {
  this.options = options || {};

  this._is_connected = false;
  this._connection_id = null;

  if (SockyManager.is_driver_loaded()) {
    this.connect();
  }

  SockyManager.add_socky_instance(this);
};

Socky.prototype = {

  is_connected: function() {
    return this._is_connected;
  },

  connect: function() {
    var self = this;

    if (window.WebSocket) {
      var url = SockyManager.websocket_url();
      this.log('connecting', url);
      this._connection = new WebSocket(url);
      this._connection.onopen = this.on_socket_open.scoped_to(this);
      this._connection.onmessage = this.on_socket_message.scoped_to(this);
      this._connection.onclose = this.on_socket_close.scoped_to(this);
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
    SockyManager.log.apply(SockyManager, arguments);
  }
};
var SockyManager = {

  // private attributes
  _is_websocket_driver_loaded: false,
  _socky_instances: [],
  _default_options: {
    assets_location: 'http://js.socky.org/v0.5/socky.min.js',
    app_name: "",
    websocket_debug: false,
    websocket_path: '/socket',
    websocket_host: window.location.hostname,
    websocket_port: 8080,
    websocket_secure: false
  },

  // public methods

  log: function() {
    if (console && console.log) {
      var params = ['Socky'];
      for (var i = 0; i < arguments.length; i++) {
        params.push(arguments[i]);
      }
      console.log(params.join(' : '));
    }
  },

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

    this.log("inited");

    this._options = this._default_options;
    for (option in options) {
      this._options[option] = options[option];
    }

    var scripts_to_require = [];

    var success_callback = function() {
      this.log("Websockets driver loaded");
      this._web_sockets_loaded();
    }.scoped_to(this);

    // Check for JSON dependency
    if (window['JSON'] == undefined) {
      this.log("no JSON support, requiring it");
      scripts_to_require.push(this._options.assets_location + '/json2.js');
    }

    // Check for Flash fallback dep. Wrap initialization.
    if (window['WebSocket'] == undefined) {

      this.log("no WebSocket driver available, requiring it");

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

    var check_if_ready = function(callback) {
      scripts_count++;
      if (scripts.length == scripts_count) {
        // Opera needs the timeout for page initialization weirdness
        this.log("All the require script have been loaded!");
        setTimeout(callback, 0);
      }
    }.scoped_to(this);

    var add_script = function(src, callback) {
      callback = callback || function() {}
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('async', true);

      this.log("Adding script", src);

      handle_script_loaded(script, function() {
        check_if_ready(callback);
      });

      head.appendChild(script);
    }.scoped_to(this);

    for (var i = 0; i < scripts.length; i++) {
      add_script(scripts[i], callback);
    }
  }

};

/*

  Please, include this script into your application code to initialize Socky.

  this.init({
    assets_location: 'http://js.socky.org/v0.5/socky.min.js',
    app_name: "your_app_name",
    websocket_debug: false,
    websocket_path: '/socket',
    websocket_host: window.location.hostname,
    websocket_port: 8080,
    websocket_secure: false
  });

*/
