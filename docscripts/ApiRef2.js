var ApiRef = {
	_debug : false,

	_showFunctionsInTree : false,				// set to true to show individual function entries in the fucntion tree
												//	NOTE: setting this to true makes building the tree VERY slow
	_maxTreeNodes : 40,							// maximum number of top-level tree nodes to output (useful when _showFunctionsInTree is true)
	
	skipProtected : false,		// set to false to show protected variables

	// initialize the data structures we'll be building below

	functionList : [],

	// HACK: initialize any wierd values in the source data below to make things work
	functionMap : {
	
			// make the dojo object first, since the load order is indeterminate and a package may be loaded before dojo
			dojo 							: {	type: "package",	pkgName : "dojo",		ref : "dojo"	},
			"dojo.io.cometd"	 			: { type: "package",	pkgName : "dojo.io",	ref : "dojo.io.cometd" },
			"cometd" 						: { type: "package",	pkgName : "dojo.io",	ref : "dojo.io.cometd" },
			"cometd.callbackPollTransport"	: { type: "method",		pkgName : "dojo.io",	ref : "dojo.io.cometd", 		dontPromote:true},
			"cometd.iframeTransport"		: { type: "method",		pkgName : "dojo.io",	ref : "dojo.io.cometd", 		dontPromote:true},
			"cometd.longPollTransport"		: { type: "method",		pkgName : "dojo.io",	ref : "dojo.io.cometd", 		dontPromote:true},
			"cometd.mimeReplaceTransport"	: { type: "method",		pkgName : "dojo.io",	ref : "dojo.io.cometd", 		dontPromote:true},
			"dojo.widget.a11y"				: { type: "package",	pkgName : "dojo.widget",ref : "dojo.widget.Checkbox"}
//			"dojo.widget.html.loader"		: { type: "method",		pkgName : "dojo.io",	ref : "dojo.io.cometd", dontPromote:true}
	},

	// items here will be skipped from the tree entirely
	skipItems : {
		"dojo.widget.html.loader":true,
		"cometd.callbackPollTransport":true
	},


	pkgDataCache : {},
	
	init : function() {
		// set up debugging and profiling, based on cookie values
		//	use the debug menu to turn this on and off
		this._debug = (dojo.io.cookie.getCookie("ApiRef_debug") == "true")
		if (this._debug) dojo.debug("ApiRef.debugging is on (use debug menu to change).");

		this._profile = (dojo.io.cookie.getCookie("ApiRef_profile") == "true");
		this._autoDebugProfile = (this._profile && this._debug);
		if (this._profile) dojo.debug("ApiRef.profiling is on (use debug menu to change).");
		
		// load the list of functions and start everything going when that's done
		this.functionNameLoader = dojo.docs.require("function_names");
		this.functionNameLoader.callback = function(data){ApiRef.initObjectTree(data)};
	},
	

	getPkgData : function(pkgName) {
		return this.pkgDataCache[pkgName];
	},

	cachePkgData : function(pkgName, data) {
		this.pkgDataCache[pkgName] = data;
	},
	
	loadPkgData : function(pkgName, callback) {
		var pkgData = this.getPkgData(pkgName);
		if (pkgData == null) {
			var deferred = dojo.docs.require(pkgName);
			var cacheCallback = function(pkgData) {
				ApiRef.cachePkgData(pkgName, pkgData);
			}
			deferred.addCallback(cacheCallback)
			deferred.addCallback(callback);
		} else {
			callback(pkgData);
		}

	},
	
	showReference : function(name) {
		var pkgName = this.getItemPackageName(name);
		if (pkgName == null) {
			return dojo.debug("ApiRef.showReference("+name+"): can't find package");
		}
		if (this._debug) dojo.debug("ApiRef.showReference("+name+","+pkgName+")");

		var callback = function(pkgData) {
			ApiRef.showReferenceCallback(name, pkgName);
		}
		this.loadPkgData(pkgName, callback);
	},
	
	showReferenceCallback : function (name, pkgName) {
		var item = this.getItem(name);
		if (this._debug) dojo.debug("ApiRef.showReferenceCallback("+name+","+pkgName+"): looks like a " + item.type);

		var itemData = this.getItemData(name);

		var output;
		switch (item.type) {
			case "package":
				output = this.outputPackage(itemData, name);
				break;
				
			case "class":
				output = this.outputClass(itemData, name)
				break;
				
			case "method":
				output = this.outputMethod(itemData, name);
				break;
		}
		this.setContent(output);

		dojo.io.cookie.setCookie("ApiRef_lastItem", name, -1);
		dojo.io.cookie.setCookie("ApiRef_lastPkg", pkgName, -1);
		dojo.byId("searchBox").value = name;
	},
	
	getItem : function(name) {
		return this.functionMap[name];
	},

	getItemType : function(name) {
		// summary: Return the display type for this item.
		//	returns: "package", "class" or "method"
		
		return this.getItem(name).type;
	},
	
	getItemPackageName : function(name) {
		var item = this.getItem(name);
		return (item ? item.pkgName : null);
	},

	getItemReferenceName : function(name) {
		var item = this.getItem(name);
		return (item ? item.ref : null);
	},
	
	getItemLeafName : function(name) {
		name = name.split(".");
		return name[name.length - 1];
	},
	
	getItemParentName : function(name) {
		name = name.split(".");
		return name.slice(0, name.length - 1).join(".");
	},
	
	getItemData : function(name) {
		if (this.functionMap[name].data) return this.functionMap[name].data;

		var item = this.getItem(name),
			pkgData = this.getPkgData(item.pkgName)
		;
		if (pkgData == null) throw("Couldn't get package for "+pkgName+" ("+name+":"+ref+")");

		var data = this._getItemData(name, item.type, item.ref, item.pkgName, pkgData);
//		if (data == null) {
//			data = this._getItemData(ref, refItem);
//		}
		
		this.functionMap[name].data = data;
		return data;
	},

	_getItemData : function(name, type, ref, pkgName, pkgData) {
		if (this._debug) dojo.debug("_getItemData(",name, type, ref, pkgName, pkgData,")");

		if (type == "package") {
			if (ref != pkgName && pkgData[ref]) {
				//dojo.debug("getting pkg contents"+ref);
				pkgData = pkgData[ref];
			}
			return pkgData;
		}

		// get the class
///		var className = (type == "class" ? name : ref);//this.getItemParentName(name));
		var classData = this._getClassData(ref, pkgData);
		if (classData == null) {
			classData = this._getClassData(name, pkgData);	
		}
		
		if (type == "class") {
			return classData;
		}

		// method
		return this._getMethodData(name, classData);
	},
	
	_getClassData : function (name, data) {
		return data[name];
	},
	
	_getMethodData : function(name, data) {
		if (data == null) return null;
		if (data.meta) data = data.meta;
		var method = data.functions[name];
		if (method && method._) method = method._;
		if (method && method.meta) method = method.meta;
		return method;	
	},

	
	setContent : function(html, add) {
		var el = dojo.byId("content");
		if (add == true) {
			el.innerHTML += html;
		} else {
			el.innerHTML = "<span id='contentTop'></span>" + html;
		}
		dojo.html.scrollIntoView(dojo.byId("contentTop"));
	},

	onToggleClass : function(className, el) {
		var classData = this.getItemData(className);
		if (classData == null) {
			return dojo.debug("onToggleClass("+className+"): can't load class data");	
		}
	
		if (el.className == "itemLinkCollapsed") {
			el.className = "itemLinkExpanded";
			this.wipeReplace("class-"+className, this.outputClassDetails(classData, className), 200, 500);
		} else {
			el.className = "itemLinkCollapsed";
			this.wipeReplace("class-"+className, this.outputClassSummary(classData, className), 500, 200);
		}
	},

	
	onToggleMethod : function(methodName, el) {
		var methodData = this.getItemData(methodName);
		if (methodData == null) {
			return dojo.debug("onToggleMethod("+methodName+"): can't load method data");	
		}
	
		if (el.className == "itemLinkCollapsed") {
			el.className = "itemLinkExpanded";
			this.wipeReplace("method-"+methodName, this.outputMethodDetails(methodData, methodName), 200, 500);
		} else {
			el.className = "itemLinkCollapsed";
			this.wipeReplace("method-"+methodName, this.outputMethodSummary(methodData, methodName), 500, 200);
		}
	},

	wipeReplace : function(node, newHtml, outTime, inTime) {
		node = dojo.byId(node);
		var replaceCallback = function() {
			node.innerHTML = newHtml;
		}
		var wipeOut = dojo.lfx.wipeOut(node, outTime, null, replaceCallback);
		var wipeIn = dojo.lfx.wipeIn(node, inTime);
		dojo.lfx.chain(wipeOut, wipeIn).play();
	},

	
	outputPackage : function(pkgData, packageName) {
		var output = [];
		output.push("<div class='packageHeader'>Package:", packageName, "</div>");
		output.push("<div class='packageContainer'>");
		for (var className in pkgData) {
			var classObj = pkgData[className];
			output.push(this.outputClass(classObj, className));
		}
		output.push("</div>");	// packageContainer
		return output.join("\n");
	},
	
	outputClass : function(classObj, className, showDetails) {
		showDetails = (showDetails != false);
		
		var output = [];
		if (className != "meta") {
			if (showDetails) {
				output.push("<div class='classHeader'>Class: ", className, "</div>");			
			} else {
				output.push("<div class='classHeader'>", this.outputItemLink(className, "onToggleClass('"+className+"',this)", "itemLinkCollapsed classLink"), "</div>");
			}
		}
		output.push("<div id='class-", className, "' class='classContainer'>");
		if (showDetails) {
			output.push(this.outputClassDetails(classObj, className));
		}
		output.push("</div>");	// classContainer
		return output.join("");
	},
	
	outputClassSummary : function(classObj, className) {
		return "";
	},

	outputClassDetails : function(classObj, className) {
		var output = [];

		try {
			var requires = classObj.meta.requires.common;
			if (requires) {
				output.push("<div class='classLabel'>Requires:</div>");
				output.push("<div class='requiresContainer'>");
				var requiresOutput = [];
				for (var i = 0; i < requires.length; i++) {
					requiresOutput.push(this.outputItemLink(requires[i]));
				}
				output.push(requiresOutput.join(", "));
				output.push("</div>");
			}
		} catch (e) {}

		// output the "protovariables"
		try {
			var protoVars = classObj.meta.functions[className]._.meta.protovariables;
			if (protoVars) {
				// split the vars into props and event handlers
				var propList = this.filterParams(protoVars, function(name) {return name.indexOf("on") != 0});
				var handlerList = this.filterParams(protoVars, function(name) {return name.indexOf("on") == 0});
			
				// if both are present, write them in a table next to each other
				var bothPresent = (propList != null && handlerList != null);
				if (bothPresent) output.push("<table class='classParamTable'><tr><td class='classParamTableCell'>");

				if (propList) {
					output.push("<div class='classLabel'>Instance Variables:</div>");
					output.push(this.outputParameters(protoVars, propList));
				}
				if (bothPresent) output.push("</td><td valign=top>");
				
				if (handlerList) {
					output.push("<div class='classLabel'>Event Handlers:</div>");
					output.push(this.outputParameters(protoVars, handlerList));					
				}

				if (bothPresent) {
					output.push("</td></tr></table>");
				}
			}
		} catch (e) {}

		//TODO: do a filter for constructor, so we avoid writing 
		//	the methods header if no non-constructor methods

		// output the constructor first
		try {
			var constructor = classObj.meta.functions[className]._.meta;
			if (constructor) {
				output.push("<div class='classLabel'>Constructor:</div>");
				output.push(this.outputMethod(constructor, className));
			}
		} catch (e) {
//			output.push(className, ": No constructor</div>");
		}

		// output the methods
		try {
//dojo.debug(className,"co:",classObj);
			var methods = classObj.functions || classObj.meta.functions;
			var wroteAMethod = false;
			if (methods != null) {
				output.push("<div class='classLabel'>Methods:</div>");
				// sort the methodNames
				var names = [];
				for (var methodName in methods) {
					names.push(methodName);
				}
				names.sort(this._caseInsensitiveSort);

				// now output all the methods
				for (var i = 0, len = names.length; i < len; i++) {
					var methodName = names[i];
					if (methodName == className) continue;
	
//dojo.debug(methodName, methods[methodName]);
					var method = methods[methodName]._.meta;
					output.push(this.outputMethod(method, methodName));
					wroteAMethod = true;
				}
				if (!wroteAMethod) {
					output.push("<div class='emptyMethods'>(No methods)</div>");
				}
			}
		} catch (e) {
			output.push("<div class='emptyMethods'>(No methods)</div>");
		}
		return output.join("");
	},
	
	outputMethod : function(methodData, methodName) {
		if (methodData == null) {
			dojo.debug("ApiRef.outputMethod("+methodName+"): method data is null");
			return "";
		}

		var shortName = methodName.split(".");
		shortName = shortName[shortName.length - 1];
		var isProtected = (shortName.indexOf("_") == 0);
		if (isProtected && this.skipProtected) {
			if (this._debug) dojo.debug("skipping protected method " + methodName);
			return "";
		}

		var output = [];
		output.push("<div class=methodHeader>");
		output.push(this.outputItemLink(methodName, "onToggleMethod('"+methodName+"',this)", "itemLinkCollapsed"), "(");
		if (methodData.parameters) {
			var paramOutput = [];
			for (var paramName in methodData.parameters) {
				var type = methodData.parameters[paramName].type;
				type = this.outputItemLink(type);
				if (type != null && type != "") {
					type = ["<span class=paramType>", type, "</span> "].join("");
				} else {
					type = "";
				}
				paramOutput.push(type + paramName);
			}
			output.push("<span class=paramsList>", paramOutput.join(", "),  "</span>");	
		}
		output.push(" )");
		if (methodData.returns) {
			output.push(" <i>returns</i> ", this.outputItemLink(methodData.returns));
		}

		output.push("</div>");

		output.push("<div class=methodContainer id='method-", methodName, "'>");
	
		output.push(this.outputMethodSummary(methodData, methodName));

		output.push("</div>");	// methodContainer
		return output.join("");
	},

	outputMethodSummary : function(methodData, methodName) {
		var output = [];
		if (methodData.summary) {
			output.push("<div class=methodSummary>", methodData.summary, "</div>");
		}
		return output.join("");
	},

	
	outputMethodDetails : function(methodData, methodName) {
		var output = [];
		output.push("<div class=methodDetailsContainer>");
		if (methodData.summary) {
			output.push("<div class=methodLabel>Summary:</div>", "<div class=methodSummary>", methodData.summary, "</div>");
		}

		if (methodData.description) {
			output.push("<div class=methodLabel>Description:</div>", "<div class=methodDescription>", methodData.description, "</div>");
		}

		if (methodData.parameters) {
			var params = methodData.parameters;
			output.push("<div class=methodLabel>Parameters:</div>");
			output.push(this.outputParameters(methodData.parameters));
		}

		if (methodData.src) {
			
			output.push("<div class=methodLabel>Source:</div>", "<div class=methodSource>", this.outputSrc(methodData.src), "</div>");
		}

		output.push("</div>");
		return output.join("");
	},
	

	_colorizeTargets : [
		{re:/\t/g, replacement:"    "},
		{re:/'(.*?)'/g, replacement:"<span class='sourceString'>'$1'</span>"},
		{re:/"(.*?)"/g, replacement:"<span class='sourceString'>\"$1\"</span>"},
		{re:/(dojo[\.\w]*)/g, replacement:"<span class='sourceDojoRef' onclick=\"ApiRef.showReference('$1')\">$1</span>"},
		{re:/(\W)(break|case|catch|continue|delete|do|else|false|finally|for|function|if|in|instanceof|new|return|switch|this|true|try|typeof|var|void|while|with)(?=\W)/g, replacement:"$1<span class='sourceKeyword'>$2</span>" },
		{re:/(\/\/.*)\n/g, replacement:"<span class='sourceComment'>$1</span>\n"}
	],
	outputSrc : function(src) {
		for (var i = 0; i < this._colorizeTargets.length; i++) {
			var re = this._colorizeTargets[i].re,
				replacement = this._colorizeTargets[i].replacement
			;
			src = src.replace(re, replacement);
		}
		return src;
	},
	
	
	outputParameters : function(params, filteredList) {
		var output = [];
			output.push("<div class='paramsContainer'>");
			output.push("<table class='paramTable'>");
			output.push("<tr><td class=paramHeader>Type</td><td class=paramHeader>Name</td><td class=paramHeader>Description</td></tr>");

			if (filteredList == null) {
				for (var name in params) {
					output.push(this.outputParameter(params[name], name));
				}
			} else {
				for (var i = 0; i < filteredList.length; i++) {
					var name = filteredList[i];
					output.push(this.outputParameter(params[name], name));
				}
			}
			output.push("</table></div>");
	
		return output.join("");
	},
	
	outputParameter : function(param, name) {
		var isProtected = name.indexOf("_") == 0;
		if (isProtected && this.skipProtected) {
			if (this._debug) dojo.debug("skipping protected parameter " + name);
			return;
		}

		var output = [];
		var isOptional = false;
		output.push("<tr>");
		
		var type = param.type;
		if (type) {
			var questionChar = type.indexOf("?");
			if (questionChar > 0) {
				isOptional = true;
				type = type.substring(0, questionChar);
			}
			output.push("<td class='paramType'>", this.outputItemLink(type), "</td>");
		} else {
			output.push("<td class='paramType'>&nbsp;</td>");
		}

		output.push("<td class='paramName'>",name,"</td>");

		var description = param.description;
		if (description == null) description = "&nbsp;";
		if (isOptional) description = "<span class=paramOptional>(optional)</span> " + description;
		if (isProtected) description = "<span class=paramProtected>(protected)</span> " + description;
		output.push("<td class='paramDescription'>", description, "</td>");

		output.push("</tr>");
		
		return output.join("");
	},
	
	outputItemLink : function(name, linkMethod, className, contentPrefix, contentSuffix) {
		if (name == null || typeof name != "string") return name;
		var split = name.split(".");
//		if (split.length == 1) return name;
		
		var searchName = name;
		if (split[split.length - 1] == "*") {
			searchName = this.getItemParentName(name);
		}

		if (className == null) className = "itemLink";
		if (linkMethod == null) linkMethod = "showReference('"+searchName+"')";
		
		return ["<span class=", className, " onclick=\"ApiRef.", linkMethod, "\">", 
					(contentPrefix ? contentPrefix : ""), 
					name, 
					(contentSuffix ? contentSuffix : ""), 
				"</span>"].join("");
	},
	
	
	filterParams : function (params, filter) {
		var output = [];
		for (var name in params) {
			if (filter(name) == true) output.push(name);
		}
		if (output.length == 0) return null;
		return output;
	},
	
	
	
	//
	//	event handling
	//
	searchBoxKeyPress : function(event, el) {
		if (event.which == 13) {
			setTimeout(function(){
							el.onblur();
							el.select();
						}, 0);
		}
	},
	
	
	
		
	//
	//	routines to build the tree of objects
	//
	
	
	initObjectTree : function(function_names) {
		this.function_names = function_names;
	
		ApiRef.buildObjectTree();
		
		var cookieItem = dojo.io.cookie.getCookie("ApiRef_lastItem");
		if (cookieItem != null) {
			ApiRef.showReference(cookieItem);
		} else {
			ApiRef.showReference("dojo");
		}
	},


	buildObjectTree : function() {
		this.startProfile("buildObjectTree");
		
		// create the tree and controller
		var controller = this.treeController = dojo.widget.createWidget("TreeBasicControllerV3");
		var tree = this.tree = dojo.widget.createWidget("TreeV3", {listeners: [controller.widgetId]});

		// make the map of nodes, which also figures out their types
		this.buildFunctionMap();

		// make the tree from the function map and expand it to level 1
		this.buildObjectTreeNodes();

		controller.expandToLevel(tree, 1);

		// after expanding, set things up so it'll wipe up and down when opened
		tree.toggleObj = dojo.lfx.toggle.wipe;

		var displayEl = dojo.byId("fnTreeContainer");
		displayEl.innerHTML = "";
		displayEl.appendChild(tree.domNode);
		
		this.endProfile("buildObjectTree");
	},

	buildFunctionMap : function() {
		// summary: Build the data structures from the "function_names" file needed to display things.
		// description:
		//	Populates two objects:
		//		ApiRef.functionList	: a sorted array of all of the functions the parser told us about
		//		ApiRef.functionMap	: an object listing each function, and its:
		//				.type		: "method", "class" or "package"
		//				.pkgName	: local_json file it comes from
		//				.ref	: high-level object it can be found in (ie: for 'nested classes' listed under superclass)
		this.startProfile("buildFunctionMap");

		// list items whos output is non-standard in the function_names that you want to skip


		var functions = this.function_names;
				
		for (var className in functions) {
			var fnList = functions[className];
			var leafName = this.getItemLeafName(className);

			// get the pkgName, which is the first two items of the className
			//  XXX I'm not sure this is always correct
			var pkgName = className.split(".").slice(0,2).join(".");

			// if entry ends with "_", it's a package -- strip off the "_"
			if (leafName == "_") {
				className = this.getItemParentName(className);
			}

			// add the item itself to the tree
			this._addToFunctionMap(className, className, pkgName);

			for (var i = 0; i < fnList.length; i++) {
				var fn = fnList[i];
				
				if (fn.charAt(0) == "[") {
					if (this._debug) dojo.debug("Skipping array item: " + fn);
					continue;			
				}

				this._addToFunctionMap(fn, className, pkgName);
				continue;
			}
		}
		
		this.startProfile("buildFunctionMap:sort");
		// get the full list of functions and sort them
		var fnList = this.functionList = [];
		var map = this.functionMap;
		for (var fn in map) {
			fnList.push(fn);
		}
		this.functionList.sort(this._caseInsensitiveSort);

		// now re-build the map based on the sorted list
		var sortedMap = {};
		for (var i = 0, len = fnList.length; i < len; i++) {
			sortedMap[fnList[i]] = map[fnList[i]];
		}
		this.functionMap = sortedMap;

		this.endProfile("buildFunctionMap:sort");
		
		this.endProfile("buildFunctionMap");
	},

	_caseInsensitiveSort : function(a,b) {
		var A = a.toLowerCase();
		var B = b.toLowerCase();
		if (A == B) return 0;
		if (A < B) return -1;
		return 1;
	},

	_addToFunctionMap : function(name, ref, pkgName) {
		if (name == "") return;
//???	if (this.getItem(name) != null) {return;}
		var split = name.split(".");
		for (var i = 0, len = split.length - 1; i < len; i++) {
			var parentName = split.slice(0,i+1).join(".");
			if (this.functionMap[parentName] == null) {
//dojo.debug("adding parent " +parentName);
				this.functionMap[parentName] = {
					ref : parentName,
					pkgName : pkgName,
					type : (this._looksLikeAClass(parentName) && !this.skipItems[parentName] ? "class" : "method")
				}
			} else if (this.functionMap[parentName].type == "method" && !this.functionMap[parentName].dontPromote) {
//dojo.debug("promoting parent " +parentName);
				this.functionMap[parentName].type = "package";
			}
		}
		if (this.functionMap[name] == null) {
			this.functionMap[name] = {
				ref : ref,
				pkgName : pkgName,
				type : (this._looksLikeAClass(split) ? "class" : "method")
			}
//			this.functionList.push(name);
		}
	},
	
	_looksLikeAClass : function(name) {
		if (name.constructor == String) name = name.split(".");
		var firstChar = name[name.length - 1].charAt(0);
		return (firstChar != "_" && firstChar.toLowerCase() != firstChar  && isNaN(parseInt(firstChar)));
	},

	//
	//	creating the tree of functions
	//
	//	yields:  object with properties of string (terminal) or object (nested)
	buildObjectTreeNodes : function() {
		this.startProfile("buildObjectTreeNodes");
		var fnList = this.functionList,
			fnMap = this.functionMap
		;
		
		for (var i = 0, len = fnList.length; i < len; i++) {
			var name = fnList[i],
				item = fnMap[name]
			;
			this.makeTreeNode(name, null);	
		}
		
		this.endProfile("buildObjectTreeNodes");
	},

	getTreeNode : function(fullName) {
		return this.getItem(fullName).node;
	},

	getNodeParent : function(fullName) {
		var parentName = this.getItemParentName(fullName);
		// if a top-level node, parent is the tree itself
		if (parentName == "") return this.tree;
		
		var parent = this.getTreeNode(parentName);
		if (parent) return parent;

		// if not found, build up to it
		parentName = parentName.split(".");
		var ancestorName = "";
		var parent = this.tree;
		for (var i = 0, len = parentName.length; i < len; i++) {
			ancestorName = parentName.slice(0,i+1).join(".")
//dojo.debug(ancestorName);
			var node = this.getTreeNode(ancestorName);
			if (!node) {
//dojo.debug("making parent node ",ancestorName);
				node = this.makeTreeNode(ancestorName, parent);
			}
			parent = node;
		}
		return parent;
	},

	makeTreeNode : function (fullName, parent) {
		var node = this.getTreeNode(fullName);
		if (node) return node;
		
		var title = this.getItemLeafName(fullName);

		if (parent == null) {
			parent = this.getNodeParent(fullName);
		}
		
		var mapItem = this.getItem(fullName);
		if (mapItem.type != "method") {
			if (this._debug) title = title + "<span class='tinyGray'>("+mapItem.type.charAt(0).toUpperCase() + ":" + mapItem.ref + ")</span>";
			var node = dojo.widget.createWidget("TreeNodeV3", {title:title, fullName:fullName, tree:this.tree.widgetId});
			node.toggleDuration = 250;
	//		node.toggle= "wipe";
	
			node.onHideChildren = function() {
				this.inherited("onHideChildren", arguments);
				//HACK: the wipe toggle pops the node back to full size at the end of the hide...
				this.containerNode.style.display = "none";	
			}
			
			node.viewFocus = function() {
				dojo.widget.TreeNodeV3.prototype.viewFocus.apply(this, arguments);
				if (ApiRef._debug) dojo.debug("viewFocus on " + this.fullName);
				ApiRef.showReference(this.fullName);
			}
	
			parent.addChild(node);
			
	
			this.functionMap[fullName].node = node;
			this.functionMap[fullName].hasNode = true;
		}
		
		return node;
	},



	
	
	
	//
	//	debug stuff
	//


	
	debugMenuAction : function(action, el) {
		eval(action);
		el.selectedIndex = 0;
	},
	
	debugMessageToggle : function() {
		this._debug = (this._debug ? false : true);
		this._autoDebugProfile = (this._profile && this._debug);
		dojo.io.cookie.setCookie("ApiRef_debug", ""+this._debug, -1);
		alert("Debugging is now " + (this._debug ? "on." : "off."));
	},
	
	debugProfileToggle : function() {
		this._profile = (this._profile ? false : true);
		this._autoDebugProfile = (this._profile && this._debug);
		dojo.io.cookie.setCookie("ApiRef_profile", ""+this._profile, -1);
		alert("Profiling is now " + (this._profile ? "on." : "off."));
	},
	
	debugFunctionNames : function() {
		this.setContent("<H2>Function Names (from local_json/function_names)</h2>"+ApiRef.objectToHtml(ApiRef.function_names, true, null));
	},

	debugKnownFunctions : function() {
		this.setContent("<H2>List of known functions:</h2>"+ApiRef.objectToHtml(this.functionList, true));
	},
	
	debugFunctionMap : function(rebuild, showFunctions) {
		if (rebuild == true) {
			this._showFunctionsInTree = (showFunctions == true);
			this.buildObjectTreeNodes(true);
		}
		var fieldList = ["type","ref","pkgName", "hasNode"]
			getRowClassFn = function(prop, item) {
				return (prop != item.ref ? "hiliteRow" : "normalRow");
			}
		this.setContent("<H2>Items shown in the object tree</h2>"+ApiRef.objectToTable(this.functionMap, fieldList, getRowClassFn));
	},
	
	debugItemData : function(itemName) {
		if (itemName == null) {
			itemName = prompt("Show data for which item?", dojo.io.cookie.getCookie("ApiRef_lastItem") || "dojo");
			if (itemName == null) return;
			dojo.io.cookie.setCookie("ApiRef_lastItem", itemName);
		}
		var pkgName = this.getItemPackageName(itemName);
		var callback = function() {
			var itemData = ApiRef.getItemData(itemName);
			var itemType = ApiRef.getItemType(itemName);
			ApiRef.setContent("<H2>Data for item '"+itemName+"' which looks like a "+itemType+"</h2>"+ApiRef.objectToHtml(itemData, true, null));	
		}
		this.loadPkgData(pkgName, callback);
	},
	
	debugPkgData : function(pkgName) {
		if (pkgName == null) {
			pkgName = prompt("Show data for which package?", dojo.io.cookie.getCookie("ApiRef_lastPkg") || "dojo");
			if (pkgName == null) return;
			dojo.io.cookie.setCookie("ApiRef_lastPkg", pkgName);
		}
		var callback = function() {
			var pkgData = ApiRef.getPkgData(pkgName);
			ApiRef.setContent("<H2>Data for package '"+pkgName+"'</h2>"+ApiRef.objectToHtml(pkgData, true, null));	
		}
		this.loadPkgData(pkgName, callback);
	},
	
	showTodo : function() {
		window.open("ApiRef_todo.html", "todo");
	}

}

dojo.addOnLoad(dojo.lang.hitch(ApiRef, ApiRef.init));


// mix in the profiling helper code
dojo.lang.mixin(ApiRef, dojo.profile.ProfileHelper);
ApiRef._profile = false;
ApiRef._autoDebugProfile = false;



/** DEBUG STUFF -- REMOVE EVENTUALLY **/

ApiRef.objectToHtml = function(/*Object*/ it, /*Boolean*/ sort) {
	return "<pre>" + ApiRef.objectToString(it, sort) + "</pre>";
}

ApiRef.objectToString = function(/*Object*/ it, /*Boolean*/ sort) {
	return ApiRef._objectToString(it, (sort != false), "");
}

ApiRef._objectToString = function(/*Object*/ it, /*Boolean*/ sort, /*String*/ indent) {
	if (it == null) return "<null>";
	
	var sortFn = function(a,b) {
		if (a == b) return 0;
		if (a == null) return -1;
		if (b == null) return 1;
		a = (""+a).toLowerCase();
		b = (""+b).toLowerCase();
		if (a < b) return -1;
		return 1;
	}

	var output = [];
	var nextIndent = indent + "   ";

	switch (it.constructor) {
		case Number:
		case Boolean:
			return ""+it;
		
		case String:
			return '"' + it.replace(/\n/g, "\\n") + '"';

		case Array:
			for (var i = 0; i < it.length; i++) {
				output.push(ApiRef._objectToString(it[i], sort, nextIndent));
			}
			if (sort) output.sort(sortFn);
			return ["[\n", nextIndent, output.join(",\n"+indent+"   "), "\n", indent, "]"].join("");
		
		case Function: 		
			return it.toString().match(/.*\)/) + " {...}";
			
		default:
			for (var prop in it) {
				output.push(prop + " : " + ApiRef._objectToString(it[prop], sort, nextIndent));
			}
			if (sort) output.sort(sortFn);
			if (output.length == 0) {
				return "{}";
			}
			return ["{\n", nextIndent, output.join(",\n" + nextIndent), "\n", indent, "}"].join("");
	}
}


ApiRef.objectToTable = function(object, outputFields, getRowClassFn) {
	var output = [];
	for (var prop in object) {
		var item = object[prop];
		var className = (getRowClassFn ? getRowClassFn(prop, item) : "normalRow");
		var itemOut = ["<tr class='", className, "'><td style='font-size:small'>", prop, " </td>"];
		for (var f = 0, flen = outputFields.length; f < flen; f++) {
			itemOut.push("<td style='font-size:small'>", item[outputFields[f]], " </td>");
		}
		itemOut.push("</tr>");
		output.push(itemOut.join(""));
	}
	
	var tableOutput = ["<table style='border-collapse:collapse' cellspacing=0 cellpadding=2 border=1>\n",
						"<tr><th style='font-size:small;text-align:left;'>Item</th>"];
	for (var f = 0, len = outputFields.length; f < flen; f++) {
		tableOutput.push("<th style='font-size:small;text-align:left;'>", outputFields[f], " </th>");
	}
	tableOutput.push("</tr>\n");
	tableOutput.push(output.join("\n"));
	tableOutput.push("\n</table>");
	return tableOutput.join("");
}