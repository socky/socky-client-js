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
    deps.push(SOCKY_ASSET_LOCATION + '/json2<DEPENDENCY_SUFFIX>.js');
  }
  // Check for Flash fallback dep. Wrap initialization.
  if (window['WebSocket'] == undefined) {
    // Don't let WebSockets.js initialize on load. Inconsistent accross browsers.
    window.WEB_SOCKET_DISABLE_AUTO_INITIALIZATION = true;
    // Set URL of your WebSocketMain.swf here:
    window.WEB_SOCKET_SWF_LOCATION = SOCKY_ASSET_LOCATION + "/WebSocketMain.swf";
    // Set this to dump debug message from Flash to console.log:
    window.WEB_SOCKET_DEBUG = false;
    deps.push(SOCKY_ASSET_LOCATION + '/flashfallback<DEPENDENCY_SUFFIX>.js');
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