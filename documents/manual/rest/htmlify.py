import os, sys, glob

ffiles = []
for root, dirs, files in list(os.walk('.')):
   ffiles += [os.path.join(root,f) for f in files if f.endswith('.rest')]
for source in ffiles:
   print source
   target = os.path.splitext(source)[0] + '.html'
   print source, target
   os.system('rst2html.py --stylesheet-path=./screen.css  %s %s' % (source, target))
