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
	isDebug: true
};

dependencies = [
	"dojo.event.*"
];

load("../src/bootstrap1.js");
load("../src/hostenv_rhino.js");
load("../src/bootstrap2.js");

print(dojo.hostenv.name_);

if(!this["hostenvType"]){
	hostenvType = "browser";
}

dojo.hostenv.name_ = hostenvType;

// over-write dj_eval to prevent actual loading of subsequent files
dj_eval = function(){ return true; }
old_load = load;
load = function(uri){
	var jf = new java.io.File(uri);
	var jfr = new java.io.FileReader(jf);
	// var cb = new java.nio.CharBuffer();
	var cb = [];
	jfr.read(cb);
	print("uri: "+uri);
	print(cb);
	for(var x=0; x<arguments.length; x++){
		print(arguments[x]);
	}
	/* try{ }catch(e){ print(e); } */
	return true;
}

print(load);

// what we do when we're at the end of the rope
onSuccess = function(){
	print("success!");
	for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
		print(dojo.hostenv.loadedUris[x]);
	}
}

dojo.hostenv.modulesLoadedListeners.push(onSuccess);

for(var x=0; x<dependencies.length; x++){
	print(dependencies[x]);
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
