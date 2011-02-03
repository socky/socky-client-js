#!/usr/bin/env bash

# Update web-socket-js
git submodule update

# Remove old flash fallback
rm assets/flashfallback.js
rm assets/WebSocketMain.swf

# Generate new flash fallback
cat vendor/web-socket-js/swfobject.js > assets/flashfallback.js
cat vendor/web-socket-js/FABridge.js >> assets/flashfallback.js
cat vendor/web-socket-js/web_socket.js >> assets/flashfallback.js

# Unpack and copy WebSocketMain.swf
unzip vendor/web-socket-js/WebSocketMainInsecure.zip
mv WebSocketMainInsecure.swf assets/WebSocketMain.swf

# Done
echo "Done."