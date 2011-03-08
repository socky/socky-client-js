Socky = Events.extend({

  init: function(options) {

    if (!Socky.Manager.is_inited()) {
      Socky.Manager.init();
    }

    this._options = Socky.Utils.extend({}, Socky.Manager.default_options(), options);
    this._channels = new Socky.ChannelsCollection(this);
    this._is_connected = false;
    this._connection_id = null;
    this._connection = null;

    if (Socky.Manager.is_driver_loaded()) {
      this.connect();
    } else {
      this.log('WebSocket driver still unavailable, waiting...');
    }

    this.bind('socky:connection_established', Socky.Utils.bind(this._on_connection_established, this));

    Socky.Manager.add_socky_instance(this);
  },

  channel_auth_transport: function() {
    return this._options.channel_auth_transport;
  },

  channel_auth_endpoint: function() {
    return this._options.channel_auth_endpoint;
  },

  connection_id: function() {
    return this._connection_id;
  },

  is_connected: function() {
    return this._is_connected;
  },

  url: function() {
    var url = 'ws';
    if (this._options.secure) {
      url += "s";
    }
    url += "://" + this._options.host + ":" + this._options.port + this._options.path + "/" + this._options.app_name;

    return url;
  },

  connect: function() {
    var self = this;

    if (window.WebSocket) {
      var url = this.url();
      this.log('connecting', url);
      this._connection = new WebSocket(url);
      this._connection.onopen = Socky.Utils.bind(this.on_socket_open, this);
      this._connection.onmessage = Socky.Utils.bind(this.on_socket_message, this);
      this._connection.onclose = Socky.Utils.bind(this.on_socket_close, this);
    } else {
      this.log('WebSocket unavailable');
      this._connection = {};
    }
  },

  on_socket_open: function() {
    this.log('connected to socket, waiting for connection_id');
  },

  on_socket_message: function(evt) {
    this.log('received message', evt.data);

    var params = Socky.Utils.parseJSON(evt.data);

    if (typeof(params.data) == 'string') {
      params.data = Socky.Utils.parseJSON(params.data);
    }

    if (params.channel) {
      this._channels.find(params.channel).trigger(params.event, params);
    }

    this.trigger(params.event, params);
  },

  on_socket_close: function() {
    this.log('disconnected');
    this._is_connected = false;
  },

  log: function() {
    Socky.Utils.log.apply(Socky.Manager, arguments);
  },

  subscribe: function(channel_name, additional_data) {
    var channel = this._channels.add(channel_name);
    if (this._is_connected) {
      channel.subscribe(additional_data);
    }
  },

  unsubscribe: function(channel_name) {
    var channel = this._channels.find(channel_name);
    if (channel) {
      if (this._is_connected) {
        channel.unsubscribe();
      }
      this._channels.remove(channel_name);
    }
  },

  send: function(payload) {
    payload.connection_id = this._connection_id;
    Socky.Utils.log("sending message", JSON.stringify(payload));
    this._connection.send(JSON.stringify(payload));
    return this;
  },

  // private methods

  _on_connection_established: function(data) {
    Socky.Utils.log("connection_id", data.connection_id);
    this._connection_id = data.connection_id;
    this._is_connected = true
    this._subscribe_pending_channels();
  },

  _subscribe_pending_channels: function() {
    this._channels.each(function(channel) {
      channel.subscribe();
    });
  }

});
