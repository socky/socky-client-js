Socky = Class.extend({

  init: function(options) {
    this._options = options || {};

    this._channels = new Socky.ChannelCollection();
    this._is_connected = false;
    this._connection_id = null;
    this._connection = null;

    if (SockyManager.is_driver_loaded()) {
      this.connect();
    }

    SockyManager.add_socky_instance(this);
  },

  is_connected: function() {
    return this._is_connected;
  },

  connect: function() {
    var self = this;

    if (window.WebSocket) {
      var url = SockyManager.websocket_url();
      this.log('connecting', url);
      this._connection = new WebSocket(url);
      this._connection.onopen = Socky.Utils.bind(this.on_socket_open, this);
      this._connection.onmessage = Socky.Utils.bind(this.on_socket_message, this);
      this._connection.onclose = Socky.Utils.bind(this.on_socket_close, this);
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
    Socky.Utils.log.apply(SockyManager, arguments);
  },

  subscribe: function(channel_names) {
    if (!(channel_names instanceof Array)) {
      channel_names = [ channels ];
    }

    if (this._is_connected) {
      var self = this;
      channel.authorize(this, function(data) {
        self.send_event('socky:subscribe', {
          channels: channel_names,
          auth: data.auth
        });
        Socky.Utils.each(channel_names, function(channel_name) {
          self._channels.add(channel_name, self);
        });
      });
    }

    return channel;
  },

  unsubscribe: function(channels) {
    Socky.Utils.each(channels, function(channel) {
      this._channels.remove(channel);
    });
    if (this._is_connected) {
      this.send_event('socky:unsubscribe', {
        channels: channel
      });
    }
  },

  send_event: function(event_name, data, channels) {
    Socky.Utils.log("event sent (channels,event,data)", channels, event_name, data);

    var payload = {
      event: event_name,
      data: data
    };

    if (channels) {
      payload['channels'] = channels
    }

    this._connection.send(JSON.stringify(payload));

    return this;
  }

});