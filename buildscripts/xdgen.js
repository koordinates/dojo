
//The regular expressions that will help find dependencies in the file contents.
var masterRegExpString = "dojo.(requireLocalization|require|requireIf|requireAll|provide|requireAfterIf|requireAfter|kwCompoundRequire|conditionalRequire|hostenv\\.conditionalLoadModule|.hostenv\\.loadModule|hostenv\\.moduleLoaded)\\(([\\w\\W]*?)\\)";
var globalDependencyRegExp = new RegExp(masterRegExpString, "mg");
var dependencyPartsRegExp = new RegExp(masterRegExpString);

//START makeXdContents function
//Function that generates the XD version of the module file's contents
makeXdContents = function(fileContents, baseRelativePath, prefixes){
	var dependencies = [];
	
	//Use the regexps to find resource dependencies for this module file.
	var depMatches = fileContents.match(globalDependencyRegExp);
	if(depMatches){
		for(var i = 0; i < depMatches.length; i++){
			var partMatches = depMatches[i].match(dependencyPartsRegExp);
			dependencies.push('"' + partMatches[1] + '", ' + partMatches[2]);
		}
	}

	//Build the xd file contents.
	var xdContentsBuffer = [];
	xdContentsBuffer.push("dojo.hostenv.packageLoaded({\n");
	
	//Add in dependencies section.
	if(dependencies.length > 0){
		xdContentsBuffer.push("depends: [");
		for(i = 0; i < dependencies.length; i++){
			if(i > 0){
				xdContentsBuffer.push(",\n");
			}
			xdContentsBuffer.push("[" + dependencies[i] + "]");
		}
		xdContentsBuffer.push("],");
	}
	
	//Add the contents of the file inside a function.
	//Pass in dojo as an argument to the function to help with
	//allowing multiple versions of dojo in a page.
	xdContentsBuffer.push("\ndefinePackage: function(dojo){");
	xdContentsBuffer.push(fileContents);
	xdContentsBuffer.push("\n}});");
	
	return xdContentsBuffer.join("");
}
//END makeXdContents function

//START findJsFiles function
//Given an array of source directories to search, find all files
//that match filePathRegExp.
findJsFiles = function(srcDirs, filePathRegExp){
	var jsFileNames = [];
	for(var j = 0; j < srcDirs.length; j++){
		var fileList = buildUtil.getFilteredFileList(srcDirs[j], filePathRegExp);
		if(fileList){
			jsFileNames.push.apply(jsFileNames, fileList);
		}
	}
	return jsFileNames;
}
//END findJsFiles function


//START of the "main" part of the script.
//This is the entry point for this script file.
var action = arguments[0];
var profileFile = arguments[1];
var releaseDir = arguments[2];

//Load Dojo so we can use readText() defined in hostenv_rhino.js.
//Also gives us the ability to use all the neato toolkit features.
djConfig={
	baseRelativePath: "../"
};
load('../dojo.js');
dojo.require("dojo.string.extras");

//Find the bundles that need to be flattened.
load("buildUtil.js");

//Define array used to store the source directories that need to be
//scanned for .js files to convert to .xd.js files.
var srcDirs = [releaseDir + "src/", releaseDir + "nls/"];

//Any other arguments to this file are directories to search.
for(var i = 3; i < arguments.length; i++){
	srcDirs.push(arguments[i]);
}

//Load the profile file to get resource paths for external modules.
//Use new String to make sure we have a JS string (not a Java string)
var profileText = new String(readText(profileFile));

//Extract only dependencies.prefixes.
var dependencies = {
	prefixes: []
};

//Get rid of CR and LFs since they seem to mess with the regexp match.
//Using the "m" option on the regexp was not enough.
profileText = profileText.replace(/\r/g, "");
profileText = profileText.replace(/\n/g, "");

var matches = profileText.match(/(dependencies\.prefixes\s*=\s*\[.*\]\s*\;)/m);
if(matches && matches.length > 0){
	eval(matches[0]);
	if(dependencies && dependencies.prefixes && dependencies.prefixes.length > 0){
		for(i = 0; i < dependencies.prefixes.length; i++){
			print("Adding module resource dir: " + djConfig.baseRelativePath + dependencies.prefixes[i][1]);
			srcDirs.push(djConfig.baseRelativePath + dependencies.prefixes[i][1]);
		}
	}
}

if(action == "xdgen"){
	//Build master list of files to process.
	var jsFileNames = findJsFiles(srcDirs, /\.js$/);
	
	//Run makeXdContents on each file and save the XD file contents to a xd.js file.
	for(j = 0; j < jsFileNames.length; j++){
		//Use new String so we get a JS string and not a Java string.
		var jsFileName = new String(jsFileNames[j]);
		var xdFileName = jsFileName.replace(/\.js$/, ".xd.js");
		var xdContents = makeXdContents(readText(jsFileName), djConfig.baseRelativePath, dependencies.prefixes);
		buildUtil.saveUtf8File(xdFileName, xdContents);
	}
}else if(action == "xdremove"){
	//Build master list of files to process.
	var jsFileNames = findJsFiles(srcDirs, /\.xd\.js$/);
	
	//Run makeXdContents on each file and save the XD file contents to a xd.js file.
	for(j = 0; j < jsFileNames.length; j++){
		buildUtil.deleteFile(jsFileNames[j]);
	}
}

//END of the "main" part of the script.
