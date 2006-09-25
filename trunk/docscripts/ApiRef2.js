var ApiRef = {
	_debug : true,

	_showFunctionsInTree : false,				// set to true to show individual function entries in the fucntion tree
												//	NOTE: setting this to true makes building the tree VERY slow
	_maxTreeNodes : 40,							// maximum number of top-level tree nodes to output (useful when _showFunctionsInTree is true)
	
	skipProtected : false,		// set to false to show protected variables

	functionMap : {},
	classMap : {},
	treeNodeMap : {},
	pkgDataCache : {},
	itemDataCache : {},
	
	init : function() {
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
	
	showReference : function(name, pkgName) {
	// XXX THIS SEEMS DANGEROUS...
		if (pkgName == null) pkgName = this.getItemPackageName(name);
		if (this._debug) dojo.debug("ApiRef.showReference("+name+","+pkgName+")");

		var callback = function(pkgData) {
			ApiRef.showReferenceCallback(name, pkgName);
		}
		this.loadPkgData(pkgName, callback);
	},
	
	showReferenceCallback : function (name, pkgName) {
		var itemType = this.getItemType(name);

		if (this._debug) dojo.debug("ApiRef.showReferenceCallback("+name+","+pkgName+"): looks like a " + itemType);
		var itemData = this.getItemData(name, pkgName);
		var output;
		switch (itemType) {
			case "package":
				output = this.outputPackage(itemData, name, pkgName);
				break;
				
			case "class":
				output = this.outputClass(itemData, name, pkgName)
				break;
				
			case "method":
				output = this.outputMethod(itemData, name, pkgName);
				break;
		}
		this.setContent(output);

		dojo.io.cookie.setCookie("ApiRef_lastItem", name, -1);
		dojo.io.cookie.setCookie("ApiRef_lastPkg", pkgName, -1);
		dojo.byId("searchBox").value = name;
	},
	
	getItemType : function(name) {
		// summary
		// 	approximate the item type based on the length and shape of the name
		//	returns: "package", "class" or "method"
		var split = name.split("."),
			leaf = split[split.length-1]
		;
		if (this.classMap[name]) {
			// handle "dojo" or "dojo.collections"
			if (split.length == 1 || split.length == 2) {
				return "package";
			}

			var leafStart = leaf.charAt(0);
			if (leafStart.toLowerCase() != leafStart) {
				// starts with a capital -- probably a class
				return "class";
			} else {
				return "package";
			}
		} else {
			return "method";
		}
	},
	
	getItemPackageName : function(name, pkgName) {
		if (pkgName != null) return pkgName;
		return name.split(".").slice(0,2).join(".");
	},
	
	getItemLeafName : function(name) {
		name = name.split(".");
		return name[name.length - 1];
	},
	
	getItemParentName : function(name) {
		name = name.split(".");
		return name.slice(0, name.length - 1).join(".");
	},
	
	getItemData : function(name, pkgName, pkgData) {
		if (this.itemDataCache[name]) return this.itemDataCache[name];

		if (pkgName == null) pkgName = this.getItemPackageName(name);
		if (pkgData == null) pkgData = this.getPkgData(pkgName);
		
		if (pkgData == null) throw("Couldn't get package for "+pkgName+" ("+name+")");
		
		var itemType = this.getItemType(name);
		if (itemType == "package") return (this.itemDataCache[name] = pkgData);

		var split = name.split(".");
		
		// get the class
		var className = (itemType == "class" ? name : this.getItemParentName(name));
		var classData = pkgData[className];
		
		if (itemType == "class") {
			return (this.itemDataCache[className] = classData);
		}

		// method
		if (classData == null) return null
		if (classData && classData.meta) classData = classData.meta;
		var method = classData.functions[name];
		if (method && method._) method = method._;
		if (method && method.meta) method = method.meta;
		return (this.itemDataCache[name] = method);
	},
	
	
	setContent : function(html, add) {
		var el = dojo.byId("content");
		if (add == true) {
			el.innerHTML += html;
		} else {
			el.innerHTML = html;
		}
	},
	
	onToggleMethod : function(methodName, pkgName, el) {
		var methodData = this.getItemData(methodName, pkgName);
		if (methodData == null) {
			return dojo.debug("onToggleMethod("+methodName+","+pkgName+"): can't load method data");	
		}
	
		if (el.className == "itemLinkCollapsed") {
			el.className = "itemLinkExpanded";
			this.wipeReplace(methodName, this.outputMethodDetails(methodData, methodName), 200, 500);
		} else {
			el.className = "itemLinkCollapsed";
			this.wipeReplace(methodName, this.outputMethodSummary(methodData, methodName), 500, 200);
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

	
	outputPackage : function(pkgData, packageName, pkgName) {
		var output = [];
		output.push("<div class='packageHeader'>Package:", packageName, "</div>");
		output.push("<div class='packageContainer'>");
		for (var className in pkgData) {
			var classObj = pkgData[className];
			output.push(this.outputClass(classObj, className, pkgName));
		}
		output.push("</div>");	// packageContainer
		return output.join("\n");
	},
	
	outputClass : function(classObj, className, pkgName) {
		var output = [];
		output.push("<div class='classHeader'>Class: ", className, "</div>");
		output.push("<div class='classContainer'>");

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
				if (bothPresent) output.push("<table class='classParamsTable'><tr><td class='classParamTableCell'>");

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
				output.push(this.outputMethod(constructor, className, pkgName));
			}
		} catch (e) {
//			output.push(className, ": No constructor</div>");
		}

		// output the methods
		try {
			var methods = classObj.meta.functions;
			var wroteAMethod = false;
			if (methods != null) {
				output.push("<div class='classLabel'>Methods:</div>");
				for (var methodName in methods) {
					if (methodName == className) continue;
	
					var method = methods[methodName]._.meta;
					output.push(this.outputMethod(method, methodName, pkgName));
					wroteAMethod = true;
				}
				if (!wroteAMethod) {
					output.push("<div class='emptyMethods'>(No methods)</div>");
				}
			}
		} catch (e) {
			output.push("<div class='emptyMethods'>(No methods)</div>");
		}
		output.push("</div>");	// classContainer
		return output.join("");
	},
	
	outputMethod : function(methodData, methodName, pkgName) {
		if (methodData == null) {
			dojo.debug("ApiRef.outputMethod("+methodName+"): method data is null");
			return "";
		}

		var shortName = methodName.split(".");
		shortName = shortName[shortName.length - 1];
		var isProtected = shortName.indexOf("_") == 0;
		if (isProtected && this.skipProtected) {
			if (this._debug) dojo.debug("skipping protected method " + methodName);
			return "";
		}

		var output = [];
		output.push("<div class=methodHeader>");
		output.push(this.outputItemLink(methodName, "onToggleMethod('"+methodName+"','"+pkgName+"',this)", "itemLinkCollapsed"), "(");
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
		output.push(")");
		if (methodData.returns) {
			output.push(" <i>returns</i> ", this.outputItemLink(methodData.returns));
		}

		output.push("</div>");

		output.push("<div class=methodContainer id='", methodName, "'>");
	
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
			output.push("<div class=methodLabel>Source:</div>", "<div class=methodSource>", methodData.src, "</div>");
		}

		output.push("</div>");
		return output.join("");
	},
	
	
	outputParameters : function(params, filteredList) {
		var output = [];
			output.push("<div class='paramsContainer'>");
			output.push("<table class='paramsTable'>");
			output.push("<tr><td class=paramsHeader>Type</td><td class=paramsHeader>Name</td><td class=paramsHeader>Description</td></tr>");

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
		if (split.length == 1) return name;
		
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
	//	routines to build the tree of objects
	//
	
	
	initObjectTree : function(function_names) {
		this.function_names = function_names;
	
		ApiRef.buildObjectTree();
		
		var cookieItem = dojo.io.cookie.getCookie("ApiRef_lastItem"),
			cookiePkg = dojo.io.cookie.getCookie("ApiRef_lastPkg")
		;
		if (cookieItem != null && cookiePkg != null) {
			ApiRef.showReference(cookieItem, cookiePkg);
		} else {
			ApiRef.showReference("dojo","dojo");
		}
	},


	buildObjectTree : function() {
		this.startProfile("buildObjectTree");
		
		// create the tree and controller
		var controller = this.treeController = dojo.widget.createWidget("TreeBasicControllerV3");
		var tree = this.tree = dojo.widget.createWidget("TreeV3", {listeners: [controller.widgetId]});

		// make the tree from the function map and expand it to level 1
		ApiRef.buildObjectTreeNodes();

		controller.expandToLevel(tree, 1);

		// after expanding, set things up so it'll wipe up and down when opened
		tree.toggleObj = dojo.lfx.toggle.wipe;

		var displayEl = dojo.byId("fnTreeContainer");
		displayEl.innerHTML = "";
		displayEl.appendChild(tree.domNode);
		
		this.endProfile("buildObjectTree");
	},

	//
	//	creating the tree of functions
	//
	//	yields:  object with properties of string (terminal) or object (nested)
	buildObjectTreeNodes : function(mapOnly) {
		this.clearProfile("buildObjectTreeNodes");
		this.startProfile("buildObjectTreeNodes");
		// list items whos output is non-standard in the function_names that you want to skip
		var skipItems = {
			"dojo.widget.html.loader":true
		}

		// put the "dojo" node in there first to make sure its filename is set correctly
		this.makeTreeNode("dojo","dojo");

		var classes = this.function_names;
		var map = this.functionMap = {};
		var count = 0;
		for (var className in classes) {
			var split = className.split(".");
			var leaf = split[split.length - 1];
			var list = classes[className];

			if (skipItems[className] != null) {
				if (this._debug) dojo.debug("Skipping non-standard item: " + className);
				continue;
			}

			// if entry ends with "_", it's a package -- strip off the "_"
			if (leaf == "_") {
				className = this.getItemParentName(className);
			}

			// add it to the list of "classes"
			this.classMap[className] = true;
			

			// if "_maxTreeNodes" is set, stop after that many items
			if (this._showFunctionsInTree && this._maxTreeNodes && count++ > this._maxTreeNodes) break;
			
			// get the pkgName, which is the first two items of the className
			var pkgName = this.getItemPackageName(className);
			if (mapOnly != true) this.makeTreeNode(className, pkgName);
			this.addToMap(map, className);
			for (var i = 0; i < list.length; i++) {
				var fn = list[i];
				if (this.getTreeNodeByPath(fn)) continue;

				if (fn.charAt(0) == "[") {
					if (this._debug) dojo.debug("Skipping array item: " + fn);
					continue;			
				}
				if (this._showFunctionsInTree != true) {
					var split = fn.split(".");
					var firstChar = split[split.length - 1].charAt(0);
					if (firstChar == "_" || firstChar.toLowerCase() == firstChar  || !isNaN(parseInt(firstChar))) continue;
				}
				if (mapOnly != true) this.makeTreeNode(fn, pkgName);
				this.addToMap(map, fn);
			}
		}
		this.endProfile("buildObjectTreeNodes");
	},
	
	getTreeNodeByPath : function(fullName) {
		return this.treeNodeMap[fullName];
	},

	getNodeParent : function(fullName, pkgName) {
		var parentName = this.getItemParentName(fullName);
		// if a top-level node, parent is the tree itself
		if (parentName == "") return this.tree;
		
		var parent = this.getTreeNodeByPath(parentName);
		if (parent) return parent;

		// if not found, build up to it
		parentName = parentName.split(".");
		var ancestorName = "";
		var parent = this.tree;
		for (var i = 0; i < parentName.length; i++) {
			ancestorName += parentName[i];
			var node = this.treeNodeMap[ancestorName];
			if (!node) {
				node = this.makeTreeNode(ancestorName, pkgName, parent);
			}
			parent = node;
			ancestorName += ".";
		}
		return parent;
	},

	makeTreeNode : function (fullName, pkgName, parent) {
		var node = this.getTreeNodeByPath(fullName);
		if (node) return node;
		
		var split = fullName.split(".");
		var title = split[split.length - 1];

		if (parent == null) {
			parent = this.getNodeParent(fullName, pkgName);
		}
		
		var node = dojo.widget.createWidget("TreeNodeV3", {title:title, pkgName:pkgName, fullName:fullName, tree:this.tree.widgetId, toggle:"wipe"});
		node.toggleDuration = 400;
		node.onHideChildren = function() {
			this.inherited("onHideChildren", arguments);
			//HACK: the wipe toggle pops the node back to full size at the end of the hide...
			this.containerNode.style.display = "none";	
		}
		
		node.viewFocus = function() {
			dojo.widget.TreeNodeV3.prototype.viewFocus.apply(this, arguments);
			if (this._debug) dojo.debug("viewFocus on " + this.fullName);
			ApiRef.showReference(this.fullName, this.pkgName);
		}
		this.treeNodeMap[fullName] = node;
		parent.addChild(node);
		return node;
	},



	addToMap : function(map, name) {
		var split = name.split(".");
		var head = map;
		for (var i = 0; i < split.length; i++) {
			var it = split[i];
			if (typeof head[it] == "string") {
				head[it] = {};
			} else if (head[it] == null) {
				head[it] = (i == split.length - 1 ? name : {});
			}
			head = head[it];
		}
	},
	
	

	
	
	
	//
	//	debug stuff
	//


	
	debugMenuAction : function(action, el) {
		eval(action);
		el.selectedIndex = 0;
	},
	
	debugObjectTree : function(rebuild, showFunctions) {
		if (rebuild == true) {
			this._showFunctionsInTree = (showFunctions == true);
			this.buildObjectTreeNodes(true);
		}
		this.setContent("<H2>Items shown in the object tree</h2>"+ApiRef.objectToHtml(this.functionMap, true));
	},
	
	debugFunctionNames : function() {
		this.setContent("<H2>Function Names (from local_json/function_names)</h2>"+ApiRef.objectToHtml(ApiRef.function_names, true, null));
	},
	
	debugClassMap : function() {
		this.setContent("<H2>List of 'Classes'</h2>"+ApiRef.objectToHtml(ApiRef.classMap, true, null));
	},
	
	debugItemData : function(itemName) {
		if (itemName == null) {
			itemName = prompt("Show data for which item?", dojo.io.cookie.getCookie("ApiRef_lastItem") || "dojo");
			if (itemName == null) return;
			dojo.io.cookie.setCookie("ApiRef_lastItem", itemName);
		}
		var pkgName = this.getItemPackageName(itemName);
		var callback = function() {
			var itemData = ApiRef.getItemData(itemName, pkgName);
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

dojo.addOnLoad(ApiRef.init);


// mix in the profiling helper code
dojo.lang.mixin(ApiRef, dojo.profile.ProfileHelper);
this._profile = false;
this._autoDebugProfile = false;




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
