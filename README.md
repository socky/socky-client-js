# Socky - JavaScript Client

## Installation

You can copy all files from directory of specific version('dist' subdirectories) or use our CDN version.

In your header you only need to link main file - socky.js or socky.min.js.

``` html
<script src="http://js.socky.org/v0.5.0-beta1/socky.min.js" type="text/javascript"></script>
```

## Basic usage

To initialize Socky connection you only need to create Socky.Client instance with full Socky server url:

``` javascript
var socky = new Socky.Client('ws://ws.example.org/websocket/my_app');
```

Note that server url include protocol namespace('websocket') and application name('my_app').

In order to connect to channel you can call:

``` javascript
var channel = socky.subscribe("channel1");
```

And unsubscribe later:

``` javascript
socky.unsubscribe("channel1");
```

Please note that you can subscribe to as many channels as you want.

## Private and Presence channels

At default you can connect and listen to any public channel. But some channels are restricted to
authenticated users only. These channels have names starting from 'private-' and 'presence-' - so for example
'private-chat' will be restricted channel, but 'chat' is public, and both of them are handled separately.

One part of Socky family is "authenticator" - please read there more to find how to use it in your language.
At default Socky JS Client is assuming that authentication backend is located at the same server that page that
are requesting connection and under path '/socky/auth' - if ajax call to this path will fail then authentication
result will be failure and no connection will be made. You can change authentication backend location by changing
'auth_endpoint' variable of your Socky Client.

For presence channel you can provide your user data that will be visible to other users:

``` javascript
var channel = socky.subscribe("presence-channel", { data: { login: 'my login', sex: 'male' }});
```

## Callbacks

Socky is using jQuery-inspired callbacks to handle various events between users. After connecting to server you can
handle them by "binding" them to specific event. Example:

``` javascript
socky.bind("my_event", function(data) {
  alert(data);
});
```

Each time server will send event called 'my_event' your callback will be fired. Thanks to that you can easly handle
multiple different situations by binding different callbacks to events.

The same way you can bind events to channel so only events sent to that channel will trigger callback:

``` javascript
channel.bind("my_event", function(data) {
});
```

Except of your own events there are few predefined events that will be fired by Socky itself:

- socky:connection:established - called when connection with Socky Server is made
- socky:connection:closed - called when connection with Socky Server is closed
- socky:connection:error - called when connection with Socky Server cannot be established. Data will contain reason.
- socky:subscribe:success - called when you successfully join channel. Data will be presend only for presence channels and will contain list of already connected users
- socky:subscribe:failure - called when you cannot join channel. Usually this means that you cannot receive authorization.
- socky:member:added - called only for presence channel when new user is connecting. Data will contain user data.
- socky:member:removed - called only for presence channel when user is disconnecting. Data will contain user data.

## User rights

Each user have 2 default rights, and one additional for presence channels. Those rights are: receive messages, send messages and hide from other users. At default only first one is enabled, but when connecting to restricted channel you can request changing one or more of this rights. If authenticator will allow such rights change then you could enable sending events, disable receiving events(i.e. write-only mode) and hide from other users. In order to do so you will need to privide them as params:

``` javascript
var channel = socky.subscribe("presence-channel", { read: false, write: true, hide: true }});
```

## Triggering events

If you join channel with write right enabled then you will be able to trigger events on this channel(and this channel only - each channel will require this right separately) In order to do so you only need to call 'trigger' method with data to send:

``` javascript
channel.trigger("my_event", { some_data: 'my message' });
```

## License

(The MIT License)

Copyright (c) 2010 Bernard Potocki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.