describe('Socky Object', function () {

  it('should receive a "socky:connection:established" with a proper connection_id', function() {

    var callback;
    var socky = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});

    runs(function() {
      callback = jasmine.createSpy('Connection established callback');
      socky.bind("socky:connection:established", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 500);

    runs(function() {
      expect(callback.mostRecentCall.args[0].connection_id).toBeDefined();
      socky.close();
    });

  });

  it('should receive a "socky:connection:error" message with "refused" reason when using a wrong app_id', function() {

    var callback;
    var socky = new Socky('ws://localhost:3001/websocket/invalid_app', {assets_location: '../dist/0.5.0-pre/assets'});

    runs(function() {
      callback = jasmine.createSpy('Connection error callback');
      socky.bind("socky:connection:error", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 500);

    runs(function() {
      expect(callback.mostRecentCall.args[0].reason).toEqual('refused');
      socky.close();
    });

  });

  it('should receive a "socky:connection:error" message with "down" reason when using a wrong host', function() {

    var callback;
    var socky = new Socky('ws://example.com:3001/websocket/invalid_app', {assets_location: '../dist/0.5.0-pre/assets'});

    runs(function() {
      callback = jasmine.createSpy('Connection error callback');
      socky.bind("socky:connection:error", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].reason).toEqual('down');
      socky.close();
    });

  });

  it('should receive a "socky:connection:closed" message when calling .close()', function() {

    var callback;
    var socky = new Socky('ws://localhost:3001/websocket/my_app', {assets_location: '../dist/0.5.0-pre/assets'});

    runs(function() {
      callback = jasmine.createSpy('Connection closed callback');
      socky.bind("socky:connection:closed", callback);
      socky.close();
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

  });


});

/*$(document).ready(function() {

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
  }
});
*/