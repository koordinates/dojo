#! /usr/bin/env python
import os, sys, glob

ffiles = []
for root, dirs, files in list(os.walk('.')):
   ffiles += [os.path.join(root,f) for f in files if f.endswith('.rest')]
for source in ffiles:
   (tdir, tfn) = os.path.split(source)
   tdir = os.path.join("../html/", tdir)
   if not os.path.isdir(tdir):
   	os.makedirs(tdir)
   target = os.path.join(tdir, os.path.splitext(tfn)[0]+'.html')
   print os.path.basename(source), "->", os.path.basename(target)
   target = os.path.abspath(target)
   os.system('rst2html.py --stylesheet-path=./screen.css  %s %s' % (source, target))
