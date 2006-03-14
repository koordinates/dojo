dojo.provide("dojo.doc");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");
dojo.require("dojo.rpc.JotService");

/*
 * TODO:
 *
 * Handle host environments
 * Rewrite function signatures
 * Deal with dojo.widget weirdness
 *
 */

dojo.doc._count = 0;
dojo.doc._keys = {};
dojo.doc._callbacks = {function_names: []};
dojo.doc._cache = {}; // Saves the JSON objects in cache
dojo.doc._rpc = new dojo.rpc.JotService;
dojo.doc._rpc.serviceUrl = "http://manual.dojotoolkit.org/_/jsonrpc";

dojo.doc.functionNames = function(/*mixed*/ selectKey, /*Function*/ callback){
	// summary: Returns an ordered list of package and function names.
	dojo.debug("functionNames()");
	if(!selectKey){
		selectKey = ++dojo.doc._count;
	}
	dojo.doc._buildCache({
		type: "function_names",
		callbacks: [dojo.doc._functionNames, callback],
		selectKey: selectKey
	});
}

dojo.doc._functionNames = function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
	dojo.debug("_functionNames()");
	var searchData = [];
	for(var key in data){
		// Add the package if it doesn't exist in its children
		if(!dojo.lang.inArray(data[key], key)){
			searchData.push([key, key]);
		}
		// Add the functions
		for(var pkg_key in data[key]){
			searchData.push([data[key][pkg_key], data[key][pkg_key]]);
		}
	}

	searchData = searchData.sort(dojo.doc._sort);

	if(evt.callbacks && evt.callbacks.length){
		var callback = evt.callbacks.shift();
		callback.call(null, type, searchData, evt);
	}
}

dojo.doc.getMeta = function(/*mixed*/ selectKey, /*Function*/ callback, /*Function*/ name, /*String?*/ id){
	// summary: Gets information about a function in regards to its meta data
	dojo.debug("getMeta(" + name + ")");
	if(!selectKey){
		selectKey = ++dojo.doc._count;
	}
	dojo.doc._buildCache({
		type: "meta",
		callbacks: [callback],
		name: name,
		id: id,
		selectKey: selectKey
	});
}

dojo.doc._getMeta = function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
	dojo.debug("_getMeta(" + evt.name + ")");
	if(evt.pkg){	
		evt.type = "meta";
		dojo.doc._buildCache(evt);
	}else{
		if(evt.callbacks && evt.callbacks.length){
			var callback = evt.callbacks.shift();
			callback.call(null, "error", {}, evt);
		}
	}
}

dojo.doc.getSrc = function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name, /*String?*/ id){
	// summary: Gets src file (created by the doc parser)
	dojo.debug("getSrc()");
	if(!selectKey){
		selectKey = ++dojo.doc._count;
	}	
	dojo.doc._buildCache({
		type: "src",
		callbacks: [callback],
		name: name,
		id: id,
		selectKey: selectKey
	});
}

dojo.doc._getSrc = function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
	dojo.debug("_getSrc()");
	if(evt.pkg){	
		evt.type = "src";
		dojo.doc._buildCache(evt);
	}else{
		if(evt.callbacks && evt.callbacks.length){
			var callback =  evt.callbacks.shift();
			callback.call(null, "error", {}, evt);
		}
	}
}

dojo.doc.getDoc = function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name, /*String?*/ id){
	// summary: Gets external documentation stored on jot
	dojo.debug("getDoc()");
	if(!selectKey){
		selectKey = ++dojo.doc._count;
	}
	var input = {
		type: "doc",
		callbacks: [callback],
		name: name,
		id: id,
		selectKey: selectKey
	}
	dojo.doc.functionPackage(dojo.doc._getDoc, input);
}

dojo.doc._getDoc = function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
	dojo.debug("_getDoc(" + evt.pkg + "/" + evt.name + ")");

	var search = {};
	search.forFormName = "DocFnForm";
	search.limit = 1;

	if(!evt.id){
		search.filter = "it/DocFnForm/require = '" + evt.pkg + "' and it/DocFnForm/name = '" + evt.name + "' and not(it/DocFnForm/id)";
	}else{
		search.filter = "it/DocFnForm/require = '" + evt.pkg + "' and it/DocFnForm/name = '" + evt.name + "' and it/DocFnForm/id = '" + evt.id + "'";
	}
	
	if(evt.callbacks && evt.callbacks.length){
		dojo.doc._rpc.callRemote("search", search).addCallback(function(){ dojo.doc._gotDoc(evt, arguments); });
	}
}

dojo.doc._gotDoc = function(/*Object*/ evt, /*Array*/ results){
	dojo.debug("_gotDoc()");
	if(evt.callbacks && evt.callbacks.length){
		var callback = evt.callbacks.shift();
		callback.call(null, "load", results, evt);
	}
}

dojo.doc.getPkgMeta = function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name){
	dojo.debug("getPkgMeta(" + name + ")");
	if(!selectKey){
		selectKey = ++dojo.doc._count;
	}
	dojo.doc._buildCache({
		type: "pkgmeta",
		callbacks: [callback],
		name: name,
		selectKey: selectKey
	});
}

dojo.doc._getPkgMeta = function(/*Object*/ input){
	dojo.debug("_getPkgMeta(" + input.name + ")");
	input.type = "pkgmeta";
	dojo.doc._buildCache(input);
}

// First make sure the functions have been loaded
// Look through each function to find any matches. Create an array of the matching packages
// Make sure all packages have been loaded
// Go through and return all summaries for all matching functions
dojo.doc._onDocSearch = function(/*Object*/ input){
	dojo.debug("_onDocSearch()");
	if(!input.selectKey){
		input.selectKey = ++dojo.doc._count;
	}
	input.callbacks = [dojo.doc._onDocSearchFn];
	input.name = input.name.toLowerCase();
	input.type = "function_names";

	dojo.doc._buildCache(input);
	return false;
}

dojo.doc._onDocSearchFn = function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
	dojo.debug("_onDocSearchFn(" + evt.name + ")");
	var packages = {};
	pkgLoop:
	for(var pkg in data){
		for(var i = 0, fn; fn = data[pkg][i]; i++){
			if(fn.toLowerCase().indexOf(evt.name) > -1){
				packages[pkg] = false;
				continue pkgLoop;
			}
		}
	}
	dojo.doc._keys[evt.selectKey] = packages;
	for(var pkg in packages){
		dojo.doc.getPkgMeta(evt.selectKey, dojo.doc._onDocResults, pkg);
	}
	dojo.doc._keys[evt.selectKey].pkg = evt.name;
}

dojo.doc._onDocResults = function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
	dojo.debug("_onDocResults() " + type);
	dojo.doc._keys[evt.selectKey][evt.name] = true;
	
	var done = true;
	for(var pkg in dojo.doc._keys[evt.selectKey]){
		if(!dojo.doc._keys[evt.selectKey][pkg]){
			done = false;
			break;
		}
	}
	
	if(done){
		var results = [];
		var data = dojo.doc._cache;
		var packages = dojo.doc._keys[evt.selectKey];
		var name = packages.pkg;
		
		for(var pkg in packages){
			if(packages[pkg] === true){;
				for(var fn in data[pkg]["meta"]){
					if(fn.toLowerCase().indexOf(name) == -1){
						continue;
					}
					if(fn != "requires"){
						for(var sig in data[pkg]["meta"][fn]){
							results.push({
								pkg: pkg,
								name: fn,
								summary: data[pkg]["meta"][fn][sig]
							});
						}
					}
				}
			}
		}

		dojo.event.topic.publish("docResults", [results]);
	}
}

dojo.doc._onDocSelectFunction = function(/*Object*/ input){	
}

dojo.doc._buildCache = function(/*Object*/ input){
	dojo.debug("_buildCache() type: " + input.type);
	if(input.type == "function_names"){
		if(!dojo.doc._cache["function_names"]){
			dojo.debug("_buildCache() new cache");
			if(input.callbacks && input.callbacks.length){
				dojo.doc._callbacks.function_names.push([input, input.callbacks.shift()]);
			}
			dojo.doc._cache["function_names"] = {loading: true};
			dojo.io.bind({
				url: "json/function_names",
				mimetype: "text/json",
				load: function(type, data, evt){
					for(var key in data){
						// Packages starting with _ have a parent of "dojo"
						if(key.charAt(0) == "_"){
							var new_key = "dojo" + key.substring(1, key.length);
							data[new_key] = data[key];
							delete data[key];
							key = new_key;
						}
						// Function names starting with _ have a parent of their package name
						for(var pkg_key in data[key]){
							if(data[key][pkg_key].charAt(0) == "_"){
								var new_value = key + data[key][pkg_key].substring(1, data[key][pkg_key].length);
								data[key][pkg_key] = new_value;
							}
						}
						// Save data to the cache
					}
					dojo.doc._cache['function_names'] = data;
					for(var i = 0, callback; callback = dojo.doc._callbacks.function_names[i]; i++){
						callback[1].call(null, "load", data, callback[0]);
					}
				}
			});
		}else if(dojo.doc._cache["function_names"].loading){
			dojo.debug("_buildCache() loading cache");
			if(input.callbacks && input.callbacks.length){
				dojo.doc._callbacks.function_names.push([input, input.callbacks.shift()]);
			}
		}else{
			dojo.debug("_buildCache() from cache");
			if(input.callbacks && input.callbacks.length){
				var callback = input.callbacks.shift();
				callback.call(null, "load", dojo.doc._cache["function_names"], input);
			}
		}
	}else if(input.type == "meta" || input.type == "src"){
		if(!input.pkg){
			if(input.type == "meta"){
				dojo.doc.functionPackage(dojo.doc._getMeta, input);
			}else{
				dojo.doc.functionPackage(dojo.doc._getSrc, input);
			}
		}else{
			try{
				if(input.id){
					var cached = dojo.doc._cache[input.pkg][input.name][input.id][input.type];
				}else{
					var cached = dojo.doc._cache[input.pkg][input.name][input.type];
				}
			}catch(e){}

			if(cached){
				if(input.callbacks && input.callbacks.length){
					var callback = input.callbacks.shift();
					callback.call(null, "load", data, input);
					return;
				}
			}

			dojo.debug("Finding " + input.type + " for: " + input.pkg + ", function: " + input.name + ", id: " + input.id);

			var name = input.name.replace(new RegExp('^' + input.pkg.replace(/\./g, "\\.")), "_");
			var pkg = input.pkg.replace(/^(dojo|\*)/g, "_");

			var mimetype = "text/json";
			if(input.type == "src"){
				mimetype = "text/plain"
			}

			var url;
			if(input.id){
				url = "json/" + pkg + "/" + name + "/" + input.id + "/" + input.type;
			}else{
				url = "json/" + pkg + "/" + name + "/" + input.type;		
			}

			dojo.io.bind({
				url: url,
				attach: input,
				mimetype: mimetype,
				load: function(type, data, evt){
					if(!dojo.doc._cache[evt.attach.pkg]){
						dojo.doc._cache[evt.attach.pkg] = {};
					}
					if(!dojo.doc._cache[evt.attach.pkg][evt.attach.name]){
						dojo.doc._cache[evt.attach.pkg][evt.attach.name] = {};
					}
					if(evt.attach.id){
						dojo.doc._cache[evt.attach.pkg][evt.attach.name][evt.attach.id][evt.attach.type] = data;
					}else{
						dojo.doc._cache[evt.attach.pkg][evt.attach.name][evt.attach.type] = data;
					}
					if(input.callbacks && input.callbacks.length){
						var callback = input.callbacks.shift();
						callback.call(null, "load", data, evt.attach);
					}
				}
			});
		}
	}else if(input.type == "pkgmeta"){
		try{
			var cached = dojo.doc._cache[input.name]["meta"];
		}catch(e){}

		if(cached){
			if(input.callbacks && input.callbacks.length){
				var callback = input.callbacks.shift();
				callback.call(null, "pkgmeta", {}, input);
				return;
			}
		}
			
		dojo.debug("Finding package meta for: " + input.name);

		var pkg = input.name.replace(/^(dojo|\*)/g, "_");

		dojo.io.bind({
			url: "json/" + pkg + "/meta",
			attach: input,
			mimetype: "text/json",
			load: function(type, data, evt){
				for(var key in data){
					if(key != "requires"){
						if(key.charAt(0) == "_"){
							var new_key = evt.attach.name + key.substring(1, key.length);
							data[new_key] = data[key];
							delete data[key];
							key = new_key;
						}
					}
				}
				
				if(!dojo.doc._cache[evt.attach.name]){
					dojo.doc._cache[evt.attach.name] = {};
				}
				dojo.doc._cache[evt.attach.name]["meta"] = data;
				if(input.callbacks && input.callbacks.length){
					var callback = input.callbacks.shift();
					callback.call(null, "pkgmeta", data, input);
				}
			}
		});
	}
}

dojo.doc.selectFunction = function(/*String*/ name, /*String?*/ id){
	// summary: The combined information
}



dojo.doc.savePackage = function(/*String*/ name, /*String*/ description){
	dojo.doc._rpc.callRemote(
		"saveForm",
		{
			form: "DocPkgForm",
			path: "/WikiHome/DojoDotDoc/id",
			pname1: "main/text",
			pvalue1: "Test"
		}
	).addCallback(dojo.doc._results);
}

dojo.doc.functionPackage = function(/*Function*/ callback, /*Object*/ input){
	dojo.debug("functionPackage() name: " + input.name + " for type: " + input.type);
	input.type = "function_names";
	input.callbacks.unshift(callback);
	input.callbacks.unshift(dojo.doc._functionPackage);
	dojo.doc._buildCache(input);
}

dojo.doc._functionPackage = function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
	dojo.debug("_functionPackage() name: " + evt.name);
	evt.pkg = '';

	var data = dojo.doc._cache['function_names'];
	for(var key in data){
		if(dojo.lang.inArray(data[key], evt.name)){
			evt.pkg = key;
			break;
		}
	}

	if(evt.callbacks && evt.callbacks.length){
		var callback = evt.callbacks.shift();
		callback.call(null, type, data[key], evt);
	}
}

dojo.doc._sort = function(a, b){
	if(a[0] < b[0]){
		return -1;
	}
	if(a[0] > b[0]){
		return 1;
	}
  return 0;
}

dojo.event.topic.registerPublisher("docSearch");  	
dojo.event.topic.registerPublisher("docResults");  	
dojo.event.topic.registerPublisher("docSelectFunction");  	
dojo.event.topic.registerPublisher("docFunctionDetail");

dojo.event.topic.subscribe("docSearch", dojo.doc, "_onDocSearch");
dojo.event.topic.subscribe("docSelectFunction", dojo.doc, "_onDocSelectFunction");