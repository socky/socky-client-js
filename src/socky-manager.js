var SockyManager = {

  // private attributes
  _is_websocket_driver_loaded: false,
  _socky_instances: [],

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
    var path = SockyManager.options.websocket_path || '/socket';
    var host = SockyManager.options.websocket_host || window.location.hostname;
    var port = SockyManager.options.websocket_port || 8080;
    var secure = SockyManager.options.websocket_secure || false;
    var app_name = SockyManager.options.app_name || "";

    var url = 'ws';
    if (secure) {
      url += "s";
    }
    url += "://" + host + ":" + path + "/" + app_name;

    return url;
  }

  init: function(options) {

    SockyManager.options = options;

    var scripts_to_require = [];

    // Check for JSON dependency
    if (window['JSON'] == undefined) {
      scripts_to_require.push(options.assets_location + '/json2<DEPENDENCY_SUFFIX>.js');
    }

    var success_callback = null;

    // Check for Flash fallback dep. Wrap initialization.
    if (window['WebSocket'] == undefined) {

      // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
      window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
      window.WEB_SOCKET_SWF_LOCATION = SockyManager.assets_location + "/WebSocketMain.swf";
      window.WEB_SOCKET_DEBUG = options.websocket_debug;

      scripts_to_require.push(options.assets_location + '/flashfallback<DEPENDENCY_SUFFIX>.js');

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
  }

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
    assets_location: '<CDN_LOCATION>',
    app_name: "your_app_name",
    websocket_debug: false,
    websocket_path: '/socket',
    websocket_host: window.location.hostname,
    websocket_port: 8080,
    websocket_secure: false
  });

*/