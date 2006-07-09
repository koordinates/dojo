# NOTE: this file is a Jython script, and much of the code here would be
# 	redundant in a normal CPython 2.3 environment (Jython implements Python
# 	2.1). We avoid Python2.3-isms like os.walk as a result.
import sys
sys.path.append("lib/pyLib.zip")
import re
import os
import popen2
import fnmatch
import glob
import string

def escape(instr):
	out = []
	for x in xrange(len(instr)):
		if instr[x] == "\\":
			out.append("\\\\")
		elif instr[x] == "\n":
			out.append("\\n")
		elif instr[x] == "\"":
			out.append("\\\"")
		else:
		    out.append(instr[x])
	return string.join(out, "")


def regexpMagic(loader, pkgString, srcRoot):
	uriMethod = "dojo.uri.dojoUri"
	#if loader == "xdomain":
	#	uriMethod = "dojo.uri.dojoUriXd"

	# "Now they have two problems" -- jwz
	#	http://en.wikiquote.org/wiki/Jamie_Zawinski
	matches = re.findall('(templatePath\s*=\s*(dojo\.uri\.(dojo)?Uri\(\s*)?"(.+)"(\s*\))?)', pkgString)
	print matches
	for x in matches:
		replacement = "templateString=\""+escape(open(srcRoot+x[3]).read())+"\""
		pkgString = string.replace(pkgString, x[0], replacement)

	matches = re.findall('(templatePath\s*:\s*(dojo\.uri\.(dojo)?Uri\(\s*)?"([\w\.\/]+)"(\s*\))?)', pkgString)
	print matches
	for x in matches:
		replacement = "templateString:\""+escape(open(srcRoot+x[3]).read())+"\""
		pkgString = string.replace(pkgString, x[0], replacement)

	#Find template CSS stuff.
	matches = re.findall('(templateCssPath\s*:\s*(dojo\.uri\.(dojo)?Uri\(\s*)?"([\w\.\/]+)"(\s*\))?)', pkgString)
	print matches
	for x in matches:
		replacement = "templateCssString:\""+escape(open(srcRoot+x[3]).read())+"\",templateCssPath:"+uriMethod+"(\""+x[3]+"\")"
		pkgString = string.replace(pkgString, x[0], replacement)

	#This regexp is a little weak because it assumes a "this" in front of the templateCssPath.
	#In theory it could be something else, but in practice it is not, and it gets a little too weird
	#to figure out, at least given the short amount of time this change is going in.
	matches = re.findall('(this\.templateCssPath\s*=\s*(dojo\.uri\.(dojo)?Uri\(\s*)?"(.+)"(\s*\))?)', pkgString)
	print matches
	for x in matches:
		replacement = "this.templateCssString=\""+escape(open(srcRoot+x[3]).read())+"\";this.templateCssPath="+uriMethod+"(\""+x[3]+"\")"
		pkgString = string.replace(pkgString, x[0], replacement)
	return pkgString

def internTemplateStringsInFile(loader, packageFile, srcRoot):
		print packageFile
		pfd = open(packageFile)
		pkgString = pfd.read()
		pfd.close()
	
		pkgString = regexpMagic(loader, pkgString, srcRoot)
		
		pfd = open(packageFile, "w")
		pfd.write(pkgString)
		pfd.close() # flush is implicit


def internXdFiles(loader, xdDir, srcRoot):
	xdFiles = glob.glob1(xdDir, "*.xd.js")
	for name in xdFiles:
		print "XD INTERNING: " + name
		internTemplateStringsInFile(loader, xdDir+os.sep+name, srcRoot)


def internTemplateStrings(loader="default", packageDir="../release/dojo", srcRoot="../"):
	#Fix up dojo.js
	print "loader: " + loader
	print "packageDir - " + packageDir
	packageFile = packageDir+"/dojo.js"
	#try:
	internTemplateStringsInFile(loader, packageFile, srcRoot)
	#except:
	#	packageFile = packageDir+"/__package__.js"
	#	internTemplateStringsInFile(loader, packageFile, srcRoot)
		
	#If doing xdomain, then need to fix up the .xd.js files in the widget subdir.
	#Hack alert! I am not patient enough to figure out how to do dir recursion
	#in python right now.
	internXdFiles(loader, packageDir+"/src/widget", srcRoot)
	internXdFiles(loader, packageDir+"/src/widget/html", srcRoot)
	internXdFiles(loader, packageDir+"/src/widget/svg", srcRoot)
	internXdFiles(loader, packageDir+"/src/widget/vml", srcRoot)


def replaceVersion(fileName, version):
	verSegments = version.split('.')
	majorValue = 0
	minorValue = 0
	patchValue = 0
	flagValue = ""

	if len(verSegments) > 0 and verSegments[0]:
		majorValue = verSegments[0]
	if len(verSegments) > 1 and verSegments[1]:
		minorValue = verSegments[1]
	if len(verSegments) > 2 and verSegments[2]:
		patchValue = re.split('\D', verSegments[2])[0]
		if len(patchValue) is not len(verSegments[2]):
			flagValue = verSegments[2][len(patchValue):]
	if len(verSegments) > 3 and verSegments[3]:
		flagValue = verSegments[3]

	pfd = open(fileName)
	fileContents = pfd.read()
	pfd.close()

	matches = re.findall('(major:\s*\d*,\s*minor:\s*\d*,\s*patch:\s*\d*,\s*flag:\s*".*?"\s*,)', fileContents)
	for x in matches:
		replacement = "major: " + majorValue + ", minor: " + minorValue + ", patch: " + patchValue + ", flag: \"" + flagValue + "\","
		fileContents = string.replace(fileContents, x, replacement)

	pfd = open(fileName, "w")
	pfd.write(fileContents)
	pfd.close() # flush is implicit

def removeRequires(fileName):
	pfd = open(fileName)
	fileContents = pfd.read()
	pfd.close()
	
	newContents =
	re.sub("dojo\.(require|requireAfterIf|requireIf|kwCompoundRequire)\(.*?\);.*?\n", "", fileContents)

	pfd = open(fileName, "w")
	pfd.write(newContents)
	pfd.close() # flush is implicit

def buildRestFiles(docDir, docOutDir, styleSheetFile, restFiles=""):
	docFiles = []

	# start in docDir and add all the reST files in the directory to the
	# list
	docDir = os.path.normpath(os.path.abspath(docDir))
	styleSheetFile = os.path.normpath(os.path.abspath(styleSheetFile))
	docOutDir = os.path.normpath(os.path.abspath(docOutDir))

	if not len(restFiles):
		docFiles = glob.glob1(docDir, "*.rest")
	else:
		docFiles = map(lambda x: x.strip(), restFiles.split(","))

	for name in docFiles:
		x = docDir+os.sep+name
		if x.find(os.sep+".svn") == -1:
			# print x
			cmdStr = "rst2html.py --no-doc-info --no-doc-title --embed-stylesheet --stylesheet-path=%s %s %s" % \
				(styleSheetFile, x, docOutDir+os.sep+(name[0:-5])+".html")

			# I'd much rather be using popen3, but it doesn't appear to be
			# available from either the os.* or popen2.* modules in a useable
			# way. The source of popen2.py leads me to believe that this is an
			# underlying Java issue.
			os.system("echo `which rst2html.py`")
			os.system(cmdStr)
			# java.lang.Runtime.exec(??)
	
	if not len(restFiles):
		for name in os.listdir(docDir):
			tn = os.path.normpath(docDir+os.sep+name)
			if os.path.isdir(tn) and not name == ".svn":
				buildRestFiles(tn, docOutDir+os.sep+name, styleSheetFile)

def norm(path):
	path = os.path.normpath(os.path.abspath(path))
	if os.sep == '\\':
		return path.replace("\\", "\\\\")
	else:
		return path

def buildTestFiles( testDir="../tests/", 
					testOutFile="../testRunner.js", 
					prologueFile="../tests/prologue.js",
					epilogueFile="../tests/epilogue.js",
					jumFile="../testtools/JsTestManager/jsunit_wrap.js",
					domImplFile="../testtools/JsFakeDom/BUFakeDom.js",
					dojoRootPath="../"):
	# FIXME: need to test for file existance of all the passed file names

	testOutFile = norm(testOutFile)
	if os.path.isfile(testOutFile):
		print "rebuilding %s" % (testOutFile,)
		os.unlink(testOutFile)

	testOutFD = open(testOutFile, "w+")
	testOutFD.write("""

djConfig = { 
	baseRelativePath: "%s/",
	isDebug: true
};

load("%s/dojo.js");

load("%s", 
	"%s", 
	"%s");
""" % (norm(dojoRootPath), norm(dojoRootPath), norm(prologueFile), norm(domImplFile), norm(jumFile))
	)

	testFiles = findTestFiles(testDir)
	for fn in testFiles:
		testOutFD.write("""load("%s");\n""" % (norm(fn),))

	testOutFD.write("""
load("%s");
jum.init();
jum.runAll();""" % (norm(epilogueFile),))
	testOutFD.close()

def findTestFiles(testDir="../tests"):
	testFiles = glob.glob1(testDir, "test*.js")
	dirFiles = os.listdir(testDir)
	for name in dirFiles:
		if os.path.isdir(testDir+os.sep+name):
			if name[0] == ".": continue
			testFiles.extend(findTestFiles(testDir+os.sep+name))
	for x in xrange(len(testFiles)):
		if not os.path.isabs(testFiles[x]):
			testFiles[x] = norm(testDir+os.sep+testFiles[x])
	# testFiles = map(lambda x: os.path.abspath(testDir+os.sep+x), testFiles)
	return testFiles

# vim:ai:ts=4:noet:textwidth=80
