/* 
	params: 
		hostenvType: 
			we expect to have hostenvType defined, but we provide "browser" if
			it's not defined.
		dependencies:
			an Array of strings in the form normally accepted by
			dojo.hostenv.loadModule("..."), although it is acceptable to
			include the whole loadModule("...") call.
*/

djConfig = {
	baseRelativePath: "../",
	// isDebug: true
};

dependencies = [
	"dojo.event.*"
];

load("../src/bootstrap1.js");
load("../src/hostenv_rhino.js");
load("../src/bootstrap2.js");

// print(dojo.hostenv.name_);

if(!this["hostenvType"]){
	hostenvType = "browser";
}

dojo.hostenv.name_ = hostenvType;

// over-write dj_eval to prevent actual loading of subsequent files
dj_eval = function(){ return true; }
old_load = load;
load = function(uri){
	try{
		var text = readText(uri);
		// print(text);
		var requires = dojo.hostenv.getDepsForEval(text);
		var provides = dojo.hostenv.getProvidesForEval(text);
		// print("provides: "+provides.join(";"));
		eval(provides.join(";"));
		// print("requires: "+requires.join(";"));
		eval(requires.join(";"));
		dojo.hostenv.loadedUris.push(uri);
		dojo.hostenv.loadedUris[uri] = true;
	}catch(e){ 
		print(e);
	}
	return true;
}

dojo.hostenv.getProvidesForEval = function(contents){
	if(!contents){ contents = ""; }
	// check to see if we need to load anything else first. Ugg.
	var mods = [];
	var tmp = contents.match( /dojo.hostenv.startPackage\(.*?\)/mg );
	if(tmp){
		for(var x=0; x<tmp.length; x++){ mods.push(tmp[x]); }
	}
	tmp = contents.match( /dojo.hostenv.provide\((.*?)\)/mg );
	if(tmp){
		for(var x=0; x<tmp.length; x++){ mods.push(tmp[x]); }
	}
	return mods;
}

for(var x=0; x<dependencies.length; x++){
	try{
		var dep = dependencies[x];
		if(dep.indexOf("(") != -1){
			dep = dojo.hostenv.getDepsForEval(dep)[0];
		}
		dojo.hostenv.loadModule(dep);
	}catch(e){
		print(e);
	}
}

print("URIs, in order: ");
for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
	print("\t"+dojo.hostenv.loadedUris[x]);
}
