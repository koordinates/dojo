dojo.provide("dojo._base._loader.loader_xd");

(function() {
	dojo._inFlightCount = 0;

	var oldAddOnLoad = dojo.addOnLoad;

	dojo.addOnLoad = function(/*Object?*/obj, /*String|Function*/functionName){
		// summary:
		//		Registers a function to be triggered after the DOM has finished
		//		loading and widgets declared in markup have been instantiated.
		//		Images and CSS files may or may not have finished downloading when
		//		the specified function is called.  (Note that widgets' CSS and HTML
		//		code is guaranteed to be downloaded before said widgets are
		//		instantiated.)
		// example:
		//	|	dojo.addOnLoad(functionPointer);
		//	|	dojo.addOnLoad(object, "functionName");
		//	|	dojo.addOnLoad(object, function(){ /* ... */});

		oldAddOnLoad(dojo._loaders, obj, functionName);

		// dojo.addOnLoad is used to
		// indicate callbacks after doing some dojo.require() statements.
		// In the cross-domain case, if all the requires are loaded (after initial
		// page load), then immediately call any listeners.

		if(!dojo._inFlightCount && !dojo._loadNotifying){
			dojo._callLoaded();
		}
	};

	var _oldModulesLoaded = dojo._modulesLoaded;

	dojo._modulesLoaded = function(){
		if(this._inFlightCount > 0){ 
			throw new Error("Files still in flight.");
		}		
		_oldModulesLoaded.call(this);	
	};

	var oldLoaded = dojo.loaded;

	dojo.loaded = function(){
		oldLoaded.call(this);

		// Make sure nothing else got added to the onload queue
		// after this first run. If something did, and we are not waiting for any
		// more in-flight resources, run again.

		if(this._loaders.length && !this._inFlightCount){
			this._callLoaded();
		}
	};

	dojo._xdReset = function(){
		//summary: Internal xd loader function. Resets the xd state.

		//This flag indicates where or not we have crossed into cross-domain territory. Once any resource says
		//is deemed to be cross-domain.

		this._isXDomain = dojo.config.useXDomain || false;

		this._xdTimer = 0;
		this._xdInFlight = {};
		this._xdOrderedReqs = [];
		this._xdDepMap = {};
		this._xdContents = [];
		this._xdDefList = [];
	};

	//Call reset immediately to set the state.
	dojo._xdReset();

	dojo._xdCreateResource = function(/*String*/contents, /*String*/resourceName, /*String*/resourcePath){

		// summary: Creates an xd module source given an
		// non-xd module contents.

		// Remove comments. Not perfect, but good enough for dependency resolution.

		var depContents = contents.replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg , "");

		// Find dependencies.

		// NOTE: Why?

		var deps = [];
		var depRegExp = /dojo.(require|requireIf|provide|requireAfterIf|platformRequire|requireLocalization)\s*\(([\w\W]*?)\)/mg;
		var done, match;
		while(!done){
			match = depRegExp.exec(depContents);
			if (match) {
				if(match[1] == "requireLocalization"){
					//Need to load the local bundles asap, since they are not
					//part of the list of modules watched for loading.
					dojo["eval"](match[0]);
				}else{
					deps.push('"' + match[1] + '", ' + match[2]);
				}
			} else {
				done = true;
			}
		}

		// Create resource object and the call to _xdResourceLoaded.

		var output = [];
		output.push(dojo._scopeName + "._xdResourceLoaded(function(" + dojo._scopePrefixArgs + "){\n");

		// See if there are any dojo.loadInit calls

		var loadInitCalls = dojo._xdExtractLoadInits(contents);
		if(loadInitCalls){

			//Adjust fileContents since extractLoadInits removed something.

			contents = loadInitCalls[0];
		
			//Add any loadInit calls to the top of the xd file.

			for(var i = 1; i < loadInitCalls.length; i++){
				output.push(loadInitCalls[i] + ";\n");
			}
		}

		output.push("return {");

		//Add dependencies

		if(deps.length > 0){
			output.push("depends: [");
			for(i = 0; i < deps.length; i++){
				if(i > 0){
					output.push(",\n");
				}
				output.push("[" + deps[i] + "]");
			}
			output.push("],");
		}

		//Add the contents of the file inside a function.
		//Pass in scope arguments so we can support multiple versions of the
		//same module on a page.

		output.push("\ndefineResource: function(" + dojo._scopePrefixArgs + "){");

		//Don't put in the contents in the debugAtAllCosts case
		//since the contents may have syntax errors. Let those
		//get pushed up when the script tags are added to the page
		//in the debugAtAllCosts case.

		if(!dojo.config.debugAtAllCosts || resourceName == "dojo._base._loader.loader_debug"){
			output.push(contents);
		}
		//Add isLocal property so we know if we have to do something different
		//in debugAtAllCosts situations.
		output.push("\n}, resourceName: '" + resourceName + "', resourcePath: '" + resourcePath + "'};});");

		return output.join(""); //String
	};

	dojo._xdExtractLoadInits = function(/*String*/fileContents){
		var regexp = /dojo.loadInit\s*\(/g;
		regexp.lastIndex = 0;

		var parenRe = /[\(\)]/g;
		parenRe.lastIndex = 0;

		var results = [];
		var matches;
		while((matches = regexp.exec(fileContents))){

			// Find end of the call by finding the matching end parenthesis

			parenRe.lastIndex = regexp.lastIndex;
			var matchCount = 1;
			var parenMatch;
			while((parenMatch = parenRe.exec(fileContents))){
				if(parenMatch[0] == ")"){
					matchCount -= 1;
				}else{
					matchCount += 1;
				}
				if(!matchCount){
					break;
				}
			}
		
			if(matchCount){
				throw new Error("Unmatched parentheses around character " + parenRe.lastIndex + " in: " + fileContents);
			}

			// Put the master matching string in the results.

			var startIndex = regexp.lastIndex - matches[0].length;
			results.push(fileContents.substring(startIndex, parenRe.lastIndex));

			// Remove the matching section.

			var remLength = parenRe.lastIndex - startIndex;
			fileContents = fileContents.substring(0, startIndex) + fileContents.substring(parenRe.lastIndex, fileContents.length);

			// Move the master RegExp past the last matching paren point.

			regexp.lastIndex = parenRe.lastIndex - remLength;
			regexp.lastIndex = parenRe.lastIndex;
		}

		if(results.length > 0){
			results.unshift(fileContents);
		}

		return (results.length ? results : null);
	};

	dojo._xdIsXDomainPath = function(/*string*/relpath) {

		// summary: Figure out whether the path is local or x-domain
		// If there is a colon before the first / then, we have a URL with a protocol.
    
		var colonIndex = relpath.indexOf(":");
		var slashIndex = relpath.indexOf("/");

		if (colonIndex > 0 && colonIndex < slashIndex){
			return true;
		} else {

			// Is the base script URI-based URL a cross domain URL?
			// If so, then the relpath will be evaluated relative to
			// baseUrl, and therefore qualify as xdomain.
			// Only treat it as xdomain if the page does not have a
			// host (file:// url) or if the baseUrl does not match the
			// current domain.

			var url = this.baseUrl, win = dojo._getWin();
			colonIndex = url.indexOf(":");
			slashIndex = url.indexOf("/");
			if(colonIndex > 0 && colonIndex < slashIndex && (!win.location.host || url.indexOf("http://" + win.location.host))){
				return true;
			}
		}
		return false;     
	};

	dojo._loadPath = function(/*String*/relpath, /*String?*/module, /*Function?*/cb){

		// summary: XD loader function. Overrides standard loader.

		var currentIsXDomain = this._xdIsXDomainPath(relpath);
		this._isXDomain |= currentIsXDomain;
		var uri = (this._protocolPattern.test(relpath) ? "" : this.baseUrl) + relpath;

		if (this._postLoad || !dojo._writeScript) {
			return (module && !currentIsXDomain) ? this._loadUriAndCheck(uri, module, cb) : this._loadUri(uri, cb); // Boolean
		} else {
			dojo._writeScript(uri);
			return true;
		}
	};

	var oldLoadUri = dojo._loadUri;

	dojo._loadUri = function(/*String*/uri, /*Function?*/cb, /*boolean*/currentIsXDomain, /*String?*/module){
		if(this._loadedUrls[uri]){
			return true; // Boolean
		}

		// Add the module (resource) to the list of modules.
		// Only do this work if we have a module name. Otherwise, 
		// it is a non-XD i18n bundle, which can load immediately and does not 
		// need to be tracked.

		if(this._isXDomain && module){
			this._xdOrderedReqs.push(module);

			// Add to waiting resources if it is an xdomain resource.
			// Don't add non-xdomain i18n bundles, those get evaled immediately.

			if(currentIsXDomain || uri.indexOf("/nls/") == -1){
				this._xdInFlight[module] = true;

				// Increment inFlightCount
				// This will stop the modulesLoaded from firing all the way.

				// Note: Why not set to 1?

				this._inFlightCount++;
			}

			// Start timer

			if(!this._xdTimer){
				dojo._setMethodTimeout('_xdWatchInFlight', 100); // *** 100?
			}
			this._xdStartTime = (new Date()).getTime();
		}

		if (currentIsXDomain){

			// Fix name to be a .xd.fileextension name.
			// NOTE: Why?

			var lastIndex = uri.lastIndexOf('.');
			if(lastIndex <= 0){
				lastIndex = uri.length - 1;
			}

			var xdUri = uri.substring(0, lastIndex) + ".xd";
			if(lastIndex != uri.length - 1){
				xdUri += uri.substring(lastIndex, uri.length);
			}

			xdUri = xdUri.replace("app:/", "/");

			// Append SCRIPT element

			var doc = dojo._getWin().document;
			var element = doc.createElement("script");
			element.type = "text/javascript";
			element.src = xdUri;
			if(!this._headElement){
				this._headElement = doc.getElementsByTagName("head")[0];
			}
			this._headElement.appendChild(element);
		} else {
			oldLoadUri.apply(this, arguments);
		}

		// These steps are done in the non-xd loader version of this function.
		// Maintain these steps to fit in with the existing system.

		this._loadedUrls[uri] = true;
		this._loadedUrls.push(uri);
		return true; //Boolean
	};

	dojo._xdResourceLoaded = function(/*Function*/res){

	// summary: Internal xd loader function. Called by an xd module resource when
	//it has been loaded via a script tag.
	
	// Evaluate the function with scopeArgs for multiversion support.

	res = res.apply(dojo.global, dojo._scopeArgs);

	//Work through dependencies.

	var deps = res.depends;
	var requireList = null;
	var requireAfterList = null;
	var provideList = [];
	if(deps && deps.length > 0){
		var dep = null;
		for(var i = 0; i < deps.length; i++){
			dep = deps[i];

			//Look for specific dependency indicators.
			if (dep[0] == "provide"){
				provideList.push(dep[1]);
			}else{
				if(!requireList){
					requireList = [];
				}
				if(!requireAfterList){
					requireAfterList = [];
				}

				var unpackedDeps = this._xdUnpackDependency(dep);
				if(unpackedDeps.requires){
					requireList = requireList.concat(unpackedDeps.requires);
				}
				if(unpackedDeps.requiresAfter){
					requireAfterList = requireAfterList.concat(unpackedDeps.requiresAfter);
				}
			}

			// Call the dependency indicator to allow for the normal dojo setup.
			// Only allow for one dot reference, for the i18n._preloadLocalizations calls
			// (and maybe future, one-dot things).

			var depType = dep[0];
			var objPath = depType.split(".");
			if(objPath.length == 2){
				dojo[objPath[0]][objPath[1]].apply(dojo[objPath[0]], dep.slice(1));
			}else{
				dojo[depType].apply(dojo, dep.slice(1));
			}
		}


		//If loading the debugAtAllCosts module, eval it right away since we need
		//its functions to properly load the other modules.

		if(provideList.length == 1 && provideList[0] == "dojo._base._loader.loader_debug"){
			res.defineResource(dojo);
		}else{
			//Save off the resource contents for definition later.
			var contentIndex = this._xdContents.push({
					content: res.defineResource,
					resourceName: res.resourceName,
					resourcePath: res.resourcePath,
					isDefined: false
				}) - 1;
	
			//Add provide/requires to dependency map.
			for(i = 0; i < provideList.length; i++){
				this._xdDepMap[provideList[i]] = { requires: requireList, requiresAfter: requireAfterList, contentIndex: contentIndex };
			}
		}

		// Now update the inflight status for any provided resources in this loaded resource.
		// Do this at the very end (in a *separate* for loop) to avoid shutting down the 
		// inflight timer check too soon.

		for(i = 0; i < provideList.length; i++){
			this._xdInFlight[provideList[i]] = false;
		}
	}
	};

	dojo._xdLoadFlattenedBundle = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*Object*/bundleData){

		// summary: Used when loading a flattened localized bundle via a SCRIPT element.

		locale = locale || "root";
		var jsLoc = dojo.i18n.normalizeLocale(locale).replace('-', '_');
 		var bundleResource = [moduleName, "nls", bundleName].join(".");
		var bundle = dojo.provide(bundleResource);

		bundle[jsLoc] = bundleData;
	
		// Assign the bundle for the original locale(s) we wanted.

		var mapName = [moduleName, jsLoc, bundleName].join(".");
		var bundleMap = dojo._xdBundleMap[mapName];
		var isOwnProperty = dojo.isOwnProperty;

		if(bundleMap){
			for(var param in bundleMap){
				if (isOwnProperty(bundleMap, param)) {
					bundle[param] = bundleData;
				}
			}
		}
	};

	dojo._xdInitExtraLocales = function(){

		// Simulate the extra locale work that dojo.requireLocalization does.

		var extra = dojo.config.extraLocale;
		if(extra){
			if(!dojo.isArray(extra)){
				extra = [extra];
			}

			dojo._xdReqLoc = dojo.xdRequireLocalization;
			dojo.xdRequireLocalization = function(m, b, locale, fLocales){
				dojo._xdReqLoc(m,b,locale, fLocales);
				if(locale){return;}
				for(var i=0; i<extra.length; i++){
					dojo._xdReqLoc(m,b,extra[i], fLocales);
				}
			};
		}
	};

	dojo._xdBundleMap = {};

	dojo.xdRequireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String*/availableFlatLocales){
		// summary: Internal xd loader function. The xd version of dojo.requireLocalization.
	
		// Account for allowing multiple extra locales. Do this here inside the function
		// since dojo._xdInitExtraLocales() depends on djConfig being set up, but that only
		// happens after hostenv_browser runs. loader_xd has to come before hostenv_browser
		// though since hostenv_browser can do a dojo.require for the debug module.

		// NOTE: Review this

		if(dojo._xdInitExtraLocales){
			dojo._xdInitExtraLocales();
			dojo._xdInitExtraLocales = null;
			dojo.xdRequireLocalization.apply(dojo, arguments);
			return;
		}

		var locales = availableFlatLocales.split(",");
	
		//Find the best-match locale to load.
		//Assumes dojo.i18n has already been loaded. This is true for xdomain builds,
		//since it is included in dojo.xd.js.

		var jsLoc = dojo.i18n.normalizeLocale(locale);

		var bestLocale = "";
		for(var i = 0; i < locales.length; i++){

			//Locale must match from start of string.

			if(!jsLoc.indexOf(locales[i])){
				if(locales[i].length > bestLocale.length){
					bestLocale = locales[i];
				}
			}
		}

		var fixedBestLocale = bestLocale.replace('-', '_');

		//See if the bundle we are going to use is already loaded.

 		var bundleResource = dojo.getObject([moduleName, "nls", bundleName].join("."));
		if (bundleResource && bundleResource[fixedBestLocale] && this.bundle) {
			this.bundle[jsLoc.replace('-', '_')] = bundleResource[fixedBestLocale];
		} else {

			// Need to remember what locale we wanted and which one we actually use.
			// Then when we load the one we are actually using, use that bundle for the one
			// we originally wanted.

			var mapName = [moduleName, (fixedBestLocale||"root"), bundleName].join(".");
			var bundleMap = dojo._xdBundleMap[mapName];
			if(!bundleMap){
				bundleMap = dojo._xdBundleMap[mapName] = {};
			}
			bundleMap[jsLoc.replace('-', '_')] = true;
		
			//Do just a normal dojo.require so the resource tracking stuff works as usual.
			dojo.require(moduleName + ".nls" + (bestLocale ? "." + bestLocale : "") + "." + bundleName);
		}
	};

	// Replace dojo.requireLocalization with a wrapper

	dojo._xdRealRequireLocalization = dojo.requireLocalization;

	dojo.requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale, /*String*/availableFlatLocales){

		// summary: Loads a bundle intelligently based on whether the module is 
		// local or xd. Overrides the local-case implementation.
    
		var modulePath = this.moduleUrl(moduleName).toString();
		if (this._xdIsXDomainPath(modulePath)) {

			// Call cross-domain loader

			return dojo.xdRequireLocalization.apply(dojo, arguments);
		} else {

		        // Call local loader

	        	return dojo._xdRealRequireLocalization.apply(dojo, arguments);
		}	
	};

	// This is a bit brittle: it has to know about the dojo methods that deal with dependencies
	// It would be ideal to intercept the actual methods and do something fancy at that point,
	// but I have concern about knowing which provide to match to the dependency in that case,
	// since scripts can load whenever they want, and trigger new calls to dojo._xdResourceLoaded().

	dojo._xdUnpackDependency = function(/*Array*/dep){
		//summary: Determines what to do with a dependency
		//that was listed in an xd version of a module contents.

		var newDeps = null;
		var newAfterDeps = null;
		switch(dep[0]){
		case "requireIf":
		case "requireAfterIf":
			//First arg (dep[1]) is the test. Depedency is dep[2].
			if(dep[1] === true){
				newDeps = [{name: dep[2], content: null}];
			}
			break;
		case "platformRequire":
			var modMap = dep[1];
			var common = modMap.common||[];
			newDeps = (modMap[dojo.hostenv.name_]) ? common.concat(modMap[dojo.hostenv.name_]||[]) : common.concat(modMap["default"]||[]);	
			//Flatten the array of arrays into a one-level deep array.
			//Each result could be an array of 3 elements  (the 3 arguments to dojo.require).
			//We only need the first one.
			if(newDeps){
				for(var i = 0; i < newDeps.length; i++){
					if(dojo.isArray(newDeps[i])){
						newDeps[i] = {name: newDeps[i][0], content: null};
					}else{
						newDeps[i] = {name: newDeps[i], content: null};
					}
				}
			}
			break;
		case "require":
			//Just worry about dep[1]
			newDeps = [{name: dep[1], content: null}];
			break;
		case "i18n._preloadLocalizations":

			// We can eval these immediately, since they load i18n bundles.
			// Since i18n bundles have no dependencies, whenever they are loaded
			// in a script tag, they are evaluated immediately, so we do not have to
			// treat them has an explicit dependency for the dependency mapping.
			// We can call it immediately since dojo.i18n is part of dojo.xd.js.

			dojo.i18n._preloadLocalizations.apply(dojo.i18n._preloadLocalizations, dep.slice(1));
			break;
		}

		//The requireIf and requireAfterIf needs to be evaluated after the current resource is evaluated.
		if(dep[0] == "requireAfterIf" || dep[0] == "requireIf"){
			newAfterDeps = newDeps;
			newDeps = null;
		}
		return {requires: newDeps, requiresAfter: newAfterDeps}; //Object
	};

	dojo._xdWalkReqs = function(){

		//summary: Walks the requires and evaluates module resource contents in
		//the right order.
		var reqChain = null;
		var req;
		for(var i = 0; i < this._xdOrderedReqs.length; i++){
			req = this._xdOrderedReqs[i];
			if(this._xdDepMap[req]){
				reqChain = [req];
				reqChain[req] = true; //Allow for fast lookup of the req in the array
				this._xdEvalReqs(reqChain);
			}
		}
	};

	dojo._xdEvalReqs = function(/*Array*/reqChain){

		// summary: Internal xd loader function. 
		// Does a depth first, breadth second search and eval of required modules.

		while(reqChain.length > 0){
			var req = reqChain[reqChain.length - 1];
			var res = this._xdDepMap[req];
			var i, reqs, nextReq;
			if(res){

				//Trace down any requires for this resource.
				//START dojo._xdTraceReqs() inlining for small Safari 2.0 call stack

				reqs = res.requires;
				if(reqs && reqs.length > 0){
					for(i = 0; i < reqs.length; i++){
						nextReq = reqs[i].name;
						if(nextReq && !reqChain[nextReq]){
							//New req depedency. Follow it down.
							reqChain.push(nextReq);
							reqChain[nextReq] = true;
							this._xdEvalReqs(reqChain);
						}
					}
				}
				//END dojo._xdTraceReqs() inlining for small Safari 2.0 call stack

				//Evaluate the resource.

				var contents = this._xdContents[res.contentIndex];
				if(!contents.isDefined){
					var content = contents.content;
					content.resourceName = contents.resourceName;
					content.resourcePath = contents.resourcePath;
					this._xdDefList.push(content);
					contents.isDefined = true;
				}
				this._xdDepMap[req] = null;

				//Trace down any requireAfters for this resource.
				//START dojo._xdTraceReqs() inlining for small Safari 2.0 call stack

				reqs = res.requiresAfter;
				if(reqs && reqs.length > 0){
					for(i = 0; i < reqs.length; i++){
						nextReq = reqs[i].name;
						if(nextReq && !reqChain[nextReq]){
							//New req depedency. Follow it down.
							reqChain.push(nextReq);
							reqChain[nextReq] = true;
							this._xdEvalReqs(reqChain);
						}
					}
				}
				//END dojo._xdTraceReqs() inlining for small Safari 2.0 call stack
			}

			//Done with that require. Remove it and go to the next one.

			reqChain.pop();
		}
	};

	dojo._xdClearInterval = function(){
		//summary: Internal xd loader function.
		//Clears the interval timer used to check on the
		//status of in-flight xd module resource requests.
	
		// NOTE: What sets this interval (and using what object?)

		this._getWin().clearInterval(this._xdTimer);
		this._xdTimer = 0;
	};

	dojo._xdWatchInFlight = function(){
		// summary: Monitors in-flight requests for xd module resources.

		var noLoads = "";
		var waitInterval = (this.config.xdWaitSeconds || 15) * 1000;
		var expired = (this._xdStartTime + waitInterval) < (new Date()).getTime();

		// If any xdInFlight are true, then still waiting for something to load.
		// Come back later. If we timed out, report the things that did not load.

		for(var param in this._xdInFlight){
			if(this._xdInFlight[param] === true){
				if(expired){
					noLoads += param + " ";
				}else{
					return;
				}
			}
		}

		// All done. Clean up and notify.

		this._xdClearInterval();

		if(expired){
			throw new Error("Could not load cross-domain resources: " + noLoads);
		}

		this._xdWalkReqs();
	
		var defLength = this._xdDefList.length;
		for(var i= 0; i < defLength; i++){
			var content = dojo._xdDefList[i];
			if(dojo.config.debugAtAllCosts && content.resourceName){
				if(!this._xdDebugQueue){
					this._xdDebugQueue = [];
				}
				this._xdDebugQueue.push({resourceName: content.resourceName, resourcePath: content.resourcePath});
			}else{

				// Evaluate the resource to bring it into being.
				// Pass in scope args to allow multiple versions of modules in a page.

				content.apply(dojo.global, dojo._scopeArgs);
			}
		}

		// Clean up for the next round of xd loading.

		this._xdReset();

		if(this._xdDebugQueue && this._xdDebugQueue.length > 0){
			this._xdDebugFileLoaded();
		}else{
			this._xdNotifyLoaded();
		}
	};

     	dojo._xdNotifyLoaded = function(){

		//Clear in-flight count so we will finally do finish work.

		this._inFlightCount = 0; 
	
		//Only trigger call loaded if dj_load_init has run.

		if(this._initFired && !this._loadNotifying){ 
			this._callLoaded();
		}
	};
})();