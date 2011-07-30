Socky - browser JS files
==========

Socky is push server for Ruby based on WebSockets. It allows you to break border between your application and client browser by letting the server initialize a connection and push data to the client.

### Usage

Please, include this script into your application code to initialize Socky.

``` javascript
// optional, will use the CDN version of the assets as default behaviour
Socky.Manager.set_assets_location('../dist/0.5.0-beta1/assets');

// optional, you can just setup the options inside each Socky object
Socky.Manager.set_default_options({
  host: 'ws.my_host.com',
  port: 80
});

// any provided option will override the Socky.Manager default options
var socky = new Socky.Client({
  host: 'ws.another_host.com',
});

socky.subscribe("channel1");
```

### License

(The MIT License)

Copyright (c) 2010 Bernard Potocki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.