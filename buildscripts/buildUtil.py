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

	r = re.compile("^dojo\.(require|requireAfterIf|requireIf|kwCompoundRequire)\(.*?\);.*?\n", re.S|re.M)
	newContents = r.sub("", fileContents)

	pfd = open(fileName, "w")
	pfd.write(newContents)
	pfd.close() # flush is implicit

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
