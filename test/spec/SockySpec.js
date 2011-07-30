describe('Socky Connection', function () {

  it('should receive a "socky:connection:established" with a proper connection_id', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Connection established callback');
      socky.bind("socky:connection:established", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].connection_id).toBeDefined();
      socky.close();
    });

  });

  it('should receive a "socky:connection:error" message with "refused" reason when using a wrong app_id', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/invalid_app');

    runs(function() {
      callback = jasmine.createSpy('Connection error callback');
      socky.bind("socky:connection:error", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].reason).toEqual('refused');
      socky.close();
    });

  });

  it('should receive a "socky:connection:error" message with "down" reason when using a wrong host', function() {

    var callback;
    var socky = new Socky.Client('ws://example.com:3001/websocket/invalid_app');

    runs(function() {
      callback = jasmine.createSpy('Connection error callback');
      socky.bind("socky:connection:error", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 15000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].reason).toEqual('down');
      socky.close();
    });

  });

  it('should receive a "socky:connection:closed" message when calling .close()', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Connection established callback');
      socky.bind("socky:connection:established", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      callback = jasmine.createSpy('Connection closed callback');
      socky.bind("socky:connection:closed", callback);
      socky.close();
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

  });

});

describe('Socky Public Channel', function () {

  it('should receive a "socky:subscribe:success" with a proper channel after subscribing', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Subscribe success callback');
      socky.bind("socky:subscribe:success", callback);
      socky.subscribe('test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('test_channel');
      socky.close();
    });

  });

  it('should receive a "socky:unsubscribe:success" with a proper channel after unsubscribing from subscribed channel', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Unsubscribe success callback');
      socky.bind("socky:unsubscribe:success", callback);
      socky.bind("socky:subscribe:success", function() {
        socky.unsubscribe('test_channel');;
      })
      socky.subscribe('test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 10000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('test_channel');
      socky.close();
    });

  });

  it('should receive a "socky:unsubscribe:failure" with a proper channel after tring to unsubscribe from not subscribed channel', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Connection established callback');
      socky.bind("socky:connection:established", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      callback = jasmine.createSpy('Unsubscribe failure callback');
      socky.bind("socky:unsubscribe:failure", callback);
      socky.unsubscribe('test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('test_channel');
      socky.close();
    });

  });

});

describe('Socky Private Channel', function () {

  it('should receive a "socky:subscribe:success" with a proper channel after subscribing', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Subscribe success callback');
      socky.bind("socky:subscribe:success", callback);
      socky.subscribe('private-test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('private-test_channel');
      socky.close();
    });

  });

  it('should receive a "socky:subscribe:failure" with a proper channel if subscribe request was rejected', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Subscribe failure callback');
      socky.bind("socky:subscribe:failure", callback);
      socky.subscribe('private-invalid_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('private-invalid_channel');
      socky.close();
    });

  });

  it('should receive a "socky:unsubscribe:success" with a proper channel after unsubscribing from subscribed channel', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Unsubscribe success callback');
      socky.bind("socky:unsubscribe:success", callback);
      socky.bind("socky:subscribe:success", function() {
        socky.unsubscribe('private-test_channel');;
      })
      socky.subscribe('private-test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 10000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('private-test_channel');
      socky.close();
    });

  });

  it('should receive a "socky:unsubscribe:failure" with a proper channel after try to unsubscribe from not subscribed channel', function() {

    var callback;
    var socky = new Socky.Client('ws://localhost:3001/websocket/my_app');

    runs(function() {
      callback = jasmine.createSpy('Connection established callback');
      socky.bind("socky:connection:established", callback);
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      callback = jasmine.createSpy('Unsubscribe failure callback');
      socky.bind("socky:unsubscribe:failure", callback);
      socky.unsubscribe('private-test_channel');
    });

    waitsFor(function() { return callback.wasCalled; }, 5000);

    runs(function() {
      expect(callback.mostRecentCall.args[0].channel).toEqual('private-test_channel');
      socky.close();
    });

  });

});

/*$(document).ready(function() {

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