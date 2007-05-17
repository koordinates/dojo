//START of the "main" part of the script.
//This is the entry point for this script file.
load("buildUtil.js");
load("buildUtilXd.js");

var profileFile = arguments[0];
var releaseDir = arguments[1];
var dojoFileName = arguments[2];
var version = arguments[3];
var lineSeparator = java.lang.System.getProperty("line.separator");

print("Mapping module dependencies...");
var dependencyResult = buildUtil.loadDependencyList(profileFile);
var isXDomain = (buildUtil.getDojoLoader(dependencyResult.dependencies) == "xdomain");
var prefixes = dependencyResult.dependencies["prefixes"] || [];

var copyright = new String(buildUtil.readFile("copyright.txt"));

var result = buildUtil.makeDojoJs(dependencyResult, version);

//Save the dojo.js contents. It is always the first result.
buildUtil.saveFile(releaseDir + "/" + dojoFileName, result[0].contents);

//Save the other layers, if there are any.
for(var i = 1; i < result.length; i++){
	var layerName = releaseDir + "/" + result[i].layerName;
	var layerContents = result[i].contents;
	var uncompressedLayerName = layerName + ".uncompressed.js";

	//Saved the uncompressed file.
	buildUtil.saveFile(uncompressedLayerName, layerContents);

	//Save a compressed layer file. It is clunky to do it here and have dojo.js
	//compression done elsewhere. This will be fixed in 0.9 re-org.
	print("Compressing file: " + layerName);
	var compressedContents = buildUtil.optimizeJs(uncompressedLayerName, layerContents, copyright, true);
	compressedContents = compressedContents.replace(/\r/g, "");
	buildUtil.saveFile(layerName, compressedContents);

	//If xdomain, create and optimize the xd.js file too. 
	if(isXDomain){
		var xdUncompressedFileName = uncompressedLayerName.replace(/\.js$/, ".xd.js");
		var xdContents = buildUtilXd.makeXdContents(layerContents, "../", prefixes);
		buildUtil.saveFile(xdUncompressedFileName, xdContents);

		//Need to intern strings for xd files.
		//This is another awkward thing to do here. Should be nicer in 0.9
		//Make sure dojo is in the list.
		var dojoPath = releaseDir.replace(/^.*(\/|\\)release(\/|\\)/, "release/");
		prefixes.push(["dojo", dojoPath + "/src"]);

		var skiplist = dependencyResult.dependencies["internSkipList"] || [];
		buildUtil.internTemplateStringsInFile(buildUtil.getDojoLoader(dependencyResult.dependencies),
			xdUncompressedFileName, "../", prefixes, skiplist);

		//Compress it.
		var xdContents = buildUtil.readFile(xdUncompressedFileName);
		xdContents = buildUtil.optimizeJs(xdUncompressedFileName, xdContents, copyright, true);
		buildUtil.saveFile(layerName.replace(/\.js$/, ".xd.js"), xdContents);
	}
}

//Save the dependency list to build.txt
var buildText = "Files baked into this build:" + lineSeparator;
for(var i = 0; i < result.length; i++){
	buildText += lineSeparator + result[i].layerName + ":" + lineSeparator;
	buildText += result[i].depList.join(lineSeparator) + lineSeparator;
}

buildUtil.saveFile(releaseDir + "/build.txt", buildText);

print(buildText);

