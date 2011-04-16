require 'rack'
require 'json'
require 'socky/authenticator'

Socky::Authenticator.secret = 'my_secret'

authenticator = proc do |env|
  request = Rack::Request.new(env)
  
  response = Socky::Authenticator.authenticate(request.params, true)
  [ 200, {}, response.to_json ]
end


map '/socky/auth' do
  run authenticator
end

map '/' do
  run Rack::Directory.new("..")
end