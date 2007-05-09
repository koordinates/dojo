//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");

var profileFile = arguments[0];
var releaseDir = arguments[1];
var dojoFileName = arguments[2];
var version = arguments[3];
var lineSeparator = java.lang.System.getProperty("line.separator");

var result = buildUtil.makeDojoJs(buildUtil.loadDependencyList(profileFile), version);

//Save the dojo.js contents.
buildUtil.saveFile(releaseDir + "/" + dojoFileName, result.dojoContents);

//Save the dependency list to build.txt
buildUtil.saveFile(releaseDir + "/build.txt", "Files baked into this build:" + lineSeparator + result.resourceDependencies.join(lineSeparator));

print("Files baked into this build:" + lineSeparator + result.resourceDependencies.join(lineSeparator));


