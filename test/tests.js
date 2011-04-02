$(document).ready(function() {
  
  //// Connection
  
  // connection_established
  var socky_connection_established = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_connection_established.bind("socky:connection:established", function(payload) {
    if(payload.connection_id != undefined) {
      pass('connection_established');
      socky_connection_established.close();
    };
  });
  
  // connection_error_refused
  var socky_connection_error_refused = new Socky('ws://localhost:3001/websocket/invalid_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_connection_error_refused.bind("socky:connection:error", function(payload) {
    if(payload.reason == 'refused') {
      pass('connection_error_refused');
      socky_connection_error_refused.close();
    };
  });
  
  // connection_error_down
  var socky_connection_error_down = new Socky('ws://example.com:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_connection_error_down.bind("socky:connection:error", function(payload) {
    if(payload.reason == 'down') {
      pass('connection_error_down');
      socky_connection_error_down.close();
    };
  });
  
  // connection_closed
  var socky_connection_closed = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_connection_closed.bind("socky:connection:closed", function(payload) {
    pass('connection_closed');
  });
  socky_connection_closed.close();
  
  //// Public channel
  
  // public_subscribe_success
  var socky_public_subscribe_success = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_public_subscribe_success.bind("socky:subscribe:success", function(payload) {
    if(payload.channel == 'public_subscribe_success') {
      pass('public_subscribe_success');
      socky_public_subscribe_success.close();
    };
  });
  socky_public_subscribe_success.subscribe('public_subscribe_success');
  
  //// Private channel
  
  // private_subscribe_success
  var socky_private_subscribe_success = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_private_subscribe_success.bind("socky:subscribe:success", function(payload) {
    if(payload.channel == 'private-private_subscribe_success') {
      pass('private_subscribe_success');
      socky_private_subscribe_success.close();
    };
  });
  socky_private_subscribe_success.subscribe('private-private_subscribe_success');
  
  //// Presence channel
  
  // presence_subscribe_success
  var socky_presence_subscribe_success = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});
  socky_presence_subscribe_success.bind("socky:subscribe:success", function(payload) {
    if(payload.channel == 'presence-presence_subscribe_success') {
      pass('presence_subscribe_success');
      socky_presence_subscribe_success.close();
    };
  });
  socky_presence_subscribe_success.subscribe('presence-presence_subscribe_success');
});