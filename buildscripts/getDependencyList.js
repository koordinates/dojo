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

if(!this["dependencies"]){
	dependencies = [ 
		"dojo.event.*",
		"dojo.io.*",
		"dojo.string",
		"dojo.xml.*",
		"dojo.xml.Parse",
		"dojo.widget.Parse",
		"dojo.widget.Button"
	];
}

load("../src/bootstrap1.js");
load("../src/hostenv_rhino.js");
load("../src/bootstrap2.js");
dojo.render.html.capable = true;

if(!this["hostenvType"]){
	hostenvType = "browser";
}

dojo.hostenv.loadedUris.push("../src/bootstrap1.js");
dojo.hostenv.loadedUris.push("../src/hostenv_"+hostenvType+".js");
dojo.hostenv.loadedUris.push("../src/bootstrap2.js");

if(dependencies["prefixes"]){
	var tmp = dependencies.prefixes;
	for(var x=0; x<tmp.length; x++){
		dojo.hostenv.setModulePrefix(tmp[x][0], tmp[x][1]);
	}
}

dojo.hostenv.name_ = hostenvType;

function removeComments(contents){
	// if we get the contents of the file from Rhino, it might not be a JS
	// string, but rather a Java string, which will cause the replace() method
	// to bomb.
	contents = new String((!contents) ? "" : contents);
	// clobber all comments
	contents = contents.replace( /^(.*?)\/\/(.*)$/mg , "$1");
	contents = contents.replace( /(\n)/mg , "__DOJONEWLINE");
	contents = contents.replace( /\/\*(.*?)\*\//g , "");
	return contents.replace( /__DOJONEWLINE/mg , "\n");
}

// over-write dj_eval to prevent actual loading of subsequent files
dj_eval = function(){ return true; }
old_load = load;
load = function(uri){
	try{
		var text = removeComments(readText(uri));
		var requires = dojo.hostenv.getDepsForEval(text);
		var provides = dojo.hostenv.getProvidesForEval(text);
		eval(provides.join(";"));
		eval(requires.join(";"));
		dojo.hostenv.loadedUris.push(uri);
		dojo.hostenv.loadedUris[uri] = true;
	}catch(e){ 
		print(e);
	}
	return true;
}

dojo.hostenv.getDepsForEval = function(contents){
	// FIXME: should probably memoize this!
	if(!contents){ return []; }

	// check to see if we need to load anything else first. Ugg.
	var deps = [];
	var tmp;
	var testExps = [
		/dojo.hostenv.loadModule\(.*?\)/mg,
		/dojo.hostenv.require\(.*?\)/mg,
		/dojo.require\(.*?\)/mg,
		/dojo.requireIf\([\w\W]*?\)/mg,
		/dojo.hostenv.conditionalLoadModule\([\w\W]*?\)/mg
	];
	for(var i=0; i<testExps.length; i++){
		tmp = contents.match(testExps[i]);
		if(tmp){
			for(var x=0; x<tmp.length; x++){ deps.push(tmp[x]); }
		}
	}

	return deps;
}

dojo.hostenv.getProvidesForEval = function(contents){
	if(!contents){ return []; }
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
	tmp = contents.match( /dojo.provide\((.*?)\)/mg );
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
		dojo.hostenv.loadModule(dep, null, true);
	}catch(e){
		print(e);
	}
}

// FIXME: we should also provide some way of figuring out what files are the
// test files for the namespaces which are included and provide them in the
// final package.

// FIXME: should we turn __package__.js file clobbering on? It will break things if there's a subdir rolled up into a __package__
/*
for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
	print(dojo.hostenv.loadedUris[x].substr(-14));
	if(dojo.hostenv.loadedUris[x].substr(-14) == "__package__.js"){
		dojo.hostenv.loadedUris.splice(x, 1);
		x--;
	}
}
*/

// print("URIs, in order: ");
// for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
// 	print(dojo.hostenv.loadedUris[x]);
// }

var depList = [];
var seen = {};
for(var x=0; x<dojo.hostenv.loadedUris.length; x++){
	var curi = dojo.hostenv.loadedUris[x];
	if(!seen[curi]){
		seen[curi] = true;
		depList.push(curi);
	}
}

// print(dojo.hostenv.loadedUris.join(",\n"));
print(depList.join(",\n"));
