require 'rack'
require 'json'
require 'socky/authenticator'

Socky::Authenticator.secret = 'my_secret'

authenticator = proc do |env|
  request = Rack::Request.new(env)
  
  if request.params['channel'].to_s.match(/invalid/)
    [ 403, {}, []]
  else
    response = Socky::Authenticator.authenticate(request.params, true)
    [ 200, {}, response.to_json]
  end
end


map '/socky/auth' do
  run authenticator
end

map '/' do
  run Rack::Directory.new("..")
end