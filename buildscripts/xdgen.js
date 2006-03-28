djConfig = {
	baseRelativePath: "../",
	// isDebug: true
};

load("../src/bootstrap1.js");
load("../src/hostenv_rhino.js");
load("../src/bootstrap2.js");
// FIXME: is this really what we want to say?
dojo.render.html.capable = true;

dojo.hostenv.loadedUris.push("../src/bootstrap1.js");
if(!this["hostenvType"]){
	hostenvType = "browser";
}

dojo.hostenv.name_ = hostenvType;

// over-write dj_eval to prevent actual loading of subsequent files
dj_eval = function(){ return true; }
old_load = load;
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
		print(e);
	}
	return true;
}

dojo.hostenv.findDependencies = function(contents){
	if(!contents){ return null; }

	var deps = {};
	var tmp;
	RegExp.lastIndex = 0;

	//Don't support the dojo.hostenv functions since those should not
	//be called by packages directly.
	//- requireAfter = require
	//* requireAfterIf = requireIf : takes first arg: true (expression result), "common" or dojo.render[arguments[0]].capable
	//- conditionalRequire = requireIf
	//- requireAll is an array of strings
	//TODO: need to support dojo.hostenv.conditionalLoadModule: takes an object hashmap
	
	var testExp = /dojo.(require|requireIf|requireAll|provide|requireAfterIf|requireAfter)\(([\w\W]*?)\)/mg;
	while((tmp = testExp.exec(contents)) != null){
		switch(tmp[1]){
			default:
				dojo.hostenv.addXdDependency(deps, tmp[1], tmp[2]);
				break;
		}
		
	}
	return deps;
}

dojo.hostenv.addXdDependency = function(depObject, type, value){
	if(!depObject[type]){
		depObject[type] = new Array();
	}

	depObject[type].push(value);
}

var text = readText("../src/animation/Animation.js");
var deps = dojo.hostenv.findDependencies(text);

print("dojo.xdLoad({\n");
for (var x in deps){
	print("\n" + x + ": [");
	var depArray = deps[x];
	for(var i = 0; i < depArray.length; i++){
		print(depArray[i] + (i == depArray.length - 1 ? "" : ","));
	}
	print("\n],")
}
print("\ndefinePackage: function(){" + text + "\n}});");

