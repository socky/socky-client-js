require 'rubygems'
require 'bundler/setup'

require 'jbundle'

task :default => :build

desc 'Bundle and minify source files.'
task :build do
  JBundle.config_from_file 'JFile'
  JBundle.write!
end