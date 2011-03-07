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