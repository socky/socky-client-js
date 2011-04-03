this.Socky = Events.extend({

  init: function(url, options) {

    if (!Socky.Manager.is_inited()) {
      Socky.Manager.init(options ? options.assets_location : null);
    }

    this._options = Socky.Utils.extend({}, Socky.Manager.default_options(), options, {url: url});
    this._channels = new Socky.ChannelsCollection(this);
    this._is_connected = false;
    this._connection_id = null;
    this._connection = null;

    if (Socky.Manager.is_driver_loaded()) {
      this.connect();
    } else {
      this.log('WebSocket driver still unavailable, waiting...');
    }

    this.raw_event_bind('socky:connection:established', Socky.Utils.bind(this._on_connection_established, this));

    Socky.Manager.add_socky_instance(this);
  },

  auth_transport: function() {
    return this._options.auth_transport;
  },

  auth_endpoint: function() {
    return this._options.auth_endpoint;
  },

  connection_id: function() {
    return this._connection_id;
  },

  is_connected: function() {
    return this._is_connected;
  },

  connect: function() {
    var self = this;

    if (this._connection) {
      return;
    }

    if (window.WebSocket) {
      var url = this._options.url;
      this.log('connecting', url);
      this._connection = new WebSocket(url);
      this._connection.onopen = Socky.Utils.bind(this.on_socket_open, this);
      this._connection.onmessage = Socky.Utils.bind(this.on_socket_message, this);
      this._connection.onclose = Socky.Utils.bind(this.on_socket_close, this);
      this._connection.onerror = Socky.Utils.bind(this.on_socket_error, this);
      setTimeout(Socky.Utils.bind(function() {
        if (!this._connection_open) {
          this._connection = null;
          // simulate a remote event
          this.send_locally({
            event: 'socky:connection:error',
            reason: 'down'
          });
        }
      }, this), 2000);
    } else {
      this.log('WebSocket unavailable');
      this._connection = {};
    }
  },

  on_socket_open: function() {
    this.log('connected to socket, waiting for connection_id');
    this._connection_open = true;
  },

  on_socket_message: function(evt) {
    var params = Socky.Utils.parseJSON(evt.data);

    if (typeof(params.data) == 'string') {
      params.data = Socky.Utils.parseJSON(params.data);
    }

    this.log('received message', params);

    // first notify internal handlers
    this._trigger('raw', params.event, params);

    // notify the external (client) handlers
    this._trigger('public', params.event, params);

    if (params.channel) {
      // then notify channels' internal handlers
      var channel = this.channel(params.channel);
      if (channel) {
        channel.receive_event(params.event, params);
      }
    }

  },

  on_socket_error: function(evt) {
    this.log('error', evt.data);
    this._is_connected = false;
  },

  on_socket_close: function() {
    this.log('disconnected');
    this._is_connected = false;
    this.send_locally({
      event: 'socky:connection:closed'
    });
  },

  log: function() {
    Socky.Utils.log.apply(Socky.Manager, arguments);
  },

  subscribe: function(channel_name, permissions, data) {
    var channel = this._channels.add(channel_name, permissions, data);
    if (this._is_connected) {
      channel.subscribe();
    }
    return channel;
  },

  unsubscribe: function(channel_name) {
    var channel = this.channel(channel_name);
    if (channel) {
      if (this._is_connected) {
        channel.unsubscribe();
      }
      this._channels.remove(channel_name);
    } else {
      this.send_locally({
        event: 'socky:unsubscribe:failure',
        channel: channel_name
      });
    }
  },

  send_locally: function(payload) {
    this.on_socket_message({
      data: payload
    });
  },

  send: function(payload) {
    payload.connection_id = this._connection_id;
    this.log("sending message", payload);
    this._connection.send(JSON.stringify(payload));
    return this;
  },

  raw_event_bind: function(event, callback) {
    this._bind('raw', event, callback);
  },

  raw_event_unbind: function(event, callback) {
    this._unbind('raw', event, callback);
  },

  bind: function(event, callback) {
    this._bind('public', event, callback);
  },

  unbind: function(event, callback) {
    this._unbind('public', event, callback);
  },

  channel: function(channel_name) {
    return this._channels.find(channel_name);
  },

  close: function() {
    if (this._connection) {
      this._connection.close();
    }
  },

  // private methods

  _on_connection_established: function(data) {
    Socky.Utils.log("connection_id", data.connection_id);
    this._connection_id = data.connection_id;
    this._is_connected = true;
    this._subscribe_pending_channels();
  },

  _subscribe_pending_channels: function() {
    this._channels.each(function(channel) {
      channel.subscribe();
    });
  }

});