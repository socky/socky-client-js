fs     = require 'fs'
{exec} = require 'child_process'

appFiles  = [
  'socky'
  'socky-client'
]

task 'build', 'Rebuild socky.js', ->
  appContents = new Array remaining = appFiles.length
  for file, index in appFiles then do (file, index) ->
    fs.readFile "src/socky/#{file}.coffee", 'utf8', (err, fileContents) ->
      throw err if err
      appContents[index] = fileContents
      process() if --remaining is 0
  process = ->
    fs.writeFile 'src/socky.coffee', appContents.join('\n\n'), 'utf8', (err) ->
      throw err if err
      exec 'coffee --compile src/socky.coffee', (err, stdout, stderr) ->
        throw err if err
        console.log stdout + stderr
        fs.unlink 'src/socky.coffee', (err) ->
          throw err if err
          console.log 'Done.'