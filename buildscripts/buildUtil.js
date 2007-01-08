var buildUtil = {};
buildUtil.getDependencyList = function(dependencies, hostenvType) {
	djConfig = {
		baseRelativePath: "../"
		// isDebug: true
	};
	
	if(!dependencies){
		dependencies = [ 
			"dojo.event.*",
			"dojo.io.*",
			"dojo.string",
			"dojo.xml.*",
			"dojo.xml.Parse",
			"dojo.widget.Parse",
			"dojo.widget.Button"
		];
	}
	
	var dojoLoader = dependencies["loader"]||java.lang.System.getProperty("DOJO_LOADER");
	if(!dojoLoader || dojoLoader=="null" || dojoLoader==""){
		dojoLoader = "default";
	}
	dj_global = {};
	
	load("../src/bootstrap1.js");
	load("../src/loader.js");
	load("../src/hostenv_rhino.js");
	load("../src/bootstrap2.js");

	// FIXME: is this really what we want to say?
	dojo.render.html.capable = true;
	
	dojo.hostenv.loadedUris.push("dojoGuardStart.js");
	dojo.hostenv.loadedUris.push("../src/bootstrap1.js");
	
	if(dojoLoader == "default"){
		dojo.hostenv.loadedUris.push("../src/loader.js");
	}else if(dojoLoader=="xdomain"){
		dojo.hostenv.loadedUris.push("../src/loader.js");
		dojo.hostenv.loadedUris.push("../src/loader_xd.js");
	}
	dojo.hostenv.loadedUris.push("dojoGuardEnd.js");
	
	if(!hostenvType){
		hostenvType = "browser";
	}
	
	if(hostenvType.constructor == Array){
		for(var x=0; x<hostenvType.length; x++){
			dojo.hostenv.loadedUris.push("../src/hostenv_"+hostenvType[x]+".js");
		}
		hostenvType = hostenvType.pop();
	}else{
		dojo.hostenv.loadedUris.push("../src/hostenv_"+hostenvType+".js");
	}
	
	dojo.hostenv.loadedUris.push("../src/bootstrap2.js");
	
	if(dependencies["prefixes"]){
		var tmp = dependencies.prefixes;
		for(var x=0; x<tmp.length; x++){
			dojo.registerModulePath(tmp[x][0], tmp[x][1]);
		}
	}
	
	dojo.hostenv.name_ = hostenvType;
	
	//Override dojo.provide to get a list of resource providers.
	var provideList = [];
	dojo._provide = dojo.provide;
	dojo.provide = function(resourceName){
		provideList.push(resourceName);
		dojo._provide(resourceName);
	}
	
	function removeComments(contents){
		// if we get the contents of the file from Rhino, it might not be a JS
		// string, but rather a Java string, which will cause the replace() method
		// to bomb.
		contents = new String((!contents) ? "" : contents);
		// clobber all comments
		contents = contents.replace( /^(.*?)\/\/(.*)$/mg , "$1");
		contents = contents.replace( /(\n)/mg , "__DOJONEWLINE");
		contents = contents.replace( /\/\*(.*?)\*\//g , "");
		return contents.replace( /__DOJONEWLINE/mg , "\n");
	}
	
	// over-write dj_eval to prevent actual loading of subsequent files
	var old_eval = dj_eval;
	dj_eval = function(){ return true; }
	var old_load = load;
	load = function(uri){
		try{
			var text = removeComments(readText(uri));
			var requires = dojo.hostenv.getRequiresAndProvides(text);
			eval(requires.join(";"));
			dojo.hostenv.loadedUris.push(uri);
			dojo.hostenv.loadedUris[uri] = true;
			var delayRequires = dojo.hostenv.getDelayRequiresAndProvides(text);
			eval(delayRequires.join(";"));
		}catch(e){ 
			java.lang.System.err.println("error loading uri: " + uri + ", exception: " + e);
			quit(-1);
		}
		return true;
	}
	
	dojo.hostenv.getRequiresAndProvides = function(contents){
		// FIXME: should probably memoize this!
		if(!contents){ return []; }
	
		// check to see if we need to load anything else first. Ugg.
		var deps = [];
		var tmp;
		RegExp.lastIndex = 0;
		var testExp = /dojo.(hostenv.loadModule|hostenv.require|require|kwCompoundRequire|hostenv.conditionalLoadModule|hostenv.startPackage|provide)\([\w\W]*?\)/mg;
		while((tmp = testExp.exec(contents)) != null){
			deps.push(tmp[0]);
		}
		return deps;
	}
	
	dojo.hostenv.getDelayRequiresAndProvides = function(contents){
		// FIXME: should probably memoize this!
		if(!contents){ return []; }
	
		// check to see if we need to load anything else first. Ugg.
		var deps = [];
		var tmp;
		RegExp.lastIndex = 0;
		var testExp = /dojo.(requireAfterIf|requireIf)\([\w\W]*?\)/mg;
		while((tmp = testExp.exec(contents)) != null){
			deps.push(tmp[0]);
		}
		return deps;
	}

	if(dependencies["dojoLoaded"]){
		dependencies["dojoLoaded"]();
	}
	
	for(var x=0; x<dependencies.length; x++){
		try{
			var dep = dependencies[x];
			if(dep.indexOf("(") != -1){
				dep = dojo.hostenv.getDepsForEval(dep)[0];
			}
			//Don't process loader_xd.js since it has some regexps 
			//and mentions of dojo.require/provide, which will cause 
			//havoc in the dojo.hostenv.loadModule() method.
			if(dep.indexOf("loader_xd.js") == -1){
				dojo.hostenv.loadModule(dep, null, true);
			}
		}catch(e){
			java.lang.System.err.println("Error loading module!" + e);
			quit(-1);
		}
	}
	
	// FIXME: we should also provide some way of figuring out what files are the
	// test files for the namespaces which are included and provide them in the
	// final package.
	
	// FIXME: should we turn __package__.js file clobbering on? It will break things if there's a subdir rolled up into a __package__
	/*
	for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
		print(dojo.hostenv.loadedUris[x].substr(-14));
		if(dojo.hostenv.loadedUris[x].substr(-14) == "__package__.js"){
			dojo.hostenv.loadedUris.splice(x, 1);
			x--;
		}
	}
	*/
	
	// print("URIs, in order: ");
	// for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
	// 	print(dojo.hostenv.loadedUris[x]);
	// }
	
	var depList = [];
	var seen = {};
	uris: for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
		var curi = dojo.hostenv.loadedUris[x];
		if(!seen[curi]){
			seen[curi] = true;
			if(dependencies["filters"]){
				for(var i in dependencies.filters){
					if(curi.match(dependencies.filters[i])){
						continue uris;
					}}}
			depList.push(curi);
		}
	}
	
	load = old_load; // restore the original load function
	dj_eval = old_eval; // restore the original dj_eval function
	
	dj_global['dojo'] = undefined;
	dj_global['djConfig'] = undefined;
	delete dj_global;
		
	return {
		depList: depList,
		provideList: provideList
	};
}

buildUtil.loadDependencyList = function(/*String*/profileFile){
	var dependencies = null;
	var hostenvType = null;
	var profileText = readFile(profileFile);
	
	//Remove the call to getDependencyList.js because we want to call it manually.
	profileText = profileText.replace(/load\(("|')getDependencyList.js("|')\)/, "");
	eval(profileText);
	if(hostenvType){
		hostenvType.join(",\n");
	}
	var depResult = buildUtil.getDependencyList(dependencies, hostenvType);
	depResult.dependencies = dependencies;
	
	return depResult;
}

buildUtil.makeDojoJs = function(/*String*/profileFile, /*String*/version){
	//summary: Makes the uncompressed contents for dojo.js.

	//Get the profileFile text.
	var lineSeparator = java.lang.System.getProperty("line.separator");
	
	//Remove the call to getDependencyList.js because we want to call it manually.
	var depLists = buildUtil.loadDependencyList(profileFile);
	var depList = depLists.depList;

	//Concat the files together, and mark where we should insert all the
	//provide statements.
	var dojoContents = "";
	var insertedProvideMarker = false;
	for(var i = 0; i < depList.length; i++){
		//Make sure we have a JS string and not a Java string by using new String().
		dojoContents += new String(readFile(depList[i])) + "\r\n";
		if(!insertedProvideMarker && depList[i].indexOf("bootstrap2.js") != -1){
			dojoContents += "__DOJO_PROVIDE_INSERTION__";
			insertedProvideMarker = true;
		}
	}
	
	//Move all the dojo.provide calls to the top, and remove any matching dojo.require calls.
	//Sort the provide list alphabetically to make it easy to read. Order of provide statements
	//do not matter.
	var provideList = depLists.provideList.sort(); 
	var depRegExpString = "";
	for(var i = 0; i < provideList.length; i++){
		if(i != 0){
			depRegExpString += "|";
		}
		depRegExpString += '("' + provideList[i] + '")';
	}
		
	//If we have a string for a regexp, do the dojo.require() removal now.
	if(depRegExpString){
		var depRegExp = new RegExp("dojo\\.(provide|require)\\((" + depRegExpString + ")\\)(;?)", "g");
		dojoContents = dojoContents.replace(depRegExp, "");
	}

	//Insert all the provide statements at the provide insertion marker.
	var provideString = "";
	for(var i = 0; i < provideList.length; i++){
		provideString += 'dojo.provide("' + provideList[i] + '");' + lineSeparator;
	}
	dojoContents = dojoContents.replace(/__DOJO_PROVIDE_INSERTION__/, provideString);

	//Set version number.
	//First, break apart the version string.
	var verSegments = version.split(".");
	var majorValue = 0;
	var minorValue = 0;
	var patchValue = 0;
	var flagValue = "";
	
	if(verSegments.length > 0 && verSegments[0]){
		majorValue = verSegments[0];
	}
	if(verSegments.length > 1 && verSegments[1]){
		minorValue = verSegments[1];
	}
	if(verSegments.length > 2 && verSegments[2]){
		//If the patchValue has a string in it, split
		//it off and store it in the flagValue.
		var patchSegments = verSegments[2].split(/\D/);
		patchValue = patchSegments[0];
		if(patchSegments.length > 1){
			flagValue = verSegments[2].substring(patchValue.length, verSegments[2].length);
		}
	}
	if(verSegments.length > 3 && verSegments[3]){
		flagValue = verSegments[3];
	}
	
	//Do the final version replacement.
	dojoContents = dojoContents.replace(
		/major:\s*\d*,\s*minor:\s*\d*,\s*patch:\s*\d*,\s*flag:\s*".*?"\s*,/g,
		"major: " + majorValue + ", minor: " + minorValue + ", patch: " + patchValue + ", flag: \"" + flagValue + "\","
	);
	
	//Return the dependency list, since it is used for other things in the ant file.
	return {
		resourceDependencies: depList,
		dojoContents: dojoContents
	};

	//Things to consider for later:

	//preload resources?
	//Remove requireLocalization calls?
	
	//compress (or minify?)
	//Name changes to dojo.js here
	
	//no compress if nostrip = true
	//Name changes to dojo.js here
	
	//Add build notice
	
	//Add copyright notice
	
	//Remove ${release_dir}/source.__package__.js
}


buildUtil.getDependencyPropertyFromProfile = function(/*String*/profileFile, /*String*/propName){
	//summary: Gets a dependencies property from the profile file. The value
	//of the property is assumed to be an array. An array will always be returned,
	//but it may be an empty array.

	//Use new String to make sure we have a JS string (not a Java string)
	//readText is from hostenv_rhino.js, so be sure to load Dojo before calling this function.
	var profileText = new String(readText(profileFile));
	//Get rid of CR and LFs since they seem to mess with the regexp match.
	//Using the "m" option on the regexp was not enough.
	profileText = profileText.replace(/\r/g, "");
	profileText = profileText.replace(/\n/g, "");


	var result = [];
	var matchRegExp = new RegExp("(dependencies\\." + propName + "\\s*=\\s*\\[[^;]*\\s*\\])", "m");

	var matches = profileText.match(matchRegExp);
	//Create a shell object to hold the evaled properties.
	var dependencies = {};
	
	if(matches && matches.length > 0){
		eval(matches[0]);
		if(dependencies && dependencies[propName] && dependencies[propName].length > 0){
			result = dependencies[propName];
		}
	}

	return result; //Array
}

buildUtil.configPrefixes = function(profileFile){
	//summary: Get the resource prefixes from the profile and registers the prefixes with Dojo.
	var prefixes = this.getDependencyPropertyFromProfile(profileFile, "prefixes");
	if(prefixes && prefixes.length > 0){
		for(i = 0; i < prefixes.length; i++){
			dojo.registerModulePath(prefixes[i][0], prefixes[i][1]);
		}
	}
	return prefixes; //Array of arrays
}

//The regular expressions that will help find dependencies in the file contents.
buildUtil.masterDependencyRegExpString = "dojo.(requireLocalization|require|requireIf|requireAll|provide|requireAfterIf|requireAfter|kwCompoundRequire|conditionalRequire|hostenv\\.conditionalLoadModule|.hostenv\\.loadModule|hostenv\\.moduleLoaded)\\(([\\w\\W]*?)\\)";
buildUtil.globalDependencyRegExp = new RegExp(buildUtil.masterDependencyRegExpString, "mg");
buildUtil.dependencyPartsRegExp = new RegExp(buildUtil.masterDependencyRegExpString);

buildUtil.masterRequireLocalizationRegExpString = "dojo.(requireLocalization)\\(([\\w\\W]*?)\\)";
buildUtil.globalRequireLocalizationRegExp = new RegExp(buildUtil.masterRequireLocalizationRegExpString, "mg");
buildUtil.requireLocalizationRegExp = new RegExp(buildUtil.masterRequireLocalizationRegExpString);

buildUtil.modifyRequireLocalization = function(fileContents, baseRelativePath, prefixes){
	//summary: Modifies any dojo.requireLocalization calls in the fileContents to have the
	//list of supported locales as part of the call. This allows the i18n loading functions
	//to only make request(s) for locales that actually exist on disk.
	var dependencies = [];
	
	//Make sure we have a JS string, and not a Java string.
	fileContents = String(fileContents);
	
	var modifiedContents = null;
	
	if(fileContents.match(buildUtil.globalRequireLocalizationRegExp)){
		modifiedContents = fileContents.replace(buildUtil.globalRequireLocalizationRegExp, function(matchString){
			var replacement = matchString;
			var partMatches = matchString.match(buildUtil.requireLocalizationRegExp);
			var depCall = partMatches[1];
			var depArgs = partMatches[2];
	
			if(depCall == "requireLocalization"){
				//Need to find out what locales are available so the dojo loader
				//only has to do one script request for the closest matching locale.
				var reqArgs = buildUtil.getRequireLocalizationArgsFromString(depArgs);
				if(reqArgs.moduleName){
					//Find the list of locales supported by looking at the path names.
					var locales = buildUtil.getLocalesForBundle(reqArgs.moduleName, reqArgs.bundleName, baseRelativePath, prefixes);
	
					//Add the supported locales to the requireLocalization arguments.
					if(!reqArgs.localeName){
						depArgs += ", null";
					}
	
					depArgs += ', "' + locales.join(",") + '"';
					
					replacement = "dojo." + depCall + "(" + depArgs + ")";
				}
			}
			return replacement;		
		});
	}	
	return modifiedContents;
}

buildUtil.makeFlatBundleContents = function(prefix, prefixPath, srcFileName){
	//summary: Given a nls file name, flatten the bundles from parent locales into the nls bundle.
	var bundleParts = buildUtil.getBundlePartsFromFileName(prefix, prefixPath, srcFileName);
	if(!bundleParts){
		return null;
	}
	var moduleName = bundleParts.moduleName;
	var bundleName = bundleParts.bundleName;
	var localeName = bundleParts.localeName;

	//print("## moduleName: " + moduleName + ", bundleName: " + bundleName + ", localeName: " + localeName);
	dojo.requireLocalization(moduleName, bundleName, localeName);
	
	//Get the generated, flattened bundle.
	var module = dojo.evalObjPath(moduleName);
	var bundleLocale = localeName ? localeName.replace(/-/g, "_") : "ROOT";
	var flattenedBundle = module.nls[bundleName][bundleLocale];
	//print("## flattenedBundle: " + flattenedBundle);
	if(!flattenedBundle){
		throw "Cannot create flattened bundle for src file: " + srcFileName;
	}

	return dojo.json.serialize(flattenedBundle);
}

//Given a module and bundle name, find all the supported locales.
buildUtil.getLocalesForBundle = function(moduleName, bundleName, baseRelativePath, prefixes){
	//Build a path to the bundle directory and ask for all files that match
	//the bundle name.
	var filePath = this.mapResourceToPath(moduleName, baseRelativePath, prefixes);
	
	var bundleRegExp = new RegExp("nls[/]?([\\w\\-]*)/" + bundleName + ".js$");
	var bundleFiles = buildUtil.getFilteredFileList(filePath + "nls/", bundleRegExp, true);
	
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

	return locales;
}

buildUtil.getRequireLocalizationArgsFromString = function(argString){
	//summary: Given a string of the arguments to a dojo.requireLocalization
	//call, separate the string into individual arguments.
	var argResult = {
		moduleName: null,
		bundleName: null,
		localeName: null
	};
	
	var l10nMatches = argString.split(/\,\s*/);
	if(l10nMatches && l10nMatches.length > 1){
		argResult.moduleName = l10nMatches[0] ? l10nMatches[0].replace(/\"/g, "") : null;
		argResult.bundleName = l10nMatches[1] ? l10nMatches[1].replace(/\"/g, "") : null;
		argResult.localeName = l10nMatches[2];
	}
	return argResult;
}

buildUtil.getBundlePartsFromFileName = function(prefix, prefixPath, srcFileName){
	//Pull off any ../ values from prefix path to make matching easier.
	var prefixPath = prefixPath.replace(/\.\.\//g, "");

	//Strip off the prefix path so we can find the real resource and bundle names.
	var prefixStartIndex = srcFileName.lastIndexOf(prefixPath);
	if(prefixStartIndex != -1){
		var startIndex = prefixStartIndex + prefixPath.length;
		
		//Need to add one if the prefiPath does not include an ending /. Otherwise,
		//We'll get extra dots in our bundleName.
		if(prefixPath.charAt(prefixPath.length) != "/"){
			startIndex += 1;
		}
		srcFileName = srcFileName.substring(startIndex, srcFileName.length);
	}
	
	//var srcIndex = srcFileName.indexOf("src/");
	//srcFileName = srcFileName.substring(srcIndex + 4, srcFileName.length);
	var parts = srcFileName.split("/");

	//Split up the srcFileName into arguments that can be used for dojo.requireLocalization()
	var moduleParts = [prefix];
	for(var i = 0; parts[i] != "nls"; i++){
		moduleParts.push(parts[i]);
	}
	var moduleName = moduleParts.join(".");
	if(parts[i+1].match(/\.js$/)){
		var localeName = "";
		var bundleName = parts[i+1];
	}else{
		var localeName = parts[i+1];
		var bundleName = parts[i+2];	
	}

	if(!bundleName || bundleName.indexOf(".js") == -1){
		//Not a valid bundle. Could be something like a README file.
		return null;
	}else{
		bundleName = bundleName.replace(/\.js/, "");
	}

	return {moduleName: moduleName, bundleName: bundleName, localeName: localeName};
}

buildUtil.mapResourceToPath = function(resourceName, baseRelativePath, prefixes){
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

//Recurses startDir and finds matches to the files that match regExpFilter.
//Ignores files/directories that start with a period (.).
buildUtil.getFilteredFileList = function(startDir, regExpFilter, makeUnixPaths, startDirIsJavaObject){
	var files = [];

	var topDir = startDir;
	if(!startDirIsJavaObject){
		topDir = new java.io.File(startDir);
	}

	if(topDir.exists()){
		var dirFileArray = topDir.listFiles();
		for (var i = 0; i < dirFileArray.length; i++){
			var file = dirFileArray[i];
			if(file.isFile()){
				var filePath = file.getPath();
				if(makeUnixPaths){
					//Make sure we have a JS string.
					filePath = String(filePath);
					if(filePath.indexOf("/") == -1){
						filePath = filePath.replace(/\\/g, "/");
					}
				}
				if(!file.getName().match(/^\./) && filePath.match(regExpFilter)){
					files.push(filePath);
				}
			}else if(file.isDirectory() && !file.getName().match(/^\./)){
				var dirFiles = this.getFilteredFileList(file, regExpFilter, makeUnixPaths, true);
				files.push.apply(files, dirFiles);
			}
		}
	}

	return files;
}

buildUtil.ensureEndSlash = function(path){
	if(path.charAt(path.length) != '/' || path.charAt(path.length) != '\\'){
		path += "/";
	}
	return path;
}

buildUtil.saveUtf8File = function(/*String*/fileName, /*String*/fileContents){
	buildUtil.saveFile(fileName, fileContents, "utf-8");
}

buildUtil.saveFile = function(/*String*/fileName, /*String*/fileContents, /*String?*/encoding){
	var outFile = new java.io.File(fileName);
	var outWriter;
	if(encoding){
		outWriter = new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile), encoding);
	}else{
		outWriter = new java.io.OutputStreamWriter(new java.io.FileOutputStream(outFile));
	}

	var os = new java.io.BufferedWriter(outWriter);
	try{
		os.write(fileContents);
	}finally{
		os.close();
	}
}

buildUtil.deleteFile = function(fileName){
	var file = new java.io.File(fileName);
	if(file.exists()){
		file["delete"]();
	}
}
