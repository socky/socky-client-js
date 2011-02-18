var Socky = function(options) {
  this.options = options || {};

  this.app_name = this.options.app_name || "";
  this.host = this.options.host || window.location.hostname;
  this.port = this.options.port || 8080;
  this.secure = this.options.secure || false;

  this.connected = false;
  this.connection_id = null;

  if(Socky.isReady){ this.connect(); }
  Socky.instances.push(this);
};

Socky.websocket_path = '/socket/';
Socky.isReady = false;
Socky.instances = [];
Socky.log = function(msg){ console.log(msg); };

Socky.ready = function () {
  Socky.isReady = true;
  var i = 0;
  for(i = 0; i < Socky.instances.length; i++) {
    if(!Socky.instances[i].connected){ Socky.instances[i].connect(); }
  }
};

Socky.prototype = {
  connect: function() {
    var url = 'ws';
    if (this.secure) { url += "s"; }
    url += "://" + this.host + ":" + this.port + Socky.websocket_path + this.app_name;

    var self = this;

    if('WebSocket' in window) {
      Socky.log('Socky : connecting : ' + url );

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

      this.connection = ws;
    } else {
      Socky.log('Socky : WebSocket unavailable');
      this.connection = {};
    }
  },
  onopen: function() {
    Socky.log('Socky : connected');
  },
  onmessage: function(evt) {
    Socky.log('Socky : received message : ' + evt.data);
  },
  onclose: function() {
    Socky.log('Socky : disconnected');
  }
};


// // Asset location for Socky(flash fallback and JSON files)
// window.SOCKY_ASSET_LOCATION = 'http://js.socky.org/v0.4/assets';
//
// Socky = function(host, port, params) {
//   this.host = host;
//   this.port = port;
//   this.params = params;
//   // Open only if everything is loaded
//   if(Socky.isReady) {
//     this.connect();
//   } else {
//     Socky.instances.push(this);
//   }
// };
//
// // Initializers
// Socky.isReady = false;
// Socky.instances = [];
//
// // Socky states
// Socky.CONNECTING = 0;
// Socky.AUTHENTICATING = 1;
// Socky.OPEN = 2;
// Socky.CLOSED = 3;
// Socky.UNAUTHENTICATED = 4;
//
// Socky.prototype.connect = function() {
//   var instance = this;
//   instance.state = Socky.CONNECTING;
//
//   var ws = new WebSocket(this.host + ':' + this.port + '/?' + this.params);
//   ws.onopen    = function()    { instance.onopen(); };
//   ws.onmessage = function(evt) { instance.onmessage(evt); };
//   ws.onclose   = function()    { instance.onclose(); };
//   ws.onerror   = function()    { instance.onerror(); };
// };
//
//
//
// // ***** Private methods *****
// // Try to avoid any modification of these methods
// // Modification of these methods may cause script to work invalid
// // Please see 'public methods' below
// // ***************************
//
// // Run instances that are not already initialized
// Socky.ready = function () {
//   Socky.isReady = true;
//   for(var i = 0; i < Socky.instances.length; i++) {
//     if(Socky.instances[i].state == undefined) Socky.instances[i].connect();
//   }
// }
//
// // Called when connection is opened
// Socky.prototype.onopen = function() {
//   this.state = Socky.AUTHENTICATING;
//   this.respond_to_connect();
// };
//
// // Called when socket message is received
// Socky.prototype.onmessage = function(evt) {
//   try {
//     var request = JSON.parse(evt.data);
//     switch (request.type) {
//       case "message":
//         this.respond_to_message(request.body);
//         break;
//       case "authentication":
//         if(request.body == "success") {
//           this.state = Socky.OPEN;
//           this.respond_to_authentication_success();
//         } else {
//           this.state = Socky.UNAUTHENTICATED;
//           this.respond_to_authentication_failure();
//         }
//         break;
//     }
//   } catch (e) {
//     console.error(e.toString());
//   }
// };
//
// // Called when socket connection is closed
// Socky.prototype.onclose = function() {
//   if(this.state != Socky.CLOSED && this.state != Socky.UNAUTHENTICATED) {
//     this.respond_to_disconnect();
//   }
// };
//
// // Called when error occurs
// // Currently unused
// Socky.prototype.onerror = function() {};
//
//
//
// // ***** Public methods *****
// // These methods can be freely modified.
// // The change should not affect the normal operation of the script.
// // **************************
//
// // Called after connection but before authentication confirmation is received
// // At this point user is still not allowed to receive messages
// Socky.prototype.respond_to_connect = function() {
// };
//
// // Called when authentication confirmation is received.
// // At this point user will be able to receive messages
// Socky.prototype.respond_to_authentication_success = function() {
// };
//
// // Called when authentication is rejected by server
// // This usually means that secret is invalid or that authentication server is unavailable
// // This method will NOT be called if connection with Socky server will be broken - see respond_to_disconnect
// Socky.prototype.respond_to_authentication_failure = function() {
// };
//
// // Called when new message is received
// // Note that msg is not sanitized - it can be any script received.
// Socky.prototype.respond_to_message = function(msg) {
//   eval(msg);
// };
//
// // Called when connection is broken between client and server
// // This usually happens when user lost his connection or when Socky server is down.
// // At default it will try to reconnect after 1 second.
// Socky.prototype.respond_to_disconnect = function() {
//     var instance = this;
//     setTimeout(function() { instance.connect(); }, 1000);
// }