fs     = require 'fs'
{exec} = require 'child_process'

appFiles = [
  'socky'
  'socky-client'
]

flashFallbackFiles = [
  'vendor/web-socket-js/swfobject'
  'vendor/web-socket-js/web_socket'
]

task 'build', 'Rebuild socky.js', ->
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile "src/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/socky.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile lib/socky.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        fs.unlink 'lib/socky.coffee', (err) ->
          throw err if err
          console.log 'Done.'

task 'vendor:build', 'Rebuild all vendored scripts', ->
  invoke 'vendor:flashfallback:build'
  invoke 'vendor:json:build'

task 'vendor:flashfallback:build', 'Rebuild flash fallback script', ->
  flashFallbackContents = new Array remaining = flashFallbackFiles.length
  for file, index in flashFallbackFiles then do (file, index) ->
    fs.readFile "#{file}.js", 'utf8', (err, fileContents) ->
      throw err if err
      flashFallbackContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'lib/assets/flashfallback.js', flashFallbackContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'cp vendor/web-socket-js/WebSocketMainInsecure.swf lib/assets/flashfallback.swf', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        console.log 'Done.'

task 'vendor:json:build', 'Rebuild json script', ->
  exec 'cp vendor/json/json2.js lib/assets/json2.js', (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    console.log 'Done.'