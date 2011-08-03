(function() {
  var __slice = Array.prototype.slice;
  window.Socky = {
    assets_location: '<ASSETS_LOCATION>',
    debug: false,
    fallback_debug: false,
    _client_instances: [],
    _is_drivers_loaded: false,
    _is_initialized: false,
    _use_minified_assets: false,
    init: function() {
      var scripts_to_require, success_callback;
      if (this._is_initialized) {
        return;
      }
      scripts_to_require = [];
      success_callback = function() {
        this._is_initialized = true;
        return this._drivers_loaded();
      };
      if (window.JSON == null) {
        this.log('loading JSON driver');
        scripts_to_require.push("" + this.assets_location + "/json2." + (this._assets_extension()));
      }
      if (window.WebSocket == null) {
        this.log('loading WebSocket driver');
        window.WEB_SOCKET_SWF_LOCATION = "" + this.assets_location + "/flashfallback.swf";
        window.WEB_SOCKET_DEBUG = this.fallback_debug;
        scripts_to_require.push("" + this.assets_location + "/flashfallback." + (this._assets_extension()));
      }
      if (scripts_to_require.length > 0) {
        return this._require_scripts(scripts_to_require, success_callback);
      } else {
        return success_callback();
      }
    },
    log: function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.debug) {
        return console.log("Socky : " + (args.join(" : ")));
      }
    },
    _assets_extension: function() {
      if (this._use_minified_assets) {
        return 'min.js';
      } else {
        return 'js';
      }
    },
    _drivers_loaded: function() {
      var client, _i, _len, _ref, _results;
      this._is_drivers_loaded = true;
      _ref = this._client_instances;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        client = _ref[_i];
        _results.push(!client.connected ? client.connect() : void 0);
      }
      return _results;
    },
    _require_scripts: function(scripts, callback) {
      var add_script, check_if_ready, handle_script_loaded, script, scripts_count, _i, _len, _results;
      scripts_count = 0;
      if (document.addEventListener) {
        handle_script_loaded = function(elem, callback) {
          return elem.addEventListener('load', callback, false);
        };
      } else {
        handle_script_loaded = function(elem, callback) {
          return elem.attachEvent('onreadystatechange', function() {
            if (elem.readyState === 'loaded' || elem.readyState === 'complete') {
              return callback();
            }
          });
        };
      }
      check_if_ready = function(callback) {
        scripts_count++;
        if (scripts.length === scripts_count) {
          return setTimeout(callback, 0);
        }
      };
      add_script = function(src, callback) {
        var head, script;
        callback || (callback = function() {});
        head = document.getElementsByTagName('head')[0];
        script = document.createElement('script');
        script.setAttribute('src', src);
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('async', true);
        handle_script_loaded(script, function() {
          return check_if_ready(callback);
        });
        return head.appendChild(script);
      };
      _results = [];
      for (_i = 0, _len = scripts.length; _i < _len; _i++) {
        script = scripts[_i];
        _results.push(add_script(script, callback));
      }
      return _results;
    }
  };
}).call(this);
