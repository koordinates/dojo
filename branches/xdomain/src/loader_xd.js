
//TODO: what about case where we get a provide before the require for same package? Any race condition
//that would cause trouble?
//TODO: Test the __package__.js file for src/undo: it does a require then a provide.
//TODO: how will xd loading work with debugAtAllCosts?
//TODO: have a test that does a load after the fact, and has onload listeners.
//TODO: change build process so you can ask for a dojo.js that has this loader.
//TODO: test using setModulePrefix for dojo, but loading widget HTML/CSS locally.
//TODO: FATAL: bad srcObj for srcFunc: onclick in FF windows?
//TODO: make sure reset is being called, remove debugger and debug messages.
//TODO: widgets won't work fully (HTML/CSS) and also because of goofy requireIf() thing.
//TODO: a better circular dependency breaker?

dojo.hostenv.resetXd = function(){
	//This flag indicates where or not we have crossed into xdomain territory. Once any package says
	//it is cross domain, then the rest of the packages have to be treated as xdomain because we need
	//to evaluate packages in order. If there is a xdomain package followed by a xhr package, we can't load
	//the xhr package until the one before it finishes loading. The text of the xhr package will be converted
	//to match the format for a xd package and put in the xd load queue.
	//You can force all packages to be treated as xd by setting the djConfig.forceXDomain. This might
	//make debugging easier for non-xd dojo uses.
	this.isXDomain = djConfig.forceXDomain || false;
	
	//TODO: scrub these. Are they all still valid?
	this.xdTimer = 0;
	this.xdInFlight = {};
	this.xdPackages = [];
	this.xdDepMap = {};
	this.xdResolved = {};
	this.xdContents = [];
	this.xdPkgCounter = 1;
}

//Call reset immediately to set the state.
dojo.hostenv.resetXd();

dojo.hostenv.createXdPackage = function(contents){
	//Find dependencies.
	var deps = [];
    var depRegExp = /dojo.(require|requireIf|requireAll|provide|requireAfterIf|requireAfter|kwCompoundRequire|conditionalRequire|hostenv\.conditionalLoadModule|.hostenv\.loadModule|hostenv\.moduleLoaded)\(([\w\W]*?)\)/mg;
    var match;
	while((match = depRegExp.exec(contents)) != null){
		deps.push("\"" + match[1] + "\", " + match[2]);
	}

	//Create package object and the call to packageLoaded.
	var output = [];
	output.push("dojo.hostenv.packageLoaded({\n");

	//Add dependencies
	if(deps.length > 0){
		output.push("depends: [");
		for(var i = 0; i < deps.length; i++){
			if(i > 0){
				output.push(",\n");
			}
			output.push("[" + deps[i] + "]");
		}
		output.push("],");
	}

	//Add the contents of the file inside a function.
	//Pass in dojo as an argument to the function to help with
	//allowing multiple versions of dojo in a page.
	output.push("\ndefinePackage: function(dojo){");
	output.push(contents);
	output.push("\n}});");
	
	return output.join("");
}

dojo.hostenv.loadPath = function(relpath, module /*optional*/, cb /*optional*/){
	//Only do getBaseScriptUri if path does not start with a URL with a protocol.
	//If there is a colon before the first / then, we have a URL with a protocol.
	var colonIndex = relpath.indexOf(":");
	var slashIndex = relpath.indexOf("/");
	var uri;
	var currentIsXDomain = false;
	if(colonIndex > 0 && colonIndex < slashIndex){
		uri = relpath;
		this.isXDomain = currentIsXDomain = true;
	}else{
		uri = this.getBaseScriptUri() + relpath;

		//Is ithe base script URI-based URL a cross domain URL?
		colonIndex = uri.indexOf(":");
		slashIndex = uri.indexOf("/");
		if(colonIndex > 0 && colonIndex < slashIndex && (!location.host || uri.indexOf("http://" + location.host) != 0)){
			this.isXDomain = currentIsXDomain = true;
		}
	}

	if(djConfig.cacheBust && dojo.render.html.capable) { uri += "?" + String(djConfig.cacheBust).replace(/\W+/g,""); }
	try{
		return ((!module || this.isXDomain) ? this.loadUri(uri, cb, currentIsXDomain, module) : this.loadUriAndCheck(uri, module, cb));
	}catch(e){
		dojo.debug(e);
		return false;
	}
}

//Overriding loadUri for now. Wanted to override getText(), but it is used by
//the widget code in too many, synchronous ways right now. This means the xd stuff
//is not suitable for widgets yet.
dojo.hostenv.loadUri = function(uri, cb, currentIsXDomain, module){
	if(this.loadedUris[uri]){
		return 1;
	}

	//Add the module (package) to the list of modules.
	if(this.isXDomain){
		//Curious: is this array going to get whacked with multiple access since scripts
		//load asynchronously and may be accessing the array at the same time?
		this.xdPackages.push({name: module, content: null});
		
		//Add to waiting packages.
		//If this is a __package__.js file, then this must be
		//a package.* request (since xdomain can only work with the first
		//path in a package search list. However, .* module names are not
		//passed to this function, so do an adjustment here.
		if(uri.indexOf("__package__") != -1){
			module += ".*";
		}

		this.xdInFlight[module] = true;

		//Increment inFlightCount
		//This will stop the modulesLoaded from firing all the way.
		this.inFlightCount++;
				
		//Start timer
		if(!this.xdTimer){
			this.xdTimer = setInterval("dojo.hostenv.watchInFlightXDomain();", 100);
		}
		this.xdStartTime = (new Date()).getTime();
	}

	if (currentIsXDomain){
		//Fix name to be a .xd.fileextension name.
		var lastIndex = uri.lastIndexOf('.');
		if(lastIndex <= 0){
			lastIndex = uri.length - 1;
		}

		var xdUri = uri.substring(0, lastIndex) + ".xd";
		if(lastIndex != uri.length - 1){
			xdUri += uri.substring(lastIndex, uri.length);
		}

		//Add to script src
		var element = document.createElement("script");
		element.type = "text/javascript";
		element.src = xdUri;
		if(!this.headElement){
			this.headElement = document.getElementsByTagName("head")[0];
		}
		this.headElement.appendChild(element);
	}else{
		var contents = this.getText(uri, null, true);
		if(contents == null){ return 0; }
		
		if(this.isXDomain){
			var pkg = this.createXdPackage(contents);
			dj_eval(pkg);
		}else{
			var value = dj_eval(contents);
		}
	}

	//These steps are done in the non-xd loader version of this function.
	//Maintain these steps to fit in with the existing system.
	this.loadedUris[uri] = true;
	return 1;
}

dojo.hostenv.packageLoaded = function(pkg){
	var deps = pkg.depends;
	var requireList = null;
	var provideList = [];
	if(deps && deps.length > 0){
		var dep = null;
		var insertHint = 0;
		var attachedPackage = false;
		for(var i = 0; i < deps.length; i++){
			dep = deps[i];

			//Look for specific dependency indicators.
			if (dep[0] == "provide" || dep[0] == "hostenv.moduleLoaded"){
				provideList.push(dep[1]);
			}else{
				if(!requireList){
					requireList = [];
				}
				requireList = requireList.concat(this.unpackXdDependency(dep));
			}

			//Call the dependency indicator to allow for the normal dojo setup.
			//Only allow for one dot reference, for the hostenv.* type calls.
			var depType = dep[0];
			var objPath = depType.split(".");
			if(objPath.length == 2){
				dojo[objPath[0]][objPath[1]].apply(dojo[objPath[0]], dep.slice(1));
			}else{
				dojo[depType].apply(dojo, dep.slice(1));
			}
		}

		//Save off the package contents for definition later.
		var contentIndex = this.xdContents.push({content: pkg.definePackage, isDefined: false}) - 1;
		
		//Use a counter to know when this package was received. Used for circular reference breaking.
		var pkgOrder = this.xdPkgCounter++;
		
		//Add provide/requires to dependency map.
		for(var i = 0; i < provideList.length; i++){
			this.xdDepMap[provideList[i]] = { requires: requireList, contentIndex: contentIndex, pkgOrder: pkgOrder };
		}

		//Now update the inflight status for any provided packages in this loaded package.
		//Do this at the very end (in a *separate* for loop) to avoid shutting down the 
		//inflight timer check too soon.
		for(var i = 0; i < provideList.length; i++){
			this.xdInFlight[provideList[i]] = false;
		}
	}
}

//This is a bit brittle: it has to know about the dojo methods that deal with dependencies
//It would be ideal to intercept the actual methods and do something fancy at that point,
//but I have concern about knowing which provide to match to the dependency in that case,
//since scripts can load whenever they want, and trigger new calls to dojo.hostenv.packageLoaded().
dojo.hostenv.unpackXdDependency = function(dep){
	//Extract the dependency(ies).
	var newDeps = null;
	switch(dep[0]){
		case "requireIf":
		case "requireAfterIf":
		case "conditionalRequire":
			//First arg (dep[1]) is the test. Depedency is dep[2].
			if((dep[1] === true)||(dep[1]=="common")||(dep[1] && dojo.render[dep[1]].capable)){
				newDeps = [{name: dep[2], content: null}];
			}
			break;
		case "requireAll":
			//the arguments are an array, each element a call to require.
			//Get rid of first item, which is "requireAll".
			deps.shift();
			newDeps = deps;
			dojo.hostenv.flattenRequireArray(newDeps);
			break;
		case "kwCompoundRequire":
		case "hostenv.conditionalLoadModule":
			var modMap = dep[1];
			var common = modMap["common"]||[];
			var newDeps = (modMap[dojo.hostenv.name_]) ? common.concat(modMap[dojo.hostenv.name_]||[]) : common.concat(modMap["default"]||[]);	
			dojo.hostenv.flattenRequireArray(newDeps);
			break;
		case "require":
		case "requireAfter":
		case "hostenv.loadModule":
			//Just worry about dep[1]
			newDeps = [{name: dep[1], content: null}];
			break;
	}

	return newDeps;
}

//Evaluate package contents for the given provide.
dojo.hostenv.xdResolve = function(provide, pkg){
	var contents = this.xdContents[pkg.contentIndex];
	if(!contents.isDefined){
		//Evaluate the package to bring it into being.
		//Pass dojo in so that later, to support multiple versions of dojo
		//in a page, we can pass which version of dojo to use.
		contents.content(dojo);
		contents.isDefined = true;
	}

	this.xdDepMap[provide] = null;
	this.xdResolved[provide] = true;
}

//Walks the dependency map and evaluates package contents in
//the right order.
//TODO: Maybe make the circular dependency breaker better.
//Right now it just uses a simple, who was brought in last
//as the place to start, but given the async nature of loading
//this isn't a 100% guarantee. It would be better to examine the
//JS contents of each package to see if the dependencies are used
//inside or outside of functions or constructors. If used only in methods
//then it is a weak dependency, and that dependency can be evaled first.
dojo.hostenv.xdWalkMap = function(){
	while(true){
		var hasOneResolved = false;
		var hasOneUnresolved = false;
		var pkg = null;
		for(var provide in this.xdDepMap){
			pkg = this.xdDepMap[provide];
			if(pkg){
				hasOneUnresolved = true;
				if(!pkg.requires){
					//No requires. Resolve the package.
					this.xdResolve(provide, pkg);
					hasOneResolved = true;
				}else{
					//Try to prune the requires with packages that
					//are done already.
					hasOneResolved = dojo.hostenv.trimXdResolved(provide, pkg);
				}
			}
		}
		
		if(hasOneUnresolved){
			if(!hasOneResolved){
				//Find the path that has the longest depedency chain and use that
				//one to break the cycle.
				var winner = 0;
				var circBreaker = null;
				for(var provide in this.xdDepMap){
					if(this.xdDepMap[provide]){
						currentLevel = this.getXdDepLevel(provide, 0, provide);
						if(currentLevel > winner){
							circBreaker = provide;
							winner = currentLevel;
						}
					}
					/*
					var reqs = this.xdDepMap[provide].requires;
					var level = startLevel = 1;
					var currentLevel = 1;
					if(reqs){
						for(var i = 0; i < reqs.length; i++){
							if(reqs[i] != provide){
								currentLevel = this.getDepLevel(provide, startLevel, reqs[i]);
								if(currentLevel > level){
									level = currentLevel;
								}
							}
						}
					}
					*/
				}

				alert("Circular Breaker: " + circBreaker);
				this.xdResolve(circBreaker, this.xdDepMap[circBreaker]);
				
				//Remove the breaker from any requires lists.
				for(var provide in this.xdDepMap){
					pkg = this.xdDepMap[provide];
					if(pkg){
						dojo.hostenv.trimXdResolved(provide, pkg);
					}
				}
			}
		}else{
			//All done!
			return;
		}
	}
}

dojo.hostenv.trimXdResolved = function(provide, pkg){
	var hasNewResolve = false;
	for(var i = pkg.requires.length - 1; i >= 0; i--){
		if(this.xdResolved[pkg.requires[i]]){
			pkg.requires.splice(i, 1);
		}
	}
	
	if(pkg.requires.length == 0){
		this.xdResolve(provide, pkg);
		hasNewResolve = true;
	}

	return hasNewResolve;
}

dojo.hostenv.getXdDepLevel = function(provide, startLevel, currentReq){
	var level = 1;
	var reqHolder = this.xdDepMap[currentReq];
	if(reqHolder){
		var reqs = this.xdDepMap[currentReq].requires;
		var currentLevel = 0;
		if(reqs){
			for(var i = 0; i < reqs.length; i++){
				if(reqs[i] && reqs[i].name && reqs[i].name != provide && this.xdDepMap[reqs[i]]){
					currentLevel = this.getXdDepLevel(provide, startLevel, reqs[i].name);
					if(currentLevel > level){
						level = currentLevel;
					}
				}
			}
		}
	}
	return level + startLevel;
}

dojo.hostenv.clearXdInterval = function(){
	clearInterval(this.xdTimer);
	this.xdTimer = 0;
}

dojo.hostenv.watchInFlightXDomain = function(){
	//Make sure we haven't waited timed out.
	var waitInterval = djConfig.xdWaitMs || 30000;
	
	if(this.xdStartTime + waitInterval < (new Date()).getTime()){
		this.clearXdInterval();
		var noLoads = "";
		for(var param in this.xdInFlight){
			if(this.xdInFlight[param]){
				noLoads += param + " ";
			}
		}
		dojo.raise("Could not load cross-domain packages: " + noLoads);
	}

	//If any are true, then still waiting.
	//Come back later.	
	for(var param in this.xdInFlight){
		if(this.xdInFlight[param]){
			return;
		}
	}

	//All done loading. Clean up and notify that we are loaded.
	this.clearXdInterval();

	this.xdWalkMap();

	//Evaluate any packages that were not evaled before.
	//This normally shouldn't happen with proper dojo.provide and dojo.require
	//usage, but providing it just in case. Note that these may not be executed
	//in the original order that the developer intended.
	//Pass dojo in so that later, to support multiple versions of dojo
	//in a page, we can pass which version of dojo to use.
	for(var i = 0; i < this.xdContents.length; i++){
		var current = this.xdContents[i];
		if(current.content && !current.isDefined){
			current.content(dojo);
		}
	}

	//Clean up for the next round of xd loading.
	//this.resetXd();

	//Clear inflight count so we will finally do finish work.
	this.inFlightCount = 0; 
	this.finishedLoad();
}

dojo.hostenv.flattenRequireArray = function(target){
	//Each result could be an array of 3 elements  (the 3 arguments to dojo.require).
	//We only need the first one.
	if(target){
		for(var i = 0; i < target.length; i++){
			if(target[i] instanceof Array){
				target[i] = {name: target[i][0], content: null};
			}else{
				target[i] = {name: target[i], content: null};
			}
		}
	}

}
