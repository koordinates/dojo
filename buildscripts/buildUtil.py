# NOTE: this file is a Jython script, and much of the code here would be
# 	redundant in a normal CPython 2.3 environment (Jython implements Python
# 	2.1). We avoid Python2.3-isms like os.walk as a result.
import sys
sys.path.append("lib/pyLib.zip")
# import re
import os
import popen2
import fnmatch
import glob
import java.lang.Runtime

def buildRestFiles(docDir, docOutDir, styleSheetFile):
	docFiles = []

	# start in docDir and add all the reST files in the directory to the
	# list
	docDir = os.path.normpath(os.path.abspath(docDir))
	styleSheetFile = os.path.normpath(os.path.abspath(styleSheetFile))
	docOutDir = os.path.normpath(os.path.abspath(docOutDir))
	docFiles = glob.glob1(docDir, "*.rest")
	for name in docFiles:
		x = docDir+os.sep+name
		if x.find(os.sep+".svn") == -1:
			# print x
			cmdStr = "rst2html.py --embed-stylesheet --stylesheet-path=%s %s %s" % \
				(styleSheetFile, x, docOutDir+os.sep+(name[0:-5])+".html")

			# I'd much rather be using popen3, but it doesn't appear to be
			# available from either the os.* or popen2.* modules in a useable
			# way. The source of popen2.py leads me to believe that this is an
			# underlying Java issue.
			os.system("echo `which rst2html.py`")
			os.system(cmdStr)
			# java.lang.Runtime.exec(??)
	
	for name in os.listdir(docDir):
		tn = os.path.normpath(docDir+os.sep+name)
		if os.path.isdir(tn) and not name == ".svn":
			buildRestFiles(tn, docOutDir+os.sep+name, styleSheetFile)

def buildTestFiles( testDir, testOutDir, 
					prologueFile="../tests/prologue.js",
					epilogueFile="../tests/epilogue.js"):
	pass # FIXME: finish this!!!

# vim:ai:ts=4:noet:textwidth=80
