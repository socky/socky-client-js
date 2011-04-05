require 'rack'
require 'json'
require 'socky/authenticator'

Socky::Authenticator.secret = 'my_secret'

map '/socky/auth' do
  app = proc do |env|
    request = Rack::Request.new(env)
    
    puts request.request_method
    puts request.params
    
    payload = JSON.parse(request.params['payload']) rescue {}
    payload = {} unless payload.is_a?(Hash)
    
    return [ 400, {}, []] if payload['channel'].to_s.match(/invalid/)
    
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
  
  use Rack::CommonLogger
  run app
end

map '/' do
  run Rack::Directory.new("..")
end