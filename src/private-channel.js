Socky.PrivateChannel = Socky.Channel.extend({

  init: function(channel_name, socky, permissions) {
    this._super(channel_name, socky);
    this._permissions = permissions;
  },

  is_private: function(){
    return true;
  },

  authorize: function(callback){
    if (this._socky.auth_transport() == "ajax") {
      this.authorize_via_ajax(callback);
    } else {
      this.authorize_via_jsonp(callback);
    }
  },

  generate_subscription_payload: function() {
    var payload = {};
    if (this._permissions.read === false) {
      payload.read = false;
    }
    if (this._permissions.write === true) {
      payload.write = true;
    }
    return payload;
  },

  generate_auth_payload: function() {
    var payload = {
      'event': 'socky:subscribe',
      'channel': this._name,
      'connection_id': this._socky.connection_id()
    };
    Socky.Utils.extend(payload, this.generate_subscription_payload());
    return payload;
  },

  authorize_via_ajax: function(callback){
    var self = this;
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", this._socky.auth_endpoint(), true);
    xhr.setRequestHeader("Content-Type", "application/json")
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = Socky.Utils.parseJSON(xhr.responseText);
          callback(data);
        } else {
          Socky.Utils.log("Couldn't get auth info from your webapp", status);
        }
      }
    };
    var payload = this.generate_auth_payload();
    xhr.send(JSON.stringify(payload));
  },

  authorize_via_jsonp: function(callback) {

    var callback_name = this._name;
    Socky.Manager._jsonp_auth_callbacks[callback_name] = callback;

    var payload = this.generate_auth_payload();

    var full_callback_name = "Socky.Manager._jsonp_auth_callbacks['" + callback_name + "']"
    var script_url = this._socky.auth_endpoint();
    script_url += '?callback=' + encodeURIComponent(full_callback_name);
    script_url += '&payload=' + encodeURIComponent(JSON.stringify(payload));

    var script = document.createElement("script");
    script.src = script_url;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore( script, head.firstChild );
  }

});