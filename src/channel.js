Socky.Channel = Events.extend({
  init: function(channel_name, socky) {
    this._socky = socky;
    this._name = channel_name;
    this._callbacks = {};
    this._global_callbacks = [];
    this._subscribed = false;
    this._auth = null;
    this.bind('socky_internal:subscribe:success', Socky.Utils.bind(this.acknowledge_subscription, this));
  },

  disconnect: function(){
  },

  acknowledge_subscription: function(data){
    this._subscribed = true;
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
    this.authorize(function(data) {
      self._auth = data.auth;
      self.send_event('socky:subscribe', self.generate_subscription_payload());
    });
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
  }

});
