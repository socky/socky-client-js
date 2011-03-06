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