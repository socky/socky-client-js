Socky.Manager = {

  // private attributes
  _is_inited: false,
  _is_websocket_driver_loaded: false,
  _jsonp_auth_callbacks: {},
  _socky_instances: [],
  _assets_location: '<CDN_LOCATION>',
  _flash_debug: false,
  _default_options: {
    app_name: "",
    debug: false,
    path: '/websocket',
    host: window.location.hostname,
    port: 8080,
    secure: false,
    channel_auth_endpoint: "/socky/auth",
    channel_auth_transport: "ajax"
  },

  // public methods

  is_inited: function() {
    return this._is_inited;
  },

  is_driver_loaded: function() {
    return this._is_websocket_driver_loaded;
  },

  add_socky_instance: function(socky) {
    this._socky_instances.push(socky);
  },

  default_options: function() {
    return this._default_options;
  },

  set_default_options: function(default_options) {
    this._default_options = Socky.Utils.extend({}, this._default_options, default_options);
  },

  set_assets_location: function(assets) {
    this._assets_location = assets;
  },

  set_flash_debug: function(debug) {
    this._flash_debug = debug;
  },

  init: function() {

    if (this._is_inited) {
      return;
    }

    this._is_inited = true;

    Socky.Utils.log("inited");

    var scripts_to_require = [];

    var success_callback = Socky.Utils.bind(function() {
      Socky.Utils.log("Websockets driver loaded");
      this._web_sockets_loaded();
    }, this);

    // Check for JSON dependency
    if (window['JSON'] == undefined) {
      Socky.Utils.log("no JSON support, requiring it");
      scripts_to_require.push(this._assets_location + '/json2<DEPENDENCY_SUFFIX>.js');
    }

    // Check for Flash fallback dep. Wrap initialization.
    if (window['WebSocket'] == undefined) {

      Socky.Utils.log("no WebSocket driver available, requiring it");

      // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
      window.WEB_SOCKET_SWF_LOCATION = this._assets_location + "/WebSocketMain.swf";
      window.WEB_SOCKET_DEBUG = this._flash_debug;

      scripts_to_require.push(this._assets_location + '/flashfallback<DEPENDENCY_SUFFIX>.js');
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
    Socky.Utils.each(this._socky_instances, function(socky) {
      if (!socky.is_connected()) {
        socky.connect();
      }
    });
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
