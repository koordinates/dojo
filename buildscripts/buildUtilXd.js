var buildUtilXd = {};

buildUtilXd.getPrefixesFromProfile = function(profileFile){
	//Load the profile file to get resource paths for external modules.
	//Use new String to make sure we have a JS string (not a Java string)
	//readText is from hostenv_rhino.js, so be sure to load Dojo before calling this function.
	var profileText = new String(readText(profileFile));
	var result = null;
	
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
			result = dependencies.prefixes;
		}
	}

	return result;
}

//The regular expressions that will help find dependencies in the file contents.
buildUtilXd.masterRegExpString = "dojo.(requireLocalization|require|requireIf|requireAll|provide|requireAfterIf|requireAfter|kwCompoundRequire|conditionalRequire|hostenv\\.conditionalLoadModule|.hostenv\\.loadModule|hostenv\\.moduleLoaded)\\(([\\w\\W]*?)\\)";
buildUtilXd.globalDependencyRegExp = new RegExp(buildUtilXd.masterRegExpString, "mg");
buildUtilXd.dependencyPartsRegExp = new RegExp(buildUtilXd.masterRegExpString);


//START makeXdContents function
//Function that generates the XD version of the module file's contents
buildUtilXd.makeXdContents = function(fileContents, baseRelativePath, prefixes){
	var dependencies = [];
	
	//Use the regexps to find resource dependencies for this module file.
	var depMatches = fileContents.match(this.globalDependencyRegExp);
	if(depMatches){
		for(var i = 0; i < depMatches.length; i++){
			var partMatches = depMatches[i].match(this.dependencyPartsRegExp);
			var depCall = partMatches[1];
			var depArgs = partMatches[2];

			if(depCall == "requireLocalization"){
				//Need to find out what locales are available so the dojo loader
				//only has to do one script request for the closest matching locale.
				var l10nMatches = depArgs.split(/\,\s*/);
				if(l10nMatches && l10nMatches.length > 1){
					var moduleName = l10nMatches[0] ? l10nMatches[0].replace(/\"/g, "") : null;
					var bundleName = l10nMatches[1] ? l10nMatches[1].replace(/\"/g, "") : null;
					var localeName = l10nMatches[2];
					
					//Build a path to the bundle directory and ask for all files that match
					//the bundle name.
					var filePath = this.mapResourceToPath(moduleName, baseRelativePath, prefixes);
					
					var bundleRegExp = new RegExp("nls[/]?([\\w\\-]*)/" + bundleName + ".js$");
					var bundleFiles = buildUtil.getFilteredFileList(filePath + "nls/", bundleRegExp);;
					
					//Find the list of locales supported by looking at the path names.
					var locales = [];
					for(var j = 0; j < bundleFiles.length; j++){
						var bundleParts = bundleFiles[j].match(bundleRegExp);
						if(bundleParts && bundleParts[1]){
							locales.push(bundleParts[1]);
						}else{
							locales.push("ROOT");
						}
					}
					
					//Add the supported locales to the requireLocalization arguments.
					if(!localeName){
						depArgs += ", null";
					}
					
					depCall = "xdRequireLocalization";
					depArgs += ', "' + locales.join(",") + '"';
				}else{
					//Malformed requireLocalization call. Skip it. May be a comment.
					continue;
				}
			}
	
			dependencies.push('"' + depCall + '", ' + depArgs);
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
	//Remove requireLocalization calls, since that will mess things up.
	//String() part is needed since fileContents is a Java object.
	xdContentsBuffer.push(String(fileContents).replace(/dojo\.requireLocalization\([^\)]*\)/g, ""));
	xdContentsBuffer.push("\n}});");
	
	return xdContentsBuffer.join("");
}
//END makeXdContents function


//START makeXdBundleContents function
buildUtilXd.makeXdBundleContents = function(currentPrefix, prefixPath, srcFileName, fileContents, baseRelativePath, prefixes){
	print("Flattening bundle: " + srcFileName);

	//Pull off any ../ values from prefix path to make matching easier.
	var prefixPath = prefixPath.replace(/\.\.\//g, "");

print("##prefixPath: " + prefixPath);

	//Strip off the prefix path so we can find the real resource and bundle names.
	var prefixStartIndex = srcFileName.indexOf(prefixPath);
	if(prefixStartIndex != -1){
		var startIndex = prefixStartIndex + prefixPath.length;
		
		//Need to add one if the prefiPath does not include an ending /. Otherwise,
		//We'll get extra dots in our bundleName.
		if(prefixPath.charAt(prefixPath.length) != "/"){
			startIndex += 1;
		}
		srcFileName = srcFileName.substring(startIndex, srcFileName.length);
	}
	
	print("## srcFileName: " + srcFileName);
	//var srcIndex = srcFileName.indexOf("src/");
	//srcFileName = srcFileName.substring(srcIndex + 4, srcFileName.length);
	var parts = srcFileName.split("/");

	//Split up the srcFileName into arguments that can be used for dojo.requireLocalization()
	var moduleParts = [currentPrefix];
	for(var i = 0; parts[i] != "nls"; i++){
		moduleParts.push(parts[i]);
	}
	var moduleName = moduleParts.join(".");
	if(parts[i+1].match(/\.js$/)){
		var localeName = "ROOT";
		var bundleName = parts[i+1];
	}else{
		var localeName = parts[i+1];
		var bundleName = parts[i+2];	
	}

	if(!bundleName || bundleName.indexOf(".js") == -1){
		//Not a valid bundle. Could be something like a README file.
		return;
	}else{
		bundleName = bundleName.replace(/\.js/, "");
	}
	
	print("## moduleName: " + moduleName + ", bundleName: " + bundleName + ", localeName: " + localeName);
	dojo.requireLocalization(moduleName, bundleName, localeName);
	
	
	//Get the generated, flattened bundle.
	var module = dojo.evalObjPath(moduleName);
	var flattenedBundle = module.nls[bundleName][localeName.replace(/-/g, "_")];
	print("## flattenedBundle: " + flattenedBundle);
	if(!flattenedBundle){
		throw "Cannot create flattened bundle for src file: " + srcFileName;
	}
	
	//Construct the flattened bundle contents with a call to the xd loading function.
	if(localeName == "ROOT"){
		localeName = "";
	}
	var fileContents = 'dojo.provide("' + moduleName + '.nls.' + (localeName ? localeName + '.' : '') + bundleName + '");'
	                 + 'dojo.hostenv.xdLoadFlattenedBundle("' + moduleName + '", "' + bundleName
                   + '", "' + localeName + '", ' + dojo.json.serialize(flattenedBundle) + ');';

	//Now make a proper xd.js file out of the content.
	return buildUtilXd.makeXdContents(fileContents, baseRelativePath, prefixes);
}
//END makeXdBundleContents function

//START mapResourceToPath function
buildUtilXd.mapResourceToPath = function(resourceName, baseRelativePath, prefixes){
	//summary: converts a resourceName to a path.
	//resourceName: String: like dojo.foo or mymodule.bar
	//baseRelativePath: String: the relative path to Dojo. All resource paths are relative to dojo.
	//                  it always ends in with a slash.
	//prefixes: Array: Actually an array of arrays. Comes from profile js file.
	//          dependencies.prefixes = [["mymodule.foo", "../mymoduledir"]];
	
	var bestPrefix = "";
	var bestPrefixPath = "";
	if(prefixes){
		for(var i = 0; i < prefixes.length; i++){
			//Prefix must match from the start of the resourceName string.
			if(resourceName.indexOf(prefixes[i][0]) == 0){
				if(prefixes[i][0].length > bestPrefix.length){
					bestPrefix = prefixes[i][0];
					bestPrefixPath = prefixes[i][1];
				}
			}
		}
	}

	if(bestPrefixPath == "" && resourceName.indexOf("dojo.") == 0){
		bestPrefix = "dojo";
		bestPrefixPath = "src/";
	}
	
	//Get rid of matching prefix from resource name.
	resourceName = resourceName.replace(bestPrefix, "");
	
	if(resourceName.charAt(0) == '.'){
		resourceName = resourceName.substring(1, resourceName.length);
	}
	
	resourceName = resourceName.replace(/\./g, "/");

	var finalPath = baseRelativePath + bestPrefixPath;
	if(finalPath.charAt(finalPath.length - 1) != "/"){
		finalPath += "/";
	}
	if (resourceName){
		finalPath += resourceName + "/";
	}
	
	return finalPath;
}
//END mapResourceToPath function
