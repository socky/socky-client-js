Socky.PrivateChannel = Socky.Channel.extend({

  init: function(channel_name, socky, options) {
    this._super(channel_name, socky);
    var default_permissions = {
      read: true,
      write: false,
      presence: false
    };
    this._permissions = Socky.Utils.extend({}, default_permissions, options);
  },

  is_private: function(){
    return true;
  },

  authorize: function(success_callback, failure_callback){
    if (this._socky.auth_transport() == "ajax") {
      this.authorize_via_ajax(success_callback, failure_callback);
    } else {
      this.authorize_via_jsonp(success_callback, failure_callback);
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

  generate_auth_payload_string: function() {
    var params = [];
    var payload = this.generate_auth_payload();
    for (var i in payload) {
      params.push(i + '=' + encodeURIComponent(payload[i]));
    }
    return params.join('&');
  },

  authorize_via_ajax: function(success_callback, failure_callback){
    var self = this;
    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open("POST", this._socky.auth_endpoint(), true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          var data = Socky.Utils.parseJSON(xhr.responseText);
          success_callback(data);
        } else {
          failure_callback();
        }
      } else {
        failure_callback();
      }
    };
    var payload = this.generate_auth_payload_string();
    xhr.send(payload);
  },

  authorize_via_jsonp: function(success_callback, failure_callback) {

    var callback_name = this._name;
    var success_called = false;
    Socky.Manager._jsonp_auth_callbacks[callback_name] = function(data) {
      success_called = true;
      success_callback(data);
    };

    var payload = this.generate_auth_payload_string();

    var full_callback_name = "Socky.Manager._jsonp_auth_callbacks['" + callback_name + "']"
    var script_url = this._socky.auth_endpoint();
    script_url += '?callback=' + encodeURIComponent(full_callback_name);
    script_url += '&' + payload;

    var script = document.createElement("script");
    script.src = script_url;
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    head.insertBefore(script, head.firstChild);

    setTimeout(function() {
      if (!success_called) {
        failure_callback();
      }
    }, 10000);

  }

});