//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");

var profileFile = arguments[0];
var releaseDir = arguments[1];
var dojoFileName = arguments[2];
var version = arguments[3];
var lineSeparator = java.lang.System.getProperty("line.separator");

var result = buildUtil.makeDojoJs(buildUtil.loadDependencyList(profileFile), version);

//Save the dojo.js contents. It is always the first result.
buildUtil.saveFile(releaseDir + "/" + dojoFileName, result[0].contents);

//Save the other layers, if there are any.
for(var i = 1; i < result.length; i++){
	var layerName = releaseDir + "/" + result[i].layerName;
	var uncompressedLayerName = layerName + ".uncompressed.js";

	buildUtil.saveFile(uncompressedLayerName, result[i].contents);
	
	//Compress the layer files. It is clunky to do it here and have dojo.js
	//compression done elsewhere. This will be fixed in 0.9 re-org.
	print("Compressing file: " + layerName);

	var copyright = new String(buildUtil.readFile("copyright.txt"));

	//Load the file contents and optimize.
	var fileContents = new String(buildUtil.readFile(uncompressedLayerName));
	fileContents = buildUtil.optimizeJs(uncompressedLayerName, fileContents, copyright, true);
	
	//Save the optimized file.
	buildUtil.saveFile(layerName, fileContents);
}

//Save the dependency list to build.txt
var buildText = "Files baked into this build:" + lineSeparator;
for(var i = 0; i < result.length; i++){
	buildText += lineSeparator + result[i].layerName + ":" + lineSeparator;
	buildText += result[i].depList.join(lineSeparator) + lineSeparator;
}

buildUtil.saveFile(releaseDir + "/build.txt", buildText);

print(buildText);

