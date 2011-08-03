window.Socky =
  # Variables
  assets_location: '<ASSETS_LOCATION>'
  debug: false
  fallback_debug: false
  _client_instances: []
  _is_drivers_loaded: false
  _is_initialized: false
  _use_minified_assets: false
  
  # Methods
  init: ->
    return if @_is_initialized
    scripts_to_require = []
    
    success_callback = -> @_is_initialized = true; @_drivers_loaded()
    
    unless window.JSON?
      @log 'loading JSON driver'
      scripts_to_require.push "#{@assets_location}/json2.#{@_assets_extension()}"
    
    unless window.WebSocket?
      @log 'loading WebSocket driver'
      window.WEB_SOCKET_SWF_LOCATION = "#{@assets_location}/flashfallback.swf"
      window.WEB_SOCKET_DEBUG = @fallback_debug
      scripts_to_require.push "#{@assets_location}/flashfallback.#{@_assets_extension()}"
    
    if scripts_to_require.length > 0
      @_require_scripts scripts_to_require, success_callback
    else
      success_callback()
  
  log: (args...) -> console.log "Socky : #{args.join " : "}" if @debug
  
  _assets_extension: -> if @_use_minified_assets then 'min.js' else 'js'
  
  _drivers_loaded: ->
    @_is_drivers_loaded = true
    for client in @_client_instances
      client.connect() unless client.connected
  
  _require_scripts: (scripts, callback) ->
    scripts_count = 0
    
    if document.addEventListener
      handle_script_loaded = (elem, callback) -> elem.addEventListener 'load', callback, false
    else
      handle_script_loaded = (elem, callback) ->
        elem.attachEvent 'onreadystatechange', ->
          callback() if elem.readyState == 'loaded' || elem.readyState == 'complete'
    
    check_if_ready = (callback) ->
      scripts_count++
      # Opera needs the timeout for page initialization weirdness
      setTimeout(callback, 0) if scripts.length == scripts_count
    
    add_script = (src, callback) ->
      callback ||= ->
      head = document.getElementsByTagName('head')[0]
      script = document.createElement 'script'
      script.setAttribute 'src', src
      script.setAttribute 'type', 'text/javascript'
      script.setAttribute 'async', true
      
      handle_script_loaded script, -> check_if_ready callback
      
      head.appendChild script
    
    add_script(script, callback) for script in scripts
