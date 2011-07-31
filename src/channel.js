Socky.Channel = Events.extend({
  init: function(channel_name, socky) {
    this._socky = socky;
    this._name = channel_name;
    this._callbacks = {};
    this._global_callbacks = [];
    this._subscribed = false;
    this._auth = null;
    this.raw_event_bind('socky:subscribe:success', Socky.Utils.bind(this.acknowledge_subscription, this));
  },

  disconnect: function(){
  },

  acknowledge_subscription: function(data){
    this._subscribed = true;
    this._trigger('public', 'socky:subscribe:success', data.members);
  },

  is_private: function(){
    return false;
  },

  is_presence: function(){
    return false;
  },

  subscribe: function() {
    if (this._started_subscribe) {
      return;
    }
    this._started_subscribe = true;
    var self = this;
    this.authorize(
      function(data) {
        self._auth = data.auth;
        self.send_event('socky:subscribe', self.generate_subscription_payload());
      },
      function(data) {
        self._socky.send_locally({
          event: 'socky:subscribe:failure',
          channel: self._name
        });
      }
    );
  },

  generate_subscription_payload: function() {
    return null;
  },

  unsubscribe: function() {
    this.send_event('socky:unsubscribe');
  },

  authorize: function(callback){
    // normal channels don't require auth
    callback({});
  },

  send_event: function(event_name, payload) {
    payload = payload || {};
    payload.event = event_name;
    payload.channel = this._name;
    payload.auth = this._auth;
    this._socky.send(payload);
  },

  receive_event: function(event_name, payload) {
    if(payload.event.match(/^socky:/)) {
      // notify internal handlers
      this._trigger('raw', payload.event, payload);
    } else {
      // notify the external (client) handlers, passing them just the 'data' param
      this._trigger('public', payload.event, payload.data);
    }
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

  trigger: function(event, data) {
    this.send_event(event, {data: data});
  }

});
