dojo.provide("dojo.docs");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");
dojo.require("dojo.rpc.JotService");
dojo.require("dojo.dom");
dojo.require("dojo.uri.Uri");

/*
 * TODO:
 *
 * Package summary needs to compensate for "is"
 * Handle host environments
 * Deal with dojo.widget weirdness
 * Parse parameters
 * Limit function parameters to only the valid ones (Involves packing parameters onto meta during rewriting)
 *
 */

dojo.docs._count = 0;
dojo.docs._callbacks = {function_names: []};
dojo.docs._cache = {}; // Saves the JSON objects in cache
dojo.docs._url = dojo.uri.dojoUri("docscripts/json/");
dojo.docs._rpc = new dojo.rpc.JotService;
dojo.docs._rpc.serviceUrl = dojo.uri.dojoUri("docscripts/jsonrpc.php");

dojo.lang.mixin(dojo.docs, {
	functionNames: function(/*mixed*/ selectKey, /*Function*/ callback){
		// summary: Returns an ordered list of package and function names.
		dojo.debug("functionNames()");
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		
		var input = {};
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}
		
		dojo.docs._buildCache({
			type: "function_names",
			callbacks: [dojo.docs._functionNames, callback],
			selectKey: selectKey,
			input: input
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

		searchData = searchData.sort(dojo.docs._sort);

		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, searchData, evt, evt.input);
		}
	},
	getMeta: function(/*mixed*/ selectKey, /*String*/ pkg, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets information about a function in regards to its meta data
		if(typeof name == "function"){
			// pId: a
			// pkg: ignore
			id = callback;
			callback = name;
			name = pkg;
			pkg = null;
			dojo.debug("getMeta(" + name + ")");
		}else{
			dojo.debug("getMeta(" + pkg + "/" + name + ")");
		}
		
		if(!id){
			id = "_";
		}

		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input;
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}else{
			input = {};
		}

		dojo.docs._buildCache({
			type: "meta",
			callbacks: [dojo.docs._gotMeta, callback],
			pkg: pkg,
			name: name,
			id: id,
			selectKey: selectKey,
			input: input
		});
	},
	_withPkg: function(/*String*/ type, /*Object*/ data, /*Object*/ evt, /*Object*/ input, /*String*/ newType){
		dojo.debug("_withPkg(" + evt.name + ") has package: " + data[0]);
		evt.pkg = data[0];
		if("load" == type && evt.pkg){
			evt.type = newType;
			dojo.docs._buildCache(evt);
		}else{
			if(evt.callbacks && evt.callbacks.length){
				evt.callbacks.shift()("error", {}, evt, evt.input);
			}
		}
	},
	_gotMeta: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_gotMeta(" + evt.name + ")");

		var cached = dojo.docs._getCache(evt.pkg, evt.name, "meta", "methods", evt.id);
		if(cached.summary){
			data.summary = cached.summary;
		}
		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, data, evt, evt.input);
		}
	},
	getSrc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets src file (created by the doc parser)
		dojo.debug("getSrc(" + name + ")");
		if(!id){
			id = "_";
		}
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		
		var input;
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}else{
			input = {};
		}
		
		dojo.docs._buildCache({
			type: "src",
			callbacks: [callback],
			name: name,
			id: id,
			input: input,
			selectKey: selectKey
		});
	},
	getDoc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets external documentation stored on Jot for a given function
		dojo.debug("getDoc(" + name  + ")");

		if(!id){
			id = "_";
		}

		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input = {};
		if(typeof selectKey == "object" && selectKey.selectKey){
			input.input = selectKey;
			selectKey = selectKey.selectKey;
		}

		input.type = "doc";
		input.name = name;
		input.selectKey = selectKey;
		input.callbacks = [callback];
		input.selectKey = selectKey;

		dojo.docs._buildCache(input);
	},
	_gotDoc: function(/*String*/ type, /*Array*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_gotDoc(" + evt.type + ")");
		
		evt[evt.type] = data;
		if(evt.expects && evt.expects.doc){
			for(var i = 0, expect; expect = evt.expects.doc[i]; i++){
				if(!(expect in evt)){
					dojo.debug("_gotDoc() waiting for more data");
					return;
				}
			}
		}
		
		var cache = dojo.docs._getCache(evt.pkg, "meta", "methods", evt.name, evt.id, "meta");

		var description = evt.fn.description;
		cache.description = description;
		data = {
			returns: evt.fn.returns,
			id: evt.id,
			variables: [],
			selectKey: evt.selectKey
		}
		if(!cache.parameters){
			cache.parameters = {};
		}
		for(var i = 0, param; param = evt.param[i]; i++){
			var fName = param["DocParamForm/name"];
			if(!cache.parameters[fName]){
				cache.parameters[fName] = {};
			}
			cache.parameters[fName].description = param["DocParamForm/desc"]
		}

		data.description = cache.description;
		data.parameters = cache.parameters;
		
		evt.type = "doc";
	
		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()("load", data, evt, input);
		}
	},
	getPkgDoc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		// summary: Gets external documentation stored on Jot for a given package
		dojo.debug("getPkgDoc(" + name + ")");
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		dojo.docs._buildCache({
			type: "pkgdoc",
			callbacks: [callback],
			name: name,
			selectKey: selectKey
		});
	},
	getPkgInfo: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		// summary: Gets a combination of the metadata and external documentation for a given package
		dojo.debug("getPkgInfo(" + name + ")");
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input = {
			selectKey: selectKey,
			expects: {
				pkginfo: ["pkgmeta", "pkgdoc"]
			},
			callback: callback
		};
		dojo.docs.getPkgMeta(input, name, dojo.docs._getPkgInfo);
		dojo.docs.getPkgDoc(input, name, dojo.docs._getPkgInfo);
	},
	_getPkgInfo: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_getPkgInfo() for " + evt.type);
		var key = evt.selectKey;
		var input = {};
		var results = {};
		if(typeof key == "object"){
			input = key;
			key = key.selectKey;
			input[evt.type] = data;
			if(input.expects && input.expects.pkginfo){
				for(var i = 0, expect; expect = input.expects.pkginfo[i]; i++){
					if(!(expect in input)){
						dojo.debug("_getPkgInfo() waiting for more data");
						return;
					}
				}
			}
			results = input.pkgmeta;
			results.description = input.pkgdoc;
		}

		if(input.callback){
			input.callback("load", results, evt);
		}
	},
	getInfo: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		dojo.debug("getInfo(" + name + ")");
		var input = {
			expects: {
				"info": ["meta", "doc"]
			},
			selectKey: selectKey,
			callback: callback
		}
		dojo.docs.getMeta(input, name, dojo.docs._getInfo);
		dojo.docs.getDoc(input, name, dojo.docs._getInfo);
	},
	_getInfo: function(/*String*/ type, /*String*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_getInfo(" + evt.type + ")");
		if(input && input.expects && input.expects.info){
			input[evt.type] = data;
			for(var i = 0, expect; expect = input.expects.info[i]; i++){
				if(!(expect in input)){
					dojo.debug("_getInfo() waiting for more data");
					return;
				}
			}
		}

		if(input.callback){
			input.callback("load", dojo.docs._getCache(evt.pkg, "meta", "methods", evt.name, evt.id, "meta"), evt, input);
		}
	},
	_getMainText: function(/*String*/ text){
		// summary: Grabs the innerHTML from a Jot Rech Text node
		dojo.debug("_getMainText()");
		return text.replace(/^<html[^<]*>/, "").replace(/<\/html>$/, "").replace(/<\w+\s*\/>/g, "");
	},
	getPkgMeta: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		dojo.debug("getPkgMeta(" + name + ")");
		var key = selectKey;
		if(typeof key == "object"){
			key = key.selectKey;
		}else if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		dojo.docs._buildCache({
			type: "pkgmeta",
			callbacks: [callback],
			name: name,
			selectKey: selectKey
		});
	},
	_getPkgMeta: function(/*Object*/ input){
		dojo.debug("_getPkgMeta(" + input.name + ")");
		input.type = "pkgmeta";
		dojo.docs._buildCache(input);
	},
	_onDocSearch: function(/*Object*/ input){
		input.name = input.name.replace("*", "_");
		dojo.debug("_onDocSearch(" + input.name + ")");
		if(!input.name){
			return;
		}
		if(!input.selectKey){
			input.selectKey = ++dojo.docs._count;
		}
		input.callbacks = [dojo.docs._onDocSearchFn];
		input.name = input.name.toLowerCase();
		input.type = "function_names";

		dojo.docs._buildCache(input);
	},
	_onDocSearchFn: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_onDocSearchFn(" + evt.name + ")");

		var packages = [];
		pkgLoop:
		for(var pkg in data){
			if(pkg == evt.name){
				dojo.debug("_onDocSearchFn found a package");
				dojo.docs._onDocSelectPackage(evt);
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
			dojo.docs.getPkgMeta(evt, dojo.docs._onDocResults, pkg);
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
			if(key.expects && key.expects.pkgresults){
				for(var i = 0, expect; expect = key.expects.pkgresults[i]; i++){
					if(!(expect in key)){
						dojo.debug("_onPkgResults() waiting for more data");
						return;
					}
				}
			}
			description = key["pkgdoc"].description;
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
		dojo.docs._printPkgResults(results);
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
			data = dojo.docs._cache;

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
			dojo.docs._printFnResults(results);
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
		dojo.debug("_onDocSelectFunction(" + name + ")");
		if(!name){
			return false;
		}
		if(!input.selectKey){
			input.selectKey = ++dojo.docs._count;
		}
		input.expects = {
			"docresults": ["meta", "doc"]
		}
		dojo.docs.getMeta(input, dojo.docs._onDocSelectResults, name);
		dojo.docs.getDoc(input, dojo.docs._onDocSelectResults, name);
	},
	_onDocSelectPackage: function(/*Object*/ input){
		dojo.debug("_onDocSelectPackage(" + input.name + ")")
		input.expects = {
			"pkgresults": ["pkgmeta", "pkgdoc"]
		}
		dojo.docs.getPkgMeta(input, dojo.docs._onPkgResults, input.name);
		dojo.docs.getPkgDoc(input, dojo.docs._onPkgResults, input.name);
	},
	_onDocSelectResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_onDocSelectResults(" + evt.type + ", " + evt.name + ")");
		var key = evt.selectKey;
		if(typeof key == "object"){
			key[evt.type] = data;
			if(key.expects && key.expects.docresults){
				for(var i = 0, expect; expect = key.expects.docresults[i]; i++){
					if(!(expect in key)){
						dojo.debug("_onDocSelectResults() waiting for more data");
						return;
					}
				}
			}
			key = key.selectKey;
		}

		dojo.docs._printFunctionDetail(key);
	},
	
	_printFunctionDetail: function(results) {
		// summary: Call this function to send the /doc/function/detail topic event
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
			input.id = "_";
		}
		var name = input.name;
		
		// Stuff to pass to RPC
		var search = [];
	
		if(type == "doc"){
			if(!pkg){
				dojo.docs.functionPackages(input.selectKey, name, function(){ var a = arguments; dojo.docs._withPkg.call(this, a[0], a[1], a[2], a[3], "doc"); }, input);
				return;
			}else{
				var cached = dojo.docs._getCache(pkg, "meta", "methods", name, id, "meta");
			
				if(cached.description){
					callbacks.shift()("load", cached.description, input, input.input);
					return;
				}

				var aSearch = {};
				aSearch.forFormName = "DocFnForm";
				aSearch.limit = 1;

				if(!id || id == "_"){
					aSearch.filter = "it/DocFnForm/require = '" + pkg + "' and it/DocFnForm/name = '" + name + "' and not(it/DocFnForm/id)";
				}else{
					aSearch.filter = "it/DocFnForm/require = '" + pkg + "' and it/DocFnForm/name = '" + name + "' and it/DocFnForm/id = '" + id + "'";
				}

				aSearch.load = function(data){
					var cached = dojo.docs._getCache(pkg, "meta", "methods", name, id, "meta");

					var description = "";
					var returns = "";
					if(data.list && data.list.length){
						description = dojo.docs._getMainText(data.list[0]["main/text"]);
						returns = data.list[0]["DocFnForm/returns"];
					}

					cached.description  = description;
					if(!cached.returns){
						cached.returns = {};
					}
					cached.returns.summary = returns;

					input.type = "fn";
					dojo.docs._gotDoc("load", cached, input, input.input);				
				}
				aSearch.error = function(data){
					input.type = "fn";
					dojo.docs._gotDoc("error", {}, input, input.input);
				}
				search.push(aSearch);

				aSearch = {};
				aSearch.forFormName = "DocParamForm";

				if(!id || id == "_"){
					aSearch.filter = "it/DocParamForm/fns = '" + pkg + "=>" + name + "'";
				}else{
					aSearch.filter = "it/DocParamForm/fns = '" + pkg + "=>" + name + "=>" + id + "'";
				}
			
				aSearch.load = function(data){
					var cache = dojo.docs._getCache(pkg, "meta", "methods", name, id, "meta");
					for(var i = 0, param; param = data.list[i]; i++){
						var pName = param["DocParamForm/name"];
						if(!cache.parameters[pName]){
							cache.parameters[pName] = {};
						}
						cache.parameters[pName].summary = param["DocParamForm/desc"];
					}
					input.type = "param";
					dojo.docs._gotDoc("load", cache.parameters, input);
				}
				aSearch.error = function(data){
					input.type = "param";
					dojo.docs._gotDoc("error", {}, input);
				}
				search.push(aSearch);
			}
		}else if(type == "pkgdoc"){
			var cached = dojo.docs._getCache(name);

			if(cached.doc){
				callbacks.shift()("load", cached.doc, input);
				return;
			}

			var aSearch = {};
			aSearch.forFormName = "DocPkgForm";
			aSearch.limit = 1;
			aSearch.filter = "it/DocPkgForm/require = '" + name + "'";
			
			aSearch.load = function(data){
				var description = "";
				var list = data.list;
				if(list && list.length && list[0]["main/text"]){
					description = dojo.docs._getMainText(list[0]["main/text"]);
					cached.doc = description;
				}

				if(callbacks && callbacks.length){
					callbacks.shift()("load", {description: description}, input);
				}
			}
			aSearch.error = function(data){
				if(callbacks && callbacks.length){
					callbacks.shift()("error", "", input);
				}
			}
			search.push(aSearch);
		}else if(type == "function_names"){
			var cached = dojo.docs._getCache();
			if(!cached.function_names){
				dojo.debug("_buildCache() new cache");
				if(callbacks && callbacks.length){
					dojo.docs._callbacks.function_names.push([input, callbacks.shift()]);
				}
				cached.function_names = {loading: true};
				
				var aSearch = {};
				aSearch.url = "function_names";
				aSearch.load = function(type, data, evt){
					cached.function_names = data;
					while(dojo.docs._callbacks.function_names.length){
						var parts = dojo.docs._callbacks.function_names.pop();
						parts[1]("load", data, parts[0]);
					}
				}
				aSearch.error = function(type, data, evt){
					while(dojo.docs._callbacks.function_names.length){
						var parts = dojo.docs._callbacks.function_names.pop();
						parts[1]("load", {}, parts[0]);
					}
				}
				search.push(aSearch);
			}else if(cached.function_names.loading){
				dojo.debug("_buildCache() loading cache, adding to callback list");
				if(callbacks && callbacks.length){
					dojo.docs._callbacks.function_names.push([input, callbacks.shift()]);
				}
				return;
			}else{
				dojo.debug("_buildCache() loading from cache");
				if(callbacks && callbacks.length){
					callbacks.shift()("load", cached.function_names, input);
				}
				return;
			}
		}else if(type == "meta" || type == "src"){
			if(!pkg){
				if(type == "meta"){
					dojo.docs.functionPackages(input.selectKey, name, function(){ var a = arguments; dojo.docs._withPkg.call(this, a[0], a[1], a[2], a[3], "meta"); }, input);
					return;
				}else{
					dojo.docs.functionPackages(input.selectKey, name, function(){ var a = arguments; dojo.docs._withPkg.call(this, a[0], a[1], a[2], a[3], "src"); }, input);
					return;
				}
			}else{
				var cached = dojo.docs._getCache(pkg, "meta", "methods", name, id);

				if(cached[type] && cached[type].returns){
					if(callbacks && callbacks.length){
						callbacks.shift()("load", cached[type], input);
						return;
					}
				}

				dojo.debug("Finding " + type + " for: " + pkg + ", function: " + name + ", id: " + id);

				var aSearch = {};

				if(type == "src"){
					aSearch.mimetype = "text/plain"
				}
				aSearch.url = pkg + "/" + name + "/" + id + "/" + type;
				aSearch.load = function(type, data, evt){
					dojo.debug("_buildCache() loaded " + input.type);

					if(input.type == "src"){
						dojo.docs._getCache(pkg, "meta", "methods", name, id).src = data;
						if(callbacks && callbacks.length){
							callbacks.shift()("load", data, input, input.input);
						}
					}else{
						var cache = dojo.docs._getCache(pkg, "meta", "methods", name, id, "meta");
						if(!cache.parameters){
							cache.parameters = {};
						}
						for(var i = 0, param; param = data.parameters[i]; i++){
							if(!cache.parameters[param[1]]){
								cache.parameters[param[1]] = {};
							}
							cache.parameters[param[1]].type = param[0];
						}
						if(!cache.returns){
							cache.returns = {};
						}
						cache.returns.type = data.returns;
					}

					if(callbacks && callbacks.length){
						callbacks.shift()("load", cache, input, input.input);
					}
				}
				aSearch.error = function(type, data, evt){
					if(callbacks && callbacks.length){
						callbacks.shift()("error", {}, input, input.input);
					}
				}
			}

			search.push(aSearch);
		}else if(type == "pkgmeta"){
			var cached = dojo.docs._getCache(name);

			if(cached.meta){
				if(callbacks && callbacks.length){
					callbacks.shift()("load", cached.meta, input);
					return;
				}
			}

			dojo.debug("Finding package meta for: " + name);

			var aSearch = {};

			aSearch.url = name + "/meta";
			aSearch.load = function(type, data, evt){
				dojo.debug("_buildCache() loaded for: " + pkg);
		
				var methods = data.methods;
				if(methods){
					for(var method in methods){
						if (method == "is") {
							continue;
						}
						for(var pId in methods[method]){
							dojo.docs._getCache(pkg, "meta", "methods", method, pId, "meta").summary = methods[method][pId];
						}
					}
				}

				var requires = data.requires;
				var cache = dojo.docs._getCache(pkg, "meta");
				if(requires){
					cache.requires = requires;
				}
				if(callbacks && callbacks.length){
					callbacks.shift()("load", cache, input);
				}
			}
			aSearch.error = function(type, data, evt){
				if(callbacks && callbacks.length){
					callbacks.shift()("error", {}, input);
				}
			}
			search.push(aSearch);
		}
		
		for(var i = 0, aSearch; aSearch = search[i]; i++){
			var load = aSearch.load;
			var error = aSearch.error;
			delete aSearch.load;
			delete aSearch.error;
			var mimetype = aSearch.mimetype;
			if(!mimetype){
				mimetype = "text/json"
			}
			if(aSearch.url){
				dojo.io.bind({
					url: new dojo.uri.Uri(dojo.docs._url, aSearch.url),
					input: input,
					mimetype: mimetype,
					error: error,
					load: load
				});
			}else{
				dojo.docs._rpc.callRemote("search", aSearch).addCallbacks(load, error);
			}
		}
	},

	selectFunction: function(/*String*/ name, /*String?*/ id){
		// summary: The combined information
	},

	savePackage: function(/*String*/ name, /*String*/ description){
		dojo.docs._rpc.callRemote(
			"saveForm",
			{
				form: "DocPkgForm",
				path: "/WikiHome/DojoDotDoc/id",
				pname1: "main/text",
				pvalue1: "Test"
			}
		).addCallbacks(dojo.docs._results, dojo.docs._results);
	},
	functionPackages: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*Object*/ input){
		// summary: Gets the package associated with a function and stores it in the .pkg value of input
		dojo.debug("functionPackages() name: " + name);

		if(!input){
			input = {};
		}
		if(!input.callbacks){
			input.callbacks = [];
		}

		input.type = "function_names";
		input.name = name;
		input.callbacks.unshift(callback);
		input.callbacks.unshift(dojo.docs._functionPackages);
		dojo.docs._buildCache(input);
	},
	_functionPackages: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_functionPackages() name: " + evt.name);
		evt.pkg = '';

		var results = [];
		var data = dojo.docs._cache['function_names'];
		for(var key in data){
			if(dojo.lang.inArray(data[key], evt.name)){
				dojo.debug("_functionPackages() package: " + key);
				results.push(key);
			}
		}

		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, results, evt);
		}
	},
	setUserName: function(/*String*/ name){
		dojo.docs._userName = name;
	},
	setPassword: function(/*String*/ password){
		dojo.docs._password = password;
	},
	_sort: function(a, b){
		if(a[0] < b[0]){
			return -1;
		}
		if(a[0] > b[0]){
			return 1;
		}
	  return 0;
	},
	_getCache: function(/*String...*/ keys){
		var obj = dojo.docs._cache;
		for(var i = 0; i < arguments.length; i++){
			var arg = arguments[i];
			if(!obj[arg]){
				obj[arg] = {};
			}
			obj = obj[arg];
		}
		return obj;
	}
});

dojo.event.topic.subscribe("/doc/search", dojo.doc, "_onDocSearch");
dojo.event.topic.subscribe("/doc/function/select", dojo.doc, "_onDocSelectFunction");
dojo.event.topic.subscribe("/doc/package/select", dojo.doc, "_onDocSelectPackage");

dojo.event.topic.registerPublisher("/doc/function/results", dojo.doc, "_printFnResults");
dojo.event.topic.registerPublisher("/doc/package/results", dojo.doc, "_printPkgResults");
dojo.event.topic.registerPublisher("/doc/function/detail", dojo.doc, "_printFunctionDetail");