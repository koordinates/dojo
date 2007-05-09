//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");

var profileFile = arguments[0];
var lineSeparator = java.lang.System.getProperty("line.separator");

print("Files included in this profile:" + lineSeparator + buildUtil.loadDependencyList(profileFile).depList.join(lineSeparator));
