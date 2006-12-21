//TODO:
//- Doesn't intern strings for prefix dirs in xd case?

function makeResourceUri(resourceName, templatePath, srcRoot, prefixes){
	var bestPrefix = "";
	var bestPrefixPath = ""
	if(prefixes){
		for (var i = 0; i < prefixes.length; i++){
			var prefix = prefixes[i];
			//Prefix must match from the start of the resourceName string.
			if(resourceName.indexOf(prefix[0]) == 0){
				if(prefix[0].length > bestPrefix.length){
					bestPrefix = prefix[0];
					bestPrefixPath = prefix[1];
				}
			}
		}

		if(bestPrefixPath != ""){
			//Convert resourceName to a path
			resourceName = resourceName.replace(bestPrefix, "");
			if(resourceName.indexOf(".") == 0){
				resourceName = resourceName.substring(1, resourceName.length);
			}
			resourceName = resourceName.replace(/\./g, "/");

			//Final path construction
			var finalPath = srcRoot;
			finalPath += bestPrefixPath + "/";
			if(resourceName){
				finalPath += resourceName + "/";
			}
			finalPath += templatePath;

			return finalPath;
		}
	}

	return srcRoot + templatePath;
}

function internTemplateStrings(profileFile, loader, releaseDir, srcRoot){
	loader = loader || "default";
	releaseDir = releaseDir || "../release/dojo";
	srcRoot = srcRoot || "../";
	
	print("loader: " + loader);
	print("releaseDir - " + releaseDir);
	var resourceFile = releaseDir + "/dojo.js";

	//Load Dojo so we can use readText() defined in hostenv_rhino.js.
	//Also gives us the ability to use all the neato toolkit features.
	djConfig={
		baseRelativePath: "../"
	};
	load('../dojo.js');
	dojo.require("dojo.string.extras");
	dojo.require("dojo.i18n.common");
	dojo.require("dojo.json");
	
	//Find the bundles that need to be flattened.
	load("buildUtil.js");

	var prefixes = buildUtil.getDependencyPropertyFromProfile(profileFile, "prefixes");
	var skiplist = buildUtil.getDependencyPropertyFromProfile(profileFile, "internSkipList");
	
	internTemplateStringsInFile(loader, resourceFile, srcRoot, prefixes, skiplist);

	//If doing xdomain, then need to fix up the .xd.js files in the widget subdir.
	if(loader == "xdomain"){
		var fileList = buildUtil.getFilteredFileList(releaseDir + "/src/widget",
			/\.xd\.js$/, true);

		if(fileList){
			for(var i = 0; i < fileList.length; i++){
				internTemplateStringsInFile(loader, fileList[i], srcRoot, prefixes, skiplist)
			}
		}
	}
}

function internTemplateStringsInFile(loader, resourceFile, srcRoot, prefixes, skiplist){
	var resourceContent = new String(readText(resourceFile));
	resourceContent = regexpMagic(loader, resourceContent, srcRoot, prefixes, skiplist);
	buildUtil.saveUtf8File(resourceFile, resourceContent);
}

var dojoUriRegExpString = "(((templatePath|templateCssPath)\\s*(=|:)\\s*)|dojo\\.uri\\.cache\\.allow\\(\\s*)dojo\\.uri\\.(dojo|module)?Uri\\(\\s*?[\\\"\\']([\\w\\.\\/]+)[\\\"\\'](([\\,\\s]*)[\\\"\\']([\\w\\.\\/]*)[\\\"\\'])?\\s*\\)";
var globalDojoUriRegExp = new RegExp(dojoUriRegExpString, "g");
var localDojoUriRegExp = new RegExp(dojoUriRegExpString);

function regexpMagic(loader, resourceContent, srcRoot, prefixes, skiplist){
	return resourceContent.replace(globalDojoUriRegExp, function(matchString){
		var parts = matchString.match(localDojoUriRegExp);

		var filePath = "";
		var resourceNsName = "";
		if(parts[5] == "dojo"){
			if(parts[6].match(/(\.htm|\.html|\.css)$/)){
				print("Dojo match: " + parts[6]);
				filePath = srcRoot + parts[6]
				resourceNsName = "dojo:" + parts[6];
			}
		}else{
			print("Module match: " + parts[6] + " and " + parts[9]);
			filePath = makeResourceUri(parts[6], parts[9], srcRoot, prefixes);
			resourceNsName = parts[6] + ':' + parts[9];		
		}

		if(!filePath || isValueInArray(resourceNsName, skiplist)){
			if(filePath){
				print("Skip intern resource: " + filePath);
			}
		}else{
			print("Interning resource path: " + filePath);
			//dojo.string.escapeString will add starting and ending double-quotes.
			var jsEscapedContent = dojo.string.escapeString(new String(readText(filePath)));
			if(jsEscapedContent){
				if(matchString.indexOf("dojo.uri.cache.allow") != -1){
					//Handle dojo.uri.cache-related interning.
					var parenIndex = matchString.lastIndexOf(")");
					matchString = matchString.substring(0, parenIndex + 1) + ", " + jsEscapedContent;
					matchString = matchString.replace("dojo.uri.cache.allow", "dojo.uri.cache.set");
				}else{
					//Handle templatePath/templateCssPath-related interning.
					if(parts[3] == "templatePath"){
						//Replace templatePaths
						matchString = "templateString" + parts[4] + jsEscapedContent;
					}else{
						//Dealing with templateCssPath
						//For the CSS we need to keep the template path in there
						//since the widget loading stuff uses the template path to
						//know whether the CSS has been processed yet.
						//Could have matched assignment via : or =. Need different statement separators at the end.
						var assignSeparator = parts[4];
						var statementSeparator = ",";
						var statementPrefix = "";
			
						//FIXME: this is a little weak because it assumes a "this" in front of the templateCssPath
						//when it is assigned using an "=", as in 'this.templateCssPath = dojo.uri.dojoUri("some/path/to/Css.css");'
						//In theory it could be something else, but in practice it is not, and it gets a little too weird
						//to figure out, at least for now.
						if(assignSeparator == "="){
							statementSeparator = ";";
							statementPrefix = "this.";
						}
						matchString = "templateCssString" + assignSeparator + jsEscapedContent + statementSeparator + statementPrefix + parts[0];
					}
				}
			}
		}

		return matchString;
	});
}

function isValueInArray(value, ary){
	for(var i = 0; i < ary.length; i++){
		if(ary[i] == value){
			return true;
		}
	}
	return false;
}

//START of the "main" part of the script.
//This is the entry point for this script file.
var profileFile = arguments[0];
var loader = arguments[1];
var releaseDir = arguments[2];
var srcRoot = arguments[3];
internTemplateStrings(profileFile, loader, releaseDir, srcRoot);
