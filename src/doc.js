dojo.provide("dojo.doc");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");
dojo.require("dojo.rpc.JotService");
dojo.require("dojo.dom");

/*
 * TODO:
 *
 * Package summary needs to compensate for "is"
 * Handle host environments
 * Deal with dojo.widget weirdness
 * Parse parameters
 * Limit function parameters to only the valid ones (Involves packing parameters onto meta during rewriting)
 * Package display page
 *
 */

dojo.doc._count = 0;
dojo.doc._keys = {};
dojo.doc._myKeys = [];
dojo.doc._callbacks = {function_names: []};
dojo.doc._cache = {}; // Saves the JSON objects in cache
dojo.doc._rpc = new dojo.rpc.JotService;
dojo.doc._rpc.serviceUrl = "http://dojotoolkit.org/~pottedmeat/dojo/docscripts/jsonrpc.php";

dojo.lang.mixin(dojo.doc, {
	functionNames: function(/*mixed*/ selectKey, /*Function*/ callback){
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
	},
	_functionNames: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		// summary: Converts the stored JSON object into a sorted list of packages
		// and functions
		dojo.debug("_functionNames()");
		var searchData = [];
		for(var key in data){
			// Add the package if it doesn't exist in its children
			if(!dojo.lang.inArray(data[key], key)){
				var aKey = key;
				if(aKey.charAt(aKey.length - 1) == "_"){
					aKey = [aKey.substring(0, aKey.length - 1), "*"].join("");
				}
				searchData.push([aKey, aKey]);
			}
			// Add the functions
			for(var pkg_key in data[key]){
				var aKey = data[key][pkg_key];
				if(aKey.charAt(aKey.length - 1) == "_"){
					aKey = [aKey.substring(0, aKey.length - 1), "*"].join("");
				}
				searchData.push([aKey, aKey]);
			}
		}

		searchData = searchData.sort(dojo.doc._sort);

		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, searchData, evt);
		}
	},
	getMeta: function(/*mixed*/ selectKey, /*Function*/ callback, /*Function*/ name, /*String?*/ id){
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
	},
	_getMeta: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_getMeta(" + evt.name + ") has package: " + evt.pkg + " with: " + type);
		if("load" == type && evt.pkg){
			evt.type = "meta";
			dojo.doc._buildCache(evt);
		}else{
			if(evt.callbacks && evt.callbacks.length){
				evt.callbacks.shift()("error", {}, evt);
			}
		}
	},
	getSrc: function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name, /*String?*/ id){
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
	},
	_getSrc: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_getSrc()");
		if(evt.pkg){	
			evt.type = "src";
			dojo.doc._buildCache(evt);
		}else{
			if(evt.callbacks && evt.callbacks.length){
				evt.callbacks.shift()("error", {}, evt);
			}
		}
	},
	getFnDoc: function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name, /*String?*/ id){
		// summary: Gets external documentation stored on Jot for a given function
		dojo.debug("getFnDoc()");
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
		dojo.doc.functionPackage(dojo.doc._getFnDoc, input);
	},
	getPkgDoc: function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name){
		// summary: Gets external documentation stored on Jot for a given package
		dojo.debug("getPkgDoc()");
		if(!selectKey){
			selectKey = ++dojo.doc._count;
		}
		dojo.doc._buildCache({
			type: "pkgdoc",
			callbacks: [callback],
			name: name,
			selectKey: selectKey
		});
	},
	_getFnDoc: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_getFnDoc(" + evt.pkg + "/" + evt.name + ")");

		dojo.doc._keys[evt.selectKey] = {count: 0};
		var search = {};
		search.forFormName = "DocFnForm";
		search.limit = 1;

		if(!evt.id){
			search.filter = "it/DocFnForm/require = '" + evt.pkg + "' and it/DocFnForm/name = '" + evt.name + "' and not(it/DocFnForm/id)";
		}else{
			search.filter = "it/DocFnForm/require = '" + evt.pkg + "' and it/DocFnForm/name = '" + evt.name + "' and it/DocFnForm/id = '" + evt.id + "'";
		}
		dojo.debug(dojo.json.serialize(search));
	
		dojo.doc._rpc.callRemote("search", search).addCallbacks(function(data){ evt.type = "fn"; dojo.doc._gotFnDoc("load", data.list[0], evt); }, function(data){ evt.type = "fn"; dojo.doc._gotFnDoc("error", {}, evt); });
	
		search.forFormName = "DocParamForm";

		if(!evt.id){
			search.filter = "it/DocParamForm/fns = '" + evt.pkg + "=>" + evt.name + "'";
		}else{
			search.filter = "it/DocParamForm/fns = '" + evt.pkg + "=>" + evt.name + "=>" + evt.id + "'";
		}
		delete search.limit;

		dojo.doc._rpc.callRemote("search", search).addCallbacks(function(data){ evt.type = "param"; dojo.doc._gotFnDoc("load", data.list, evt); }, function(data){ evt.type = "param"; dojo.doc._gotFnDoc("error", {}, evt); });
	},
	_gotFnDoc: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_gotFnDoc(" + evt.type + ") for " + evt.selectKey);
		dojo.doc._keys[evt.selectKey][evt.type] = data;
		if(++dojo.doc._keys[evt.selectKey].count == 2){
			dojo.debug("_gotFnDoc() finished");
			var keys = dojo.doc._keys[evt.selectKey];
			var description = '';
			if(!keys.fn){
				keys.fn = {}
			}
			if(keys.fn["main/text"]){
				description = dojo.doc._getMainText(keys.fn["main/text"]);
				if(!description){
					description = keys.fn["main/text"];
				}			
			}
			data = {
				description: description,
				returns: keys.fn["DocFnForm/returns"],
				id: keys.fn["DocFnForm/id"],
				parameters: {},
				variables: []
			}
			for(var i = 0, param; param = keys["param"][i]; i++){
				data.parameters[param["DocParamForm/name"]] = {
					description: param["DocParamForm/desc"]
				};
			}

			delete dojo.doc._keys[evt.selectKey];
		
			if(evt.callbacks && evt.callbacks.length){
				evt.callbacks.shift()("load", data, evt);
			}
		}
	},
	_getMainText: function(/*String*/ text){
		// summary: Grabs the innerHTML from a Jot Rech Text node
		dojo.debug("_getMainText()");
		var reText = /^<[^<]+>(.*)<[^<]+>$/;
		if(reText.test(text)){
			return reText.exec(text)[1].replace(/<[^<]+\/>/g, "");
		}
		return "";
	},
	getPkgMeta: function(/*mixed*/ selectKey, /*Function*/ callback, /*String*/ name){
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
	},
	_getPkgMeta: function(/*Object*/ input){
		dojo.debug("_getPkgMeta(" + input.name + ")");
		input.type = "pkgmeta";
		dojo.doc._buildCache(input);
	},
	_onDocSearch: function(/*Object*/ input){
		input.name = input.name.replace("*", "_");
		dojo.debug("_onDocSearch(" + input.name + ")");
		if(!input.name){
			return;
		}
		if(!input.selectKey){
			input.selectKey = ++dojo.doc._count;
		}
		input.callbacks = [dojo.doc._onDocSearchFn];
		input.name = input.name.toLowerCase();
		input.type = "function_names";

		dojo.doc._buildCache(input);
	},
	_onDocSearchFn: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_onDocSearchFn(" + evt.name + ")");

		var packages = [];
		pkgLoop:
		for(var pkg in data){
			if(pkg == evt.name){
				dojo.debug("_onDocSearchFn found a package");
				dojo.doc._onDocSelectPackage(evt);
				return;
			}
			for(var i = 0, fn; fn = data[pkg][i]; i++){
				if(fn.toLowerCase().indexOf(evt.name) != -1){
					// Build a list of all packages that need to be loaded and their loaded state.
					packages.push(pkg);
					continue pkgLoop;
				}
			}
		}
		dojo.debug("_onDocSearchFn found a function");

		evt.pkgs = packages;
		evt.pkg = evt.name;
		evt.loaded = 0;
		for(var i = 0, pkg; pkg = packages[i]; i++){
			dojo.doc.getPkgMeta(evt, dojo.doc._onDocResults, pkg);
		}
	},
	_onPkgResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_onPkgResults(" + evt.type + ")");
		var key = evt.selectKey;
		var description = "";
		var methods = {};
		var requires = {};
		if(typeof key == "object"){
			key[evt.type] = data;
			for(var i = 0, expect; expect = key.expects[i]; i++){
				if(!(expect in key)){
					dojo.debug("_onPkgResults() waiting for more data");
					return;
				}
			}
			description = key["pkgdoc"];
			methods = key["pkgmeta"]["methods"];
			requires = key["pkgmeta"]["requires"];
			key = key.selectKey;
		}
		var pkg = evt.name.replace("_", "*");
		var results = {
			description: description,
			size: 0,
			fns: [],
			pkg: pkg,
			selectKey: key,
			requires: requires
		}
		var rePrivate = /_[^.]+$/;
		for(var method in methods){
			if(!rePrivate.test(method)){
				for(var pId in methods[method]){
					results.fns.push({
						pkg: pkg,
						name: method,
						id: pId,
						summary: methods[method][pId].summary
					})
				}
			}
		}
		results.size = results.fns.length;
		dojo.doc._printPkgResults(results);
	},
	_onDocResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		var message = {};
		var key = evt.selectKey;
		if(typeof key == "object"){
			message = key;
			key = key.selectKey;
		}
		
		dojo.debug("_onDocResults(" + evt.name + "/" + message.pkg + ") " + type);
		++message.loaded;

		if(message.loaded == message.pkgs.length){
			var pkgs = message.pkgs;
			var name = message.pkg;
			var results = {selectKey: key, docResults: []};
			var rePrivate = /_[^.]+$/;
			data = dojo.doc._cache;

			for(var i = 0, pkg; pkg = pkgs[i]; i++){
				if(!data[pkg]){
					continue;
				}
				for(var fn in data[pkg]["meta"]["methods"]){
					if(fn.toLowerCase().indexOf(name) == -1){
						continue;
					}
					if(fn != "requires" && !rePrivate.test(fn)){
						for(var pId in data[pkg]["meta"]["methods"][fn]){
							var result = {
								pkg: pkg,
								name: fn,
								summary: ""
							}
							if(data[pkg]["meta"]["methods"][fn][pId].summary){
								result.summary = data[pkg]["meta"]["methods"][fn][pId].summary;
							}
							results.docResults.push(result);
						}
					}
				}
			}

			dojo.debug("Publishing docResults");
			dojo.doc._printFnResults(results);
		}
	},
	_printFnResults: function(results){
		dojo.debug("_printFnResults(): called");
		// summary: Call this function to send the /doc/function/results topic
	},
	_printPkgResults: function(results){
		dojo.debug("_printPkgResults(): called");
	},
	_onDocSelectFunction: function(/*Object*/ input){
		// summary: Get doc, meta, and src
		var name = input.name;
		var selectKey = selectKey;
		dojo.debug("_onDocSelectFunction(" + name + ")");
		if(!name){
			return false;
		}
		if(!selectKey){
			selectKey = ++dojo.doc._count;
		}

		dojo.doc._keys[selectKey] = {size: 0};
		dojo.doc._myKeys[++dojo.doc._count] = {selectKey: selectKey, type: "meta"}
		dojo.doc.getMeta(dojo.doc._count, dojo.doc._onDocSelectResults, name);
		dojo.doc._myKeys[++dojo.doc._count] = {selectKey: selectKey, type: "doc"}
		dojo.doc.getFnDoc(dojo.doc._count, dojo.doc._onDocSelectResults, name);
	},
	_onDocSelectPackage: function(/*Object*/ input){
		dojo.debug("_onDocSelectPackage(" + input.name + ")")
		input.expects = ["pkgmeta", "pkgdoc"];
		dojo.doc.getPkgMeta(input, dojo.doc._onPkgResults, input.name);
		dojo.doc.getPkgDoc(input, dojo.doc._onPkgResults, input.name);
	},
	_onDocSelectResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("dojo.doc._onDocSelectResults(" + evt.type + ", " + evt.name + ")");
		var myKey = dojo.doc._myKeys[evt.selectKey];
		dojo.doc._keys[myKey.selectKey][myKey.type] = data;
		dojo.doc._keys[myKey.selectKey].size;
		if(++dojo.doc._keys[myKey.selectKey].size == 2){
			var key = dojo.lang.mixin(evt, dojo.doc._keys[myKey.selectKey]);
			delete key.size;
			dojo.debug("Publishing docFunctionDetail");
			dojo.doc._printFunctionDetail(key);
			delete dojo.doc._keys[myKey.selectKey];
			delete dojo.doc._myKeys[evt.selectKey];
		}
	},
	
	_printFunctionDetail: function(results) {
		// summary: Call this function to send the /doc/functionDetail topic event
	},

	_buildCache: function(/*Object*/ input){
		dojo.debug("_buildCache(" + input.type + ")");
		// Get stuff from the input object
		var type = input.type;
		var pkg = input.pkg;
		var callbacks = input.callbacks;
		var id = input.id;
		if(!id){
			id = "_";
		}
		var name = input.name;
		
		// Stuff to pass to io.bind
		var url = "";
		var load = null;
		var error = null;
		var mimetype = "text/json";
		
		// Stuff to pass to RPC
		var search = {};
	
		if(type == "pkgdoc"){
			try{
				var cached = dojo.doc._cache[name]["doc"];
			}catch(e){}

			if(cached){
				callbacks.shift()("load", dojo.doc._cache[name]["doc"], input);
				return;
			}

			search.forFormName = "DocPkgForm";
			search.limit = 1;
			search.filter = "it/DocPkgForm/require = '" + name + "'";
			
			load = function(data){
				var description = "";
				var list = data.list;
				if(list && list.length && list[0]["main/text"]){
					description = dojo.doc._getMainText(list[0]["main/text"]);
					dojo.doc._cache[name]["doc"] = description;
				}

				if(callbacks && callbacks.length){
					callbacks.shift()("load", description, input);
				}
			}
			error = function(data){
				if(evt.callbacks && evt.callbacks.length){
					evt.callbacks.shift()("error", "", evt);
				}
			}
		}else if(type == "function_names"){
			if(!dojo.doc._cache["function_names"]){
				dojo.debug("_buildCache() new cache");
				if(callbacks && callbacks.length){
					dojo.doc._callbacks.function_names.push([input, callbacks.shift()]);
				}
				dojo.doc._cache["function_names"] = {loading: true};
				url = "json/function_names";
				load = function(type, data, evt){
					dojo.doc._cache["function_names"] = data;
					while(dojo.doc._callbacks.function_names.length){
						var parts = dojo.doc._callbacks.function_names.pop();
						parts[1]("load", data, parts[0]);
					}
				}
				error = function(type, data, evt){
					while(dojo.doc._callbacks.function_names.length){
						var parts = dojo.doc._callbacks.function_names.pop();
						parts[1]("load", {}, parts[0]);
					}
				}
			}else if(dojo.doc._cache["function_names"].loading){
				dojo.debug("_buildCache() loading cache, adding to callback list");
				if(callbacks && callbacks.length){
					dojo.doc._callbacks.function_names.push([input, callbacks.shift()]);
				}
				return;
			}else{
				dojo.debug("_buildCache() loading from cache");
				if(callbacks && callbacks.length){
					callbacks.shift()("load", dojo.doc._cache["function_names"], input);
				}
				return;
			}
		}else if(type == "meta" || type == "src"){
			if(!pkg){
				if(type == "meta"){
					dojo.doc.functionPackage(dojo.doc._getMeta, input);
					return;
				}else{
					dojo.doc.functionPackage(dojo.doc._getSrc, input);
					return;
				}
			}else{
				try{
					var cached = dojo.doc._cache[pkg][name][id][type];
				}catch(e){}

				if(cached){
					if(callbacks && callbacks.length){
						callbacks.shift()("load", cached, input);
						return;
					}
				}

				dojo.debug("Finding " + type + " for: " + pkg + ", function: " + name + ", id: " + id);

				if(type == "src"){
					mimetype = "text/plain"
				}
				url = "json/" + pkg + "/" + name + "/" + id + "/" + type;
				load = function(type, data, evt, args){
					var input = args.input;
					var pkg = input.pkg;
					var type = input.type;
					var id = input.id;
					var name = input.name;
					var cache = dojo.doc._cache;
					dojo.debug("_buildCache() loaded " + type);

					if(!data){
						data = {};
					}
					if(!cache[pkg]){
						dojo.doc._cache[pkg] = {};
					}
					if(!cache[pkg][name]){
						dojo.doc._cache[pkg][name] = {};
					}
					if(!cache[pkg][name][id]){
						dojo.doc._cache[pkg][name][id] = {};
					}
					if(!cache[pkg][name][id][type]){
						dojo.doc._cache[pkg][name][id][type] = {};
					}
					dojo.doc._cache[pkg][name][id][type] = data;
					if(callbacks && callbacks.length){
						callbacks.shift()("load", data, args.input);
					}
				}
				error = function(type, data, evt, args){
					var input = args.input;
					var pkg = input.pkg;
					var type = input.type;
					var callbacks = input.callbacks;
					var id = input.id;
					var name = input.name;

					if(callbacks && callbacks.length){
						if(!data){
							data = {};
						}
						if(!dojo.doc._cache[pkg]){
							dojo.doc._cache[pkg] = {};
						}
						if(!dojo.doc._cache[pkg][name]){
							dojo.doc._cache[pkg][name] = {};
						}
						if(type == "meta"){
							data.sig = dojo.doc._cache[pkg][name][id].sig;
							data.params = dojo.doc._cache[pkg][name][id].params;
						}
						callbacks.shift()("error", data, args.input);
					}
				}
			}
		}else if(type == "pkgmeta"){
			try{
				var cached = dojo.doc._cache[name]["meta"];
			}catch(e){}

			if(cached){
				if(callbacks && callbacks.length){
					callbacks.shift()("load", cached, input);
					return;
				}
			}

			dojo.debug("Finding package meta for: " + name);

			url = "json/" + name + "/meta";
			load = function(type, data, evt, args){
				var pkg = args.input.name;
				var cache = dojo.doc._cache;

				dojo.debug("_buildCache() loaded for: " + pkg);
				if(!cache[pkg]){
					cache[pkg] = {};
				}
			
				if(!cache[pkg]["meta"]){
					cache[pkg]["meta"] = {};
				}
				if(!cache[pkg]["meta"]["methods"]){
					cache[pkg]["meta"]["methods"] = {};
				}
			
				var methods = data.methods;
				if(methods){
					for(var method in methods){
						if (method == "is") {
							continue;
						}
						for(var pId in methods[method]){
							if(!cache[pkg]["meta"]["methods"][method]){
								cache[pkg]["meta"]["methods"][method] = {};
							}
							if(!cache[pkg]["meta"]["methods"][method][pId]){
								cache[pkg]["meta"]["methods"][method][pId] = {};
							}
							cache[pkg]["meta"]["methods"][method][pId].summary = methods[method][pId];
						}
					}
				}

				var requires = data.requires;
				if(requires){
					cache[pkg]["meta"].requires = requires;
				}
				if(callbacks && callbacks.length){
					callbacks.shift()("load", cache[pkg]["meta"], input);
				}
			}
			error = function(type, data, evt, args){
				var callbacks = args.input.callbacks;
				if(callbacks && callbacks.length){
					callbacks.shift()("error", {}, args.input);
				}
			}
		}
		
		if(url){
			dojo.io.bind({
				url: url,
				input: input,
				mimetype: mimetype,
				error: error,
				load: load
			});
		}else{
			dojo.doc._rpc.callRemote("search", search).addCallbacks(load, error);
		}
	},

	selectFunction: function(/*String*/ name, /*String?*/ id){
		// summary: The combined information
	},

	savePackage: function(/*String*/ name, /*String*/ description){
		dojo.doc._rpc.callRemote(
			"saveForm",
			{
				form: "DocPkgForm",
				path: "/WikiHome/DojoDotDoc/id",
				pname1: "main/text",
				pvalue1: "Test"
			}
		).addCallbacks(dojo.doc._results, dojo.doc._results);
	},
	functionPackage: function(/*Function*/ callback, /*Object*/ input){
		// Summary: Gets the package associated with a function and stores it in the .pkg value of input
		dojo.debug("functionPackage() name: " + input.name + " for type: " + input.type);
		input.type = "function_names";
		input.callbacks.unshift(callback);
		input.callbacks.unshift(dojo.doc._functionPackage);
		dojo.doc._buildCache(input);
	},
	_functionPackage: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_functionPackage() name: " + evt.name + " for: " + evt.type + " with: " + type);
		evt.pkg = '';

		var data = dojo.doc._cache['function_names'];
		for(var key in data){
			if(dojo.lang.inArray(data[key], evt.name)){
				evt.pkg = key;
				break;
			}
		}

		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, data[key], evt);
		}
	},
	setUserName: function(/*String*/ name){
		dojo.doc._userName = name;
	},
	setPassword: function(/*String*/ password){
		dojo.doc._password = password;
	},
	_sort: function(a, b){
		if(a[0] < b[0]){
			return -1;
		}
		if(a[0] > b[0]){
			return 1;
		}
	  return 0;
	}
});

dojo.event.topic.subscribe("/doc/search", dojo.doc, "_onDocSearch");
dojo.event.topic.subscribe("/doc/function/select", dojo.doc, "_onDocSelectFunction");
dojo.event.topic.subscribe("/doc/package/select", dojo.doc, "_onDocSelectPackage");

dojo.event.topic.registerPublisher("/doc/function/results", dojo.doc, "_printFnResults");
dojo.event.topic.registerPublisher("/doc/package/results", dojo.doc, "_printPkgResults");
dojo.event.topic.registerPublisher("/doc/function/detail", dojo.doc, "_printFunctionDetail");