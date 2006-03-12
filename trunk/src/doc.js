dojo.provide("dojo.doc");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");
dojo.require("dojo.rpc.JotService");

/*
 * This is only BASIC functionality. It doesn't yet provide support for multiple host
 * environments nor does it call functions by ID yet.
 *
 * Also, dojo.widget is special, since it's going to check through hostenv stuff
 * to see if dojo.widget.html.whatever exists
 *
 * Widget also has some special handler functions that we might not want to publically
 * display
 *
 * Basically, if the package meta contains require statments, we need to follow them.
 */

dojo.doc.functionNames = function(/*Function*/ callback){
	// summary: Returns an ordered list of package and function names.
	dojo.doc._buildCache({
		type: "function_names",
		callbacks: [dojo.doc._functionNames, callback]
	});
}

dojo.doc._functionNames = function(/*Function*/ input){
	var searchData = dojo.doc._expandFN();
	if(input.callbacks && input.callbacks.length){
		var callback = input.callbacks.shift();
		callback.call(null, searchData);
	}
}

dojo.doc._buildCache = function(/*Object*/ input){
	dojo.debug("_buildCache() type: " + input.type);
	if(input.type == "function_names"){
		if(!dojo.doc._cache["function_names"]){
			dojo.debug("_buildCache() new cache");
			if(input.callbacks && input.callbacks.length){
				dojo.doc._callbacks.function_names.push(input.callbacks.shift());
			}
			dojo.doc._cache["function_names"] = {loading: true};
			dojo.io.bind({
				url: "json/function_names",
				mimetype: "text/json",
				attach: input,
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
						callback.call(null, evt.attach);
					}
				}
			});
		}else if(dojo.doc._cache["function_names"].loading){
			dojo.debug("_buildCache() loading cache");
			if(input.callbacks && input.callbacks.length){
				dojo.doc._callbacks.function_names.push(input.callbacks.shift());
			}
		}else{
			dojo.debug("_buildCache() from cache");
			if(input.callbacks && input.callbacks.length){
				var callback = input.callbacks.shift();
				callback.call(null, input);
			}
		}
	}else if(input.type == "meta"){
		if(input.pkg){
			dojo.debug("Finding meta for: " + input.pkg + ", function: " + input.name + ", id: " + input.id);

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
					dojo.doc._cache[evt.attach.pkg][evt.attach.name][evt.attach.file] = data;
					if(input.callbacks && input.callbacks.length){
						var callback = input.callbacks.shift();
						callback.call(null, data);
					}
				}
			});
		}else{
			dojo.doc.functionPackage(dojo.doc._getMeta, input);
		}
	}
}

dojo.doc.selectFunction = function(/*String*/ name, /*String?*/ id){
	// summary: The combined information
}

dojo.doc._results = function(){
	var i = arguments.length;
	while(i-- > 0){
		dojo.debug(dojo.json.serialize(arguments[i]));
	}
}

dojo.doc.getMeta = function(/*Function*/ callback, /*Function*/ name, /*String*/ id){
	// summary: Gets information about a function in regards to its meta data
	dojo.debug("getMeta()");
	dojo.doc._buildCache({
		type: "meta",
		callbacks: [dojo.doc._getMeta, callback],
		name: name,
		id: id
	});
}

dojo.doc._getMeta = function(/*Object*/ input){
	dojo.debug("_getMeta()");
	input.type = "meta";
	dojo.doc._buildCache(input);
}

dojo.doc.getSrc = function(/*String*/ name, /*String?*/ id){
	// summary: Gets src file (created by the doc parser)
	return dojo.doc._localData("src", name, id);
}

dojo.doc.getDoc = function(/*String*/ name, /*String?*/ id){
	// summary: Gets external documentation stored on jot
	var pkg = dojo.doc.functionPackage(name);

	var search = {};
	search.forFormName = "DocFnForm";
	search.limit = 1;
	
	if(!id){
		search.filter = "it/DocFnForm/require = '" + pkg + "' and it/DocFnForm/name = '" + name + "' and not(it/DocFnForm/id)";
	}else{
		search.filter = "it/DocFnForm/require = '" + pkg + "' and it/DocFnForm/name = '" + name + "' and it/DocFnForm/id = '" + id + "'";
	}

	dojo.doc._rpc.callRemote("search", search).addCallback(dojo.doc._results);
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
	dojo.debug("functionPackage() name: " + input.name)
	input.type = "function_names";
	input.callbacks.unshift(dojo.doc._functionPackage);
	dojo.doc._buildCache(input);
}

dojo.doc._functionPackage = function(/*Object*/ input){
	dojo.debug("_functionPackage() name: " + input.name);
	input.pkg = '';

	var data = dojo.doc._cache['function_names'];
	for(var key in data){
		if(dojo.lang.inArray(data[key], input.name)){
			input.pkg = key;
			break;
		}
	}

	if(input.callbacks && input.callbacks.length){
		var callback = input.callbacks.shift();
		callback.call(null, input);
	}
}

dojo.doc._localData = function(/*String*/ file, /*String*/ name, /*String?*/ id){
	var pkg = dojo.doc.functionPackage(name);
	if(!pkg){
		return {}; // Object
	}
}

dojo.doc._expandFN = function(){
	// summary: Expands the function names as returned from the cache
	var data = dojo.doc._cache['function_names'];
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

	return searchData.sort(dojo.doc._sort);
}

dojo.doc._sort = function(a, b){
	if(a[0] < b[0]){
		return -1;
	}
	if(a[0] > b[0]){
		return 1;
	}
  return 0
}

dojo.doc._callbacks = {function_names: []};
dojo.doc._cache = {} // Saves the JSON objects in cache
dojo.doc._docFN = dojo.event.topic.getTopic("docFN"); // The topic event for function names
dojo.doc._rpc = new dojo.rpc.JotService;
dojo.doc._rpc.serviceUrl = "http://manual.dojotoolkit.org/_/jsonrpc";
dojo.doc._rpc.user = "doc";
dojo.doc._rpc.password = "doc";