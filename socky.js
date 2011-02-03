/**
 * Socky push-server JavaScript client
 *
 * @version 0.4.2
 * @author  Bernard Potocki <bernard.potocki@imanel.org>
 * @license The MIT license.
 * @source  http://github.com/socky/socky-js
 *
 */

// Asset location for Socky(flash fallback and JSON files)
window.SOCKY_ASSET_LOCATION = 'assets';

Socky = function(host, port, params) {
  this.host = host;
  this.port = port;
  this.params = params;
  // Open only if everything is loaded
  if(Socky.isReady) {
    this.connect();
  } else {
    Socky.instances.push(this);
  }
};

// Initializers
Socky.isReady = false;
Socky.instances = [];

// Socky states
Socky.CONNECTING = 0;
Socky.AUTHENTICATING = 1;
Socky.OPEN = 2;
Socky.CLOSED = 3;
Socky.UNAUTHENTICATED = 4;

Socky.prototype.connect = function() {
  var instance = this;
  instance.state = Socky.CONNECTING;

  var ws = new WebSocket(this.host + ':' + this.port + '/?' + this.params);
  ws.onopen    = function()    { instance.onopen(); };
  ws.onmessage = function(evt) { instance.onmessage(evt); };
  ws.onclose   = function()    { instance.onclose(); };
  ws.onerror   = function()    { instance.onerror(); };
};



// ***** Private methods *****
// Try to avoid any modification of these methods
// Modification of these methods may cause script to work invalid
// Please see 'public methods' below
// ***************************

// Run instances that are not already initialized
Socky.ready = function () {
  Socky.isReady = true;
  for(var i = 0; i < Socky.instances.length; i++) {
    if(Socky.instances[i].state == undefined) Socky.instances[i].connect();
  }
}

// Called when connection is opened
Socky.prototype.onopen = function() {
  this.state = Socky.AUTHENTICATING;
  this.respond_to_connect();
};

// Called when socket message is received
Socky.prototype.onmessage = function(evt) {
  try {
    var request = JSON.parse(evt.data);
    switch (request.type) {
      case "message":
        this.respond_to_message(request.body);
        break;
      case "authentication":
        if(request.body == "success") {
          this.state = Socky.OPEN;
          this.respond_to_authentication_success();
        } else {
          this.state = Socky.UNAUTHENTICATED;
          this.respond_to_authentication_failure();
        }
        break;
    }
  } catch (e) {
    console.error(e.toString());
  }
};

// Called when socket connection is closed
Socky.prototype.onclose = function() {
  if(this.state != Socky.CLOSED && this.state != Socky.UNAUTHENTICATED) {
    this.respond_to_disconnect();
  }
};

// Called when error occurs
// Currently unused
Socky.prototype.onerror = function() {};



// ***** Public methods *****
// These methods can be freely modified.
// The change should not affect the normal operation of the script.
// **************************

// Called after connection but before authentication confirmation is received
// At this point user is still not allowed to receive messages
Socky.prototype.respond_to_connect = function() {
};

// Called when authentication confirmation is received.
// At this point user will be able to receive messages
Socky.prototype.respond_to_authentication_success = function() {
};

// Called when authentication is rejected by server
// This usually means that secret is invalid or that authentication server is unavailable
// This method will NOT be called if connection with Socky server will be broken - see respond_to_disconnect
Socky.prototype.respond_to_authentication_failure = function() {
};

// Called when new message is received
// Note that msg is not sanitized - it can be any script received.
Socky.prototype.respond_to_message = function(msg) {
  eval(msg);
};

// Called when connection is broken between client and server
// This usually happens when user lost his connection or when Socky server is down.
// At default it will try to reconnect after 1 second.
Socky.prototype.respond_to_disconnect = function() {
    var instance = this;
    setTimeout(function() { instance.connect(); }, 1000);
}

// ***** Asset loading *****
// These methods should not be modified.
// They load JSON and flash fallback if they are required
// *************************

// Function to load external javascript
var _require = (function () {

  var handleScriptLoaded;
  if (document.addEventListener) {
    handleScriptLoaded = function (elem, callback) {
      elem.addEventListener('load', callback, false)
    }
  } else {
    handleScriptLoaded = function(elem, callback) {
      elem.attachEvent('onreadystatechange', function () {
        if(elem.readyState == 'loaded' || elem.readyState == 'complete') callback()
      })
    }
  }

  return function (deps, callback) {
    var dep_count = 0,
    dep_length = deps.length;

    function checkReady (callback) {
      dep_count++;
      if ( dep_length == dep_count ) {
        // Opera needs the timeout for page initialization weirdness
        setTimeout(callback, 0);
      }
    }

    function addScript (src, callback) {
      callback = callback || function(){}
      var head = document.getElementsByTagName('head')[0];
      var script = document.createElement('script');
      script.setAttribute('src', src);
      script.setAttribute("type","text/javascript");
      script.setAttribute('async', true);

      handleScriptLoaded(script, function () {
        checkReady(callback);
      });

      head.appendChild(script);
    }

    for(var i = 0; i < dep_length; i++) {
      addScript(deps[i], callback);
    }
  }
})();

// Check if JSON and WebSocket is available
;(function() {
  var deps = [],
      callback = function () {
        Socky.ready()
      }
  // Check for JSON dependency
  if (window['JSON'] == undefined) {
    deps.push(SOCKY_ASSET_LOCATION + '/json2.js');
  }
  // Check for Flash fallback dep. Wrap initialization.
  if (window['WebSocket'] == undefined) {
    // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
    // Set URL of your WebSocketMain.swf here:
    window.WEB_SOCKET_SWF_LOCATION = SOCKY_ASSET_LOCATION + "/WebSocketMain.swf";
    // Set this to dump debug message from Flash to console.log:
    window.WEB_SOCKET_DEBUG = false;
    deps.push(SOCKY_ASSET_LOCATION + '/flashfallback.js');
    callback = function(){
      FABridge.addInitializationCallback('webSocket', function () {
        Socky.ready();
      })
      // Run this AFTER adding the callback above
      WebSocket.__initialize();
    }
  }

  if( deps.length > 0){
    _require(deps, callback);
  } else {
    callback();
  }

})();