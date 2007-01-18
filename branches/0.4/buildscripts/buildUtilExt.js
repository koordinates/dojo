load('buildUtil.js');

buildUtil.isDebug = false;

buildUtil.debug = function() {
	if (!buildUtil.isDebug) return;
	var s = [];
	for (var i = 0; i < arguments.length; i++) {
		s.push(arguments[i]);
	}
	print(s.join(" "));
}

buildUtil.copyArray = function(source, dest) {
	for (var i = 0 ; i < source.length; i++) {
		dest.push(source[i]);
	}
}

// return a new array containg (a - b)
buildUtil.subtractArray = function(a, b) {

	var list = [];
	// hash all items in b for faster lookups
	var bHash = {};
	for (var i = 0; i < b.length; i++) {
		bHash[b[i]] = true;
	}
	
	for (var i = 0; i < a.length; i++) {
		if (!bHash[a[i]]) {
			list.push(a[i]);
		}
	}
	return list;
}


// TODO :  detect cyclic dependencies and throw an error
buildUtil.getParentDeps = function(profiles, name) {
	
	var deps = [];

	var profileDepNames = profiles[name].profileDeps || [];
	for (var i = 0 ; i < profileDepNames.length; i++) {
		var profileDepName = profileDepNames[i];
		
		var profileDep = profiles[profileDepName];

		// add the profile's dependencies
		buildUtil.copyArray(profileDep.dependencies, deps);

		//buildUtil.debug('getParentDeps', profileDepName, profileDep.dependencies.join(", "));

		// traverse up the tree, to add its parent's deps
		var parentDeps = buildUtil.getParentDeps(profiles, profileDepName);

		buildUtil.copyArray(parentDeps, deps);
		
	}

	return deps;
}

buildUtil.getDepsExcludingParentDeps = function(profiles, name) {

	var profile = profiles[name];

	buildUtil.debug('myDeps:', profile.dependencies.join(", "), '\n'); 

	var myIncludes = buildUtil.getDependencyList(profile.dependencies);
	buildUtil.debug('myIncludes:', myIncludes.join(", "), '\n');
	
	var parentDeps = buildUtil.getParentDeps(profiles, name);
	
	buildUtil.debug('parentDeps', parentDeps.join(", "), '\n');
	
	if (parentDeps.length > 0) {
		var parentIncludes = buildUtil.getDependencyList(parentDeps);
		buildUtil.debug('parentIncludes', parentIncludes.join(', '), '\n');
		return buildUtil.subtractArray(myIncludes, parentIncludes);
	}
	else {
		return myIncludes;
	}
	
}

buildUtil.printDepsExcludingParentDeps = function(profiles, name) {
	print(buildUtil.getDepsExcludingParentDeps(profiles, name).join("\n"));
}