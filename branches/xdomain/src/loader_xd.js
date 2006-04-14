
//This flag indicates where or not we have crossed into xdomain territory. Once any package says
//it is cross domain, then the rest of the packages have to be treated as xdomain because we need
//to evaluate packages in order. If there is a xdomain package followed by a xhr package, we can't load
//the xhr package until the one before it finishes loading.
dojo.hostenv.isXDomain = false;

dojo.hostenv.xdInFlight = {};
dojo.hostenv.xdPackages = new Array();

dojo.hostenv.createXdPackage = function(contents){
	//TODO: Implement.
}

dojo.hostenv.loadPath = function(relpath, module /*optional*/, cb /*optional*/){
	//Only do getBaseScriptUri if path does not start with a URL with a protocol.
	//If there is a colon before the first / then, we have a URL with a protocol.
	var colonIndex = relpath.indexOf(":");
	var slashIndex = relpath.indexOf("/");
	var uri;
	var currentIsXDomain = false;
	if(colonIndex > 0 && colonIndex < slashIndex){
		uri = relPath;
		this.isXDomain = currentIsXDomain = true;
	}else{
		uri = this.getBaseScriptUri() + relpath;
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
		return;
	}

	//Add the module (package) to the list of modules.
	if(this.isXDomain){
		//Curious: is this array going to get whacked with multiple access since scripts
		//load asynchronously and may be accessing the array at the same time?
		this.xdPackages.push({name: module, contents: null});
	}

	if (currentIsXDomain){
		//Add to waiting packages. 
		this.xdInFlight[module] = true;
		
		//Increment inFlightCount
		//This will stop the modulesLoaded from firing all the way.
		this.inFlightCount++;
				
		//Start timer
		if(!this.xdTimer){
			this.xdTimer = setInterval("dojo.hostenv.watchInFlightXDomain();", 100);
		}
		
		//Add to script src
		var element = document.createElement("script");
		element.type = "text/javascript";
		element.src = uri;
		if(!this.headElement){
			this.headElement = document.getElementsByTagName("head")[0];
		}
		this.headElement.appendChild(element);
	}else{
		var contents = this.getText(uri, null, true);
		if(contents == null){ return 0; }
		
		if(this.isXDomain){
			var package = this.createXdPackage(contents);
			this.packageLoaded(package);
		}else{
			var value = dj_eval(contents);
		}
	}

	//These steps are done in the non-xd loader version of this function.
	//Maintain these steps to fit in with the existing system.
	this.loadedUris[uri] = true;
	return 1;
}

dojo.hostenv.packageLoaded = function(package){
	var deps = package.depends;
	if(deps && deps.length > 0){
		var dep, provide;
		var provideList = new Array();
		var attachedPackage = false;
		for(var i = 0; i < deps.length; i++){
			dep = deps[i];
			if(dep[0] == "provide"){
				provide = dep[1];
			}

			//XD: TODO: How to know to push the dependencies before this
			//  provide?
			dojo[dep[0]].apply(dojo, splice[1,xxx]);
			
			//Indicate package is not in flight anymore.
			//Do this step last to avoid triggering the loaded
			//notification too early.
			if(provide){
				this.xdInFlight[provide] = false;
				provideList.push(provide);
				provide = null;
			}
			
			//Find the first provide in the xdPackages list (the winner).
			var winner = 9999;
			var currentProvide;
			for(var i = 0; i < this.provideList.length; i++){
				currentProvide = this.provideList[i];
				for(var j = 0; j < this.xdPackages.length && j < winner; j++){
					if(this.xdPackages[j].name == currentProvide){
						winner = j;
						break;
					}
				}
			}
			
			//Attach the package code to the winning entry.
			if(winner < this.xdPackages.length){
				this.xdPackages[winner].content = package.definePackage;
			}else{
				dojo.raise("Winning package is outside of range of xdPackages: " + winner);
			}
			
			//Now update the inflight status for any provided packages in this loaded package.
			//Do this at the very end to avoid issues with the inflight timer check.
			for(var i = 0; i < this.provideList.length; i++){
				this.xdInFlight[this.provideList[i]] = true;
			}
		}
	}
}

dojo.hostenv.watchInFlightXDomain = function(){
	//If any are true, then still waiting.
	//Come back later.
	for(var param in this.xdInFlight){
		if(this.xdInFlight[param]){
			return;
		}
	}

	//All done loading. Clean up and notify that we are loaded.
	clearInterval(this.xdTimer);
	this.xdTimer = null;
	
	//Evaluate all the packages to bring them into being.
	//Pass dojo in so that later, to support multiple versions of dojo
	//in a page, we can pass which version of dojo to use.
	for(var i = 0; i < this.xdPackages.length; i++){
		if(this.xdPackages[i].content){
			this.xdPackages[i].content(dojo);
		}
	}

	//Clear inflight count so we will finally do finish work.
	this.inFlightCount = 0; 
	this.finishedLoad();
}
