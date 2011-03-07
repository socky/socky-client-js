Socky.Channel = Class.extend({
  init: function(channel_name, socky) {
    this.socky = socky;
    this.name = channel_name;
    this.callbacks = {};
    this.global_callbacks = [];
    this.subscribed = false;
  },

  disconnect: function(){
  },

  // Activate after successful subscription. Called on top-level socky:subscription_succeeded
  acknowledge_subscription: function(data){
    this.subscribed = true;
  },

  bind: function(event_name, callback) {
    this.callbacks[event_name] = this.callbacks[event_name] || [];
    this.callbacks[event_name].push(callback);
    return this;
  },

  bind_all: function(callback) {
    this.global_callbacks.push(callback);
    return this;
  },

  trigger: function(event_name, data) {
    this.socky.send_event(event_name, data, this.name);
    return this;
  },

  dispatch_with_all: function(event_name, data) {
    if (this.name != 'socky_global_channel') {
      Socky.Utils.log("event recd (channel,event,data)", this.name, event_name, data);
    }
    this.dispatch(event_name, data);
    this.dispatch_global_callbacks(event_name, data);
  },

  dispatch: function(event_name, event_data) {
    var callbacks = this.callbacks[event_name];

    if (callbacks) {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](event_data);
      }
    } else if (!this.global) {
      Socky.Utils.log('No callbacks for ' + event_name);
    }
  },

  dispatch_global_callbacks: function(event_name, event_data) {
    for (var i = 0; i < this.global_callbacks.length; i++) {
      this.global_callbacks[i](event_name, event_data);
    }
  },

  is_private: function(){
    return false;
  },

  authorize: function(socky, callback){
    // normal channels don't require auth
    callback({});
  }

});

Socky.PrivateChannel = Socky.Channel.extend({

  is_private: function(){
    return true;
  },

  authorize: function(socky, callback){
    if (SockyManager.channel_auth_transport() == "ajax") {
      this.authorize_via_ajax(socky, callback);
    } else {
      this.authorize_via_jsonp(socky, callback);
    }
  },

  authorize_via_ajax: function(socky, callback){
    var self = this;
    var xhr = window.XMLHttpRequest ?
      new XMLHttpRequest() :
      new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", SockyManger.channel_auth_endpoint(), true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = Socky.Utils.parseJSON(xhr.responseText);
          callback(data);
        } else {
          Socky.Utils.log("Couldn't get auth info from your webapp" + status);
        }
      }
    };
    xhr.send('socket_id=' + encodeURIComponent(socky.socket_id) + '&channel_name=' + encodeURIComponent(self.name));
  },

  authorize_via_jsonp: function(socky, callback){
    var qstring = 'socket_id=' + encodeURIComponent(socky.socket_id) + '&channel_name=' + encodeURIComponent(this.name);
    var script = document.createElement("script");
    Pusher.auth_callbacks[this.name] = callback;
    var callback_name = "Pusher.auth_callbacks['" + this.name + "']";
    script.src = Pusher.channel_auth_endpoint+'?callback='+encodeURIComponent(callback_name)+'&'+qstring;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore( script, head.firstChild );
  }
});

Socky.ChannelCollection = Class.extend({

  init: function() {
    this._channels = {};
  },

  add: function(channel_name, socky) {
    var existing_channel = this.find(channel_name);
    if (!existing_channel) {
      var channel = null;

      if (channel_name.indexOf("private-") === 0) {
        channel = new Socky.PrivateChannel(channel_name, socky);
      } else {
        channel = new Socky.Channel(channel_name, socky);
      }

      this._channels[channel_name] = channel;
      return channel;
    } else {
      return existing_channel;
    }
  },

  find: function(channel_name) {
    return this._channels[channel_name];
  },

  remove: function(channel_name) {
    delete this._channels[channel_name];
  }

});
