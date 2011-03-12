Socky.ChannelsCollection = Class.extend({

  each: function(iterator) {
    Socky.Utils.each(this._channels, function(channel) {
      iterator(channel);
    });
  },

  init: function(socky) {
    this._socky = socky;
    this._channels = {};
  },

  add: function(obj) {
    var self = this;
    if (obj instanceof Socky.ChannelsCollection) {
      Socky.Utils.extend(this._channels, obj._channels);
    } else {
      var channel_name = obj;
      var existing_channel = this.find(channel_name);
      if (!existing_channel) {
        var channel = null;
        if (channel_name.indexOf("private-") === 0) {
          channel = new Socky.PrivateChannel(channel_name, this._socky);
        } else if (channel_name.indexOf("presence-") === 0) {
          channel = new Socky.PresenceChannel(channel_name, this._socky);
        } else {
          channel = new Socky.Channel(channel_name, this._socky);
        }
        this._channels[channel_name] = channel;
        return channel;
      }
    }
  },

  find: function(channel_name) {
    return this._channels[channel_name];
  },

  remove: function(channel_name) {
    delete this._channels[channel_name];
  },

  channel_names: function() {
    var channel_names = [];
    for (var channel_name in this._channels) {
      channel_names.push(channel_name)
    }
    return channel_names;
  }

});
