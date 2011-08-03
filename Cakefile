fs     = require 'fs'
{exec} = require 'child_process'

version = '0.5.0-coffee'

# All files needed for release
releaseFiles = [
  'socky'
  'assets/flashfallback'
  'assets/json2'
]

# All files from which Socky is compiled
appFiles = [
  'socky'
  'client'
]

# All files from which Flash Fallback is compiled
flashFallbackFiles = [
  'vendor/web-socket-js/swfobject'
  'vendor/web-socket-js/web_socket'
]

task 'release', 'Rebuild and release all scripts to new dist', ->
  dir = "dist/#{version}"
  exec "rm -rf #{dir} && mkdir -p #{dir}/assets", (err, stdout, stderr) ->
    throw err if err
    console.log stdout + stderr
    remaining = releaseFiles.length
    for file, index in releaseFiles then do (file, index) ->
      fs.readFile "lib/#{file}.js", 'utf8', (err, fileContents) ->
        throw err if err
        fs.readFile "lib/#{file}-license.js", 'utf8', (err, licenseContents) ->
          throw err if err
          licenseContents = replaceConstants licenseContents
          fs.writeFile "#{dir}/#{file}.js", [licenseContents, replaceConstants(fileContents)].join('\n\n'), 'utf8', (err) ->
            throw err if err
            exec "cat #{dir}/#{file}.js | sed s/_use_minified_assets:\\ false/_use_minified_assets:\\ true/ | uglifyjs -nc --no-seqs", (err, stdout, stderr) ->
              throw err if err
              console.log stderr
              minFileContents = stdout
              fs.writeFile "#{dir}/#{file}.min.js", [licenseContents, minFileContents].join(''), 'utf8', (err) ->
                throw err if err
                copyAssets() if --remaining is 0
  replaceConstants = (string) ->
    str = string.replace /<VERSION>/, version
    str = str.replace /<ASSETS_LOCATION>/, "http://js.socky.org/#{version}/assets"
  copyAssets = ->
    exec "cp lib/assets/flashfallback.swf #{dir}/assets/flashfallback.swf", (err, stdout, stderr) ->
      throw err if err
      console.log stdout + stderr
      console.log 'Done.'

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