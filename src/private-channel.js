Socky.PrivateChannel = Socky.Channel.extend({

  is_private: function(){
    return true;
  },

  authorize: function(callback){
    if (this._socky.channel_auth_transport() == "ajax") {
      this.authorize_via_ajax(callback);
    } else {
      this.authorize_via_jsonp(callback);
    }
  },

  authorize_via_ajax: function(callback){
    var self = this;
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", this._socky.channel_auth_endpoint(), true);
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
    var payload = {
      'event': 'socky:subscribe',
      'channel': this._name,
      'connection_id': this._socky.connection_id()
    };
    xhr.send(JSON.stringify(payload));
  },

  authorize_via_jsonp: function(callback) {

    var callback_name = this.name;
    Socky.Manager._jsonp_auth_callbacks[callback_name] = callback;

    var payload = {
      'event': 'socky:subscribe',
      'channel': this._name,
      'connection_id': this._socky.connection_id()
    };

    var full_callback_name = "Socky.Manager._jsonp_auth_callbacks['" + callback_name + "']"
    var script_url = Socky.Manager.channel_auth_endpoint();
    script_url += '?callback=' + encodeURIComponent(full_callback_name);
    script_url += '&payload=' + encodeURIComponent(JSON.stringify(payload));

    var script = document.createElement("script");
    script.src = script_url;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore( script, head.firstChild );
  }

});