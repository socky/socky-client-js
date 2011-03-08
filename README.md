Socky - browser JS files
==========

Socky is push server for Ruby based on WebSockets. It allows you to break border between your application and client browser by letting the server initialize a connection and push data to the client.

### Usage

Please, include this script into your application code to initialize Socky.

    SockyManager.init({
      assets_location: '/path_to_assets',
      app_name: "your_app_name",
      websocket_debug: false,
      websocket_path: '/websocket',
      websocket_host: "your-host.com",
      websocket_port: 8080,
      websocket_secure: false,
      channel_auth_endpoint: "/socky/auth",
      channel_auth_transport: "ajax"
    });

### License

(The MIT License)

Copyright (c) 2010 Bernard Potocki

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.