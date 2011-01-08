Socky - browser JS files
==========

Socky is push server for Ruby based on WebSockets. It allows you to break border between your application and client browser by letting the server initialize a connection and push data to the client.

### Usage

One of most important points when creating Socky was to keep Javascripts simple and easy to customize. Thanks to that you can easily overwrite default approach and write your own.

Socky defines his own class, and all calls between server and client are handled by prototyped functions. Some of them you could easily overwrite, and some of them should be modified carefully. In most situations you should only modify "respond_to_message" function. Lets look how to do that.

Default definition is:

    Socky.prototype.respond_to_message = function(msg) {
      eval(msg);
    };

but you could overwrite it with anything you like. For example, if you are creating simple chat when all messages will be posted to div, and you need no other functionality, then(assuming you are using jQuery) you could write it like that:

    Socky.prototype.respond_to_message = function(msg) {
      $('#chat').append(msg);
    };

Thanks to that all you will need to write in your application is:

    Socky.send("message")

and it will be written to chat.

### Building

    git clone git://github.com/socky/socky-js.git socky-js --recursive
    cd socky-js
    make

### License

(The MIT License)

Copyright (c) 2010 Bernard Potocki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.