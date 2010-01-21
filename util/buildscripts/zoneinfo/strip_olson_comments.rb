#!/usr/bin/ruby
 #
 # Copyright 2009 Matthew Eernisse (mde@fleegix.org)
 #
 # Licensed under the Apache License, Version 2.0 (the "License");
 # you may not use this file except in compliance with the License.
 # You may obtain a copy of the License at
 #
 #   http://www.apache.org/licenses/LICENSE-2.0
 #
 # Unless required by applicable law or agreed to in writing, software
 # distributed under the License is distributed on an "AS IS" BASIS,
 # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 # See the License for the specific language governing permissions and
 # limitations under the License.
 #
 # This is a sample script for stripping the copious comments
 # from Olson timezone data files.
 #
if ARGV.length == 0
  print "Usage: strip_comments.rb /path/to/input/file\n"
  exit
else
  path = ARGV[0]
end

t = File.read(path)
t.gsub!(/^#.*\n/, '')
t.gsub!(/^\n/, '')
print t
