require 'rack'
require 'json'
require 'socky/authenticator'

map '/socky/auth' do
  app = proc do |env|
    request = Rack::Request.new(env)
    
    payload = JSON.parse(request.params['payload']) rescue {}
    payload = {} unless payload.is_a?(Hash)
    
    begin
      response = Socky::Authenticator.authenticate(request.params['payload'], true)
    rescue ArgumentError => e
      puts e.message
      response = nil
    end

    if response
      [ 200, {'Content-Type' => 'text/javascript'}, response.to_json]
    else
      [ 400, {}, []]
    end
  end
  
  run app
end

map '/' do
  run Rack::Directory.new("..")
end
