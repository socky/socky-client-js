Socky.PresenceChannel = Socky.PrivateChannel.extend({

  init: function(channel_name, socky) {
    this._super(channel_name, socky);
    this._members = {};
    this.bind('socky_internal:member_added', Socky.Utils.bind(this.on_member_added, this));
    this.bind('socky_internal:member_removed', Socky.Utils.bind(this.on_member_added, this));
  },

  disconnect: function(){
    this._members = {};
  },

  is_presence: function() {
    return true;
  },

  acknowledge_subscription: function(data) {
    this._super(data);
    this._members = data.members;
  },

  on_member_added: function(data) {
    this._members[data.connection_id] = data.data;
    this.trigger('socky:member_added', data.data);
  },

  on_member_removed: function(data) {
    var member = this._members[data.connection_id];
    delete this._members[data.connection_id];
    this.trigger('socky:member_removed', member);
  },

  members: function() {
    return this._members;
  }

});

