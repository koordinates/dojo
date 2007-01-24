//Define some methods that are defined in Rhino, but we need web equivalents
//in order for the build scripts to work.
print = function(message){
	dojo.debug(message);
}

readFile = function(uri){
	return dojo.hostenv.getText(uri);
}

load = function(uri){
	eval(readFile(uri));
}

//Define some overrides for the buildUtil functions.
buildUtil.getLineSeparator = function(){
	//summary: Gives the line separator for the platform.
	//For web builds override this function.
	return "\n";
}

buildUtil.getDojoLoader = function(/*Object?*/dependencies){
	//summary: gets the type of Dojo loader for the build. For example default or
	//xdomain loading. Override for web builds.
	return dependencies["loader"];
}

dojo.require("dojo.string.extras");

//Define the webbuild object.
webbuild = {
	build: function(/*String*/depString, /*String*/version, /*String*/xdDojoPath){
		depString = dojo.string.trim(depString);
		if(!depString){
			alert("Please enter some dependencies");
			return;
		}

		var dependencies;
		eval("dependencies = [" + depString + "];");
		dependencies.loader = "xdomain";
		
		var dependencyResult = buildUtil.getDependencyList(dependencies, null, true);
		var dojoResult = buildUtil.makeDojoJs(dependencyResult, version);
	
		//Print out the file list.
		dojo.debug("files in the profile:");
		for(var i = 0; i < dojoResult.resourceDependencies.length; i++){
			dojo.debug(dojoResult.resourceDependencies[i]);
		}
		
		//Return the dojo contents
		webbuild.dojoContents = dojoResult.dojoContents;

		//See if we should add in xd dojo module path.
		xdDojoPath = dojo.string.trim(xdDojoPath);
		if(xdDojoPath){
			webbuild.dojoContents = buildUtilXd.setXdDojoConfig(webbuild.dojoContents, xdDojoPath);
		}

		var outputWindow = window.open("webbuild/dojo.js.html", "dojoOutput");
		outputWindow.focus();

		//FAILED attempts:
		//Using a javascript: url, FF 2.0 wraps the content in some HTML, so not really
		//good for file save operations (get HTML in the saved file).
		//var outputWindow = window.open("javascript:opener.webbuild.getDojoContents()", "dojoOutput");

		//using data: urls seem to add funky text to the beginning of the file, at least in OSX FF 2.0
		//Same issue if application/octet-stream is used instead of text/javascript.
		//var outputWindow = window.open("data:text/javascript;" + webbuild.dojoContents, "dojoOutput");
	},
	
	getDojoContents: function(){
		return webbuild.dojoContents;
			//return "200 OK HTTP/1.0\nContent-type: text/javascript\n"
			//	+ "Content-Disposition: attachment\n\n"
			//	+ webbuild.dojoContents;
	}
}
