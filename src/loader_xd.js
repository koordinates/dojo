
//TODO: what about case where we get a provide before the require for same package? Any race condition
//that would cause trouble?
//TODO: Test the __package__.js file for src/undo: it does a require then a provide.

dojo.hostenv.resetXd = function(){
	//This flag indicates where or not we have crossed into xdomain territory. Once any package says
	//it is cross domain, then the rest of the packages have to be treated as xdomain because we need
	//to evaluate packages in order. If there is a xdomain package followed by a xhr package, we can't load
	//the xhr package until the one before it finishes loading. The text of the xhr package will be converted
	//to match the format for a xd package and put in the xd load queue.
	//You can force all packages to be treated as xd by setting the djConfig.forceXDomain. This might
	//make debugging easier for non-xd dojo uses.
	this.isXDomain = djConfig.forceXDomain || false;
	
	this.xdInFlight = {};
	this.xdPackages = new Array();
	this.xdContents = new Array();
}

//Call reset immediately to set the state.
dojo.hostenv.resetXd();

dojo.hostenv.createXdPackage = function(contents){
	//Find dependencies.
	var deps = new Array();
    var depRegExp = /dojo.(require|requireIf|requireAll|provide|requireAfterIf|requireAfter|kwCompoundRequire|conditionalRequire|hostenv\.conditionalLoadModule|.hostenv\.loadModule|hostenv\.moduleLoaded)\(([\w\W]*?)\)/mg;
    var match;
	while((match = depRegExp.exec(contents)) != null){
		deps.push("\"" + match[1] + "\", " + match[2]);
	}

	//Create package object and the call to packageLoaded.
	var output = new Array();
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
		var dep, provide = null;
		var insertHint = 0;
		var waitingDeps = new Array();
		var provideList = new Array();
		var attachedPackage = false;
		for(var i = 0; i < deps.length; i++){
			dep = deps[i];

			//Look for specific dependency indicators.
			if (dep[0] == "provide" || dep[0] == "hostenv.moduleLoaded"){
				provide = dep[1];
				provideList.push(dep[1]);
				
				//If we had some waiting dependencies, now add them
				//now that we found a provide (probably happens mostly with moduleLoaded)
				if(waitingDeps.length > 0){
					for(var i = 0; i < waitingDeps.length; i++){
						insertHint = this.addXdDependency(insertHint, waitingDeps[i], provide);
					}
					waitingDeps = new Array();
				}

				//Now that we have a new provide, we're not sure where it is in 
				//the dependency list, so reset the hint.
				insertHint = 0;
			}else{
				if(!provide){
					waitingDeps.push(dep);
				}else{
					insertHint = this.addXdDependency(insertHint, dep, provide);
				}
			}

			//Call the dependency indicator to allow for the normal dojo setup.
			//Only allow for one dot reference, for the hostenv.* type calls.
			var objPath = dep[0].split(".");
			if(objPath.length == 2){
				dojo[objPath[0]][objPath[1]].apply(dojo[objPath[0]], dep.slice[1]);
			}else{
				dojo[dep[0]].apply(dojo, dep.slice[1]);
			}
		}

		//Save off the package contents with the provider list.
		//Use this later to sequence the package contents correctly,
		//once everything is loaded.
		this.xdContents.push({provideList: provideList, content: package.definePackage});

		//Now update the inflight status for any provided packages in this loaded package.
		//Do this at the very end to avoid issues with the inflight timer check.
		for(var i = 0; i < provideList.length; i++){
			this.xdInFlight[provideList[i]] = false;
		}
	
	}
}

//This is a bit brittle: it has to know about the dojo methods that deal with dependencies
//It would be ideal to intercept the actual methods and do something fancy at that point,
//but I have concern about knowing which provide to match to the dependency in that case,
//since scripts can load whenever they want, and trigger new calls to dojo.hostenv.packageLoaded().
dojo.hostenv.addXdDependency = function(insertHint, dep, provide){
	
	if(!insertHint){
		insertHint = 0;
	}
	
	//Find the provide so that we can insert any depedencies before it.
	var provideIndex = 0;
	for(var i = insertHint; i < this.xdPackages.length; i++){
		if(this.xdPackages[i].name == provide){
			provideIndex = i;
			break;
		}
	}
	
	//This case seems unlikely, but doing it just in case:
	if(provideIndex == 0 && insertHint != 0){
		return this.addXdDependency(0, dep, provide);
	}
	
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
			newDeps = deps.slice(1);
			dojo.hostenv.flattenRequireArray(newDeps);
			break;
		case "kwCompoundRequire":
		case "hostenv.conditionalLoadModule":
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
	
	//Add the new dependencies to dependency array before the provide.
	//Add them in bulk with splice to avoid too much movement by other scripts
	//asychronously loading and calling.
	if(newDeps && newDeps.length){
		this.xdPackages.splice(provideIndex, 0, newDeps);
		provideIndex += newDeps.length;
	}

	return provideIndex;
}

dojo.hostenv.xdPositionContents = function(){
	for(var k = 0; k < this.xdContents.length; k++){
		var provideList = this.xdContents[k].provideList;
		var content = this.xdContents[k].provideList;
		
		//Find the first provide in the xdPackages list (the winner).
		//The winner gets to hold the package contents for evaluation later.
		var winner = 9999;
		var provide;
		for(var i = 0; i < provideList.length; i++){
			provide = provideList[i];
			for(var j = 0; j < this.xdPackages.length && j < winner; j++){
				if(this.xdPackages[j].name == provide){
					winner = j;
					break;
				}
			}
		}

		//Attach the package code to the winning entry.
		if(winner < this.xdPackages.length){
			this.xdPackages[winner].content = content;
		}else{
			dojo.raise("Winning package is outside of range of xdPackages: " + winner);
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

	//Make sure the package contents are sorted in the right order.
	this.xdPositionContents();

	//Evaluate all the packages to bring them into being.
	//Pass dojo in so that later, to support multiple versions of dojo
	//in a page, we can pass which version of dojo to use.
	for(var i = 0; i < this.xdPackages.length; i++){
		if(this.xdPackages[i].content){
			this.xdPackages[i].content(dojo);
		}
	}

	//Clean up for the next round of xd loading.
	this.resetXd();

	//Clear inflight count so we will finally do finish work.
	this.inFlightCount = 0; 
	this.finishedLoad();

	//TODO: Remove all addLoad listeners(?).
	//Will there be issues if as a result of calling finishLoad, if it tries to
	//load more packages, and it adds another load listener? Change the modulesLoaded method instead.
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
