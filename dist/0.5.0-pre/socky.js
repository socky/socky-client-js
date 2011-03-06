/*!
 * Socky JavaScript Library
 *
 * @version 0.5.0-pre
 * @author  Bernard Potocki <bernard.potocki@imanel.org>
 * @licence The MIT licence.
 * @source  http://github.com/socky/socky-js
 */

if(typeof Function.prototype.scopedTo == 'undefined'){
  Function.prototype.scopedTo = function(context, args){
    var f = this;
    return function(){
      return f.apply(context, Array.prototype.slice.call(args || [])
        .concat(Array.prototype.slice.call(arguments)));
    };
  };
};
var Socky = function(options) {
  this.options = options || {};

  this.connected = false;
  this.connection_id = null;

  if (SockyManager.is_driver_loaded()) {
    this.connect();
  }

  SockyManager.add_socky_instance.push(this);
};

Socky.prototype = {

  connect: function() {

    var self = this;

    if (window.WebSocket) {

      var url = SockyManager.websocket_url();

      Socky.log('connecting', url);

      var ws = new WebSocket(url);
      ws.onopen = function() {
        self.onopen.apply(self, arguments);
      };
      ws.onmessage = function() {
        self.onmessage.apply(self, arguments);
      };
      ws.onclose = function() {
        self.onclose.apply(self, arguments);
      };

      this._connection = ws;

    } else {

      Socky.log('WebSocket unavailable');
      this._connection = {};

    }
  },
  onopen: function() {
    Socky.log('connected');
  },
  onmessage: function(evt) {
    Socky.log('received message', evt.data);
  },
  onclose: function() {
    Socky.log('disconnected');
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
    return SockyManager._is_websocket_driver_loaded;
  },

  add_socky_instance: function(socky) {
    SockyManager._socky_instances.push(socky);
  },

  websocket_url: function() {
    var url = 'ws';
    if (SockyManager._options.websocket_secure) {
      url += "s";
    }
    url += "://" + SockyManager._options.websocket_host + ":" + SockyManager._options.websocket_port + SockyManager._options.websocket_path + "/" + SockyManager._options.app_name;

    return url;
  },

  init: function(options) {

    SockyManager._options = SockyManager._default_options;
    for (option in options) {
      SockyManager._options[option] = options[option];
    }

    var scripts_to_require = [];

    // Check for JSON dependency
    if (window['JSON'] == undefined) {
      scripts_to_require.push(SockyManager._options.assets_location + '/json2.js');
    }

    var success_callback = null;

    // Check for Flash fallback dep. Wrap initialization.
    if (window['WebSocket'] == undefined) {

      // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
      window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
      window.WEB_SOCKET_SWF_LOCATION = SockyManager._options.assets_location + "/WebSocketMain.swf";
      window.WEB_SOCKET_DEBUG = SockyManager._options.websocket_debug;

      scripts_to_require.push(SockyManager._options.assets_location + '/flashfallback.js');

      success_callback = function() {

        FABridge.addInitializationCallback('webSocket', function() {
          SockyManager._web_sockets_loaded();
        });

        // Run this AFTER adding the callback above
        if (window['WebSocket']) {
          // This will call the FABridge callback, which initializes Socky!
          WebSocket.__initialize();
        } else {
          // Flash is not installed
          SockyManager.log("Could not connect", "WebSocket is not availabe natively nor via Flash");
        }

      }

    } else {

      success_callback = function() {
        SockyManager._web_sockets_loaded();
      };

    }

    if (scripts_to_require.length > 0){
      _require(scripts_to_require, callback);
    } else {
      success_callback();
    }
  },

  // private methods

  _web_sockets_loaded: function() {
    SockyManager._is_websocket_driver_loaded = true;
    for (var i = 0; i < Socky.instances.length; i++) {
      var socky = SockyManager._socky_instances[i];
      if (!socky.is_connected()) {
        socky.connect();
      }
    }
  },

  _require_scripts: function(scripts, callback) {
    var scriptsCount = 0;

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

    function check_if_ready(callback) {
      scripts_count++;
      if (scripts.length == scripts_count) {
        // Opera needs the timeout for page initialization weirdness
        setTimeout(callback, 0);
      }
    }

    function add_script(src, callback) {
      callback = callback || function() {}
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('async', true);

      handle_script_loaded(script, function() {
        check_if_ready(callback);
      });

      head.appendChild(script);
    }

    for (var i = 0; i < scripts.length; i++) {
      add_script(scripts[i], callback);
    }
  }

};

/*

  Please, include this script into your application code to initialize Socky.

  SockyManager.init({
    assets_location: 'http://js.socky.org/v0.5/socky.min.js',
    app_name: "your_app_name",
    websocket_debug: false,
    websocket_path: '/socket',
    websocket_host: window.location.hostname,
    websocket_port: 8080,
    websocket_secure: false
  });

*/
