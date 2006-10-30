var ApiRef = {
	_debug : false,

	_showMethodsInTree : false,				// set to true to show individual function entries in the fucntion tree
												//	NOTE: setting this to true makes building the tree VERY slow
	_maxTreeNodes : 40,							// maximum number of top-level tree nodes to output (useful when _showMethodsInTree is true)
	
	showInherited : true,						// set to true to show inherited methods and properties
	showPrivate : false,						// set to true to show private variables and functions
	showDeprecated : true,						// set to true to show deprecated variables and functions	-- DOESNT WORK YET
	showExperimental : true,					// set to true to show experimental variables and functions	-- DOESNT WORK YET

	defaultReferenceId: "content",				// default element.id where showItem*() puts its output

	// initialize the data structures we'll be building below
	functionList : [],
	functionMap : {},

	
	init : function() {
		// summary
		//	initialize the entire app

		// set up debugging and profiling, based on cookie values
		//	use the debug menu to turn this on and off
		this._debug = (dojo.io.cookie.getCookie("ApiRef_debug") == "true")
		if (this._debug) dojo.debug("ApiRef.debugging is on (use debug menu to change).");

		this._profile = (dojo.io.cookie.getCookie("ApiRef_profile") == "true");
		this._autoDebugProfile = (this._profile && this._debug);
		if (this._profile) dojo.debug("ApiRef.profiling is on (use debug menu to change).");

		this.setShowInherited((dojo.io.cookie.getCookie("ApiRef_showInherited") == "true"),  false);
		this.setShowPrivate((dojo.io.cookie.getCookie("ApiRef_showPrivate") == "true"),  false);
		//this.setShowDeprecated((dojo.io.cookie.getCookie("ApiRef_showDeprecated") == "true"),  false);
		//this.setShowExperimental((dojo.io.cookie.getCookie("ApiRef_showExperimental") == "true"),  false);
		
		// load the list of functions and start everything going when that's done
		this.showNotice("Loading API index...");
		this.functionNameLoader = this.loadParserFile("function_names");
		this.functionNameLoader.callback = function(data){ApiRef.initTreeWidget(data)};
	},

	onAfterInit : function() {
		// summary
		//	Called when initialization (eg: loading of tree widget) has finished.
		//	Responsible for showing the initial reference item, based on the URL fragment or a cookie, if set.
	
		// hook up the search combobox values
		this.initSearchBox();

		// figre out what to show initially, from hash, cookie or default of "dojo"
		
		var initialItem = "dojo";
		var hash = window.location.hash;
		if (hash != null && hash.charAt(0) == "#") {
			// strip off the leading "#"
			initialItem = hash.substr(1);
		} else {
			var cookieItem = dojo.io.cookie.getCookie("ApiRef_lastItem");
			if (cookieItem != null) initialItem = cookieItem;
		}
		if (initialItem == null) initialItem = "dojo";

		// split into "name:type"
		initialItem = initialItem.split(":");

		// set the initial page state to the cookie sate
		dojo.undo.browser.setInitialState(new ApiRef.BookmarkState(initialItem[0], initialItem[1]));

		// call showItem, but don't record the state since we just setInitialState
		ApiRef.showItem(initialItem[0], initialItem[1], null, false);

		this.clearNotice();
	},

	

	
	//
	//	loading the data from the parser files
	//
	

	parserDataCache : {},
	getParserData : function(parserFile) {
		return this.parserDataCache[parserFile];
	},

	cacheParserData : function(parserFile, data, msg) {
//		if (this._debug) this.debug_showParserData(parserFile, data);

		if (!msg) msg = "Integrating data for module "+parserFile;
		this.showNotice(msg);
		this.startProfile("cacheParserData:"+parserFile);

		// first assign the whole shebang to the 'package' object
		var item = this.getItem(parserFile);
		if (item) {
			item.pkgData = data;
//			if (item.data == null) item.data = [];
//			item.data.push(data);
		}
//dojo.debug("cacheParserData", data);
		this._parseDataObject(data, parserFile, parserFile);
		this.parserDataCache[parserFile] = data;
		this.clearNotice(msg);
		this.endProfile("cacheParserData:"+parserFile);
	},
	
	_parseDataObject : function(dataObj, ref, parserFile) {
		for (var name in dataObj) {
			var dataItem = dataObj[name];
			//	if (dataItem && dataItem.meta && dataItem.extras == null) dataItem = dataItem.meta;
			var item = this.functionMap[name];
			//dojo.debug("_parseDataObject", dataItem, name,item,ref);
			if (item == null) {
				item = {
					name:name,
					title:name,
					parserFile:parserFile,
					parentName:ref,
					isMethod:"F",
					isLoaded:true,
					data:[dataItem]
				}
				this.functionMap[name] = item;
				
				var parent = this.functionMap[ref];
				if (this._debug) dojo.debug("_parseData(",ref,"): couldn't find " + name, "adding to parent:", parent);
				
				if (parent.methods == null) parent.methods = [];
				parent.methods.push(item);

				if (parent.all == null) parent.all = [];
				parent.all.push(item);

				parent.isObject = "O";
				this.getItemType(parent,true);
			} else {
				item.isLoaded = true;
				if (item.data == null) item.data = [];
				//dojo.debug("assigning:",dataItem, "to", item);
		
				if (item.isClass && item.constructor && name == item.name && dataItem.meta && dataItem.meta.functions == null) {
					//	dojo.debug("Setting up constructor " + item.name);
					if (item.constructor.data == null) item.constructor.data = [];
					item.constructor.data.push(dataItem.meta);
				} else {	
					item.data.push(dataItem);
				}
			}
			
			if (dataItem.meta && dataItem.meta.functions) {
			//dojo.debug("recursing into meta.functions:",dataItem.meta.functions, parserFile);
				this._parseDataObject(dataItem.meta.functions, name);
			}
			if (dataItem.functions) {
			//dojo.debug("recursing into functions:",dataItem.functions);
				this._parseDataObject(dataItem.functions, name, parserFile);
			}
		}
	},
	
	loadParserData : function(parserFile, callback, msg) {
		if (!msg) msg = "Loading data for module "+ parserFile;
		this.showNotice(msg);
		
		var parserData = this.getParserData(parserFile);
		if (parserData == null) {
			var deferred = this.loadParserFile(parserFile,true);
			var cacheCallback = function(parserData) {
				ApiRef.cacheParserData(parserFile, parserData);
				ApiRef.clearNotice();
			}
			deferred.addCallback(cacheCallback)
			deferred.addCallback(callback);
		} else {
			callback(parserData);
		}
	},
	
	_url : (window.inLocalMode ? dojo.uri.dojoUri("docscripts") : dojo.uri.dojoUri("")),
	loadParserFile: function(/*String*/ filename, /*bool*/ sync) {
		if (filename == null) return dojo.debug("dojo.dojcs.loadParserFile(): you must pass a file name to load");
		this.startProfile("ApiRef.loadParserFile('" + filename + "')");
		var parts = filename.split("/");
		var size = parts.length;
		var deferred = new dojo.Deferred;
		var args = {
			mimetype: "text/json",
			load: function(type, data){
				ApiRef.endProfile("ApiRef.loadParserFile('" + filename + "')");

				if(parts[0] != "function_names") {
					// MOW: this was messing up loading of packages
					//	for(var i = 0, part; part = parts[i]; i++){
					//		data = data[part];
					//	}
				}
				deferred.callback(data);
			},
			error: function(){
				deferred.errback();
			}
		};
		
		if (sync) {
			args.sync = true;
		}

		if(size){
			if(parts[0] == "function_names"){
				args.url = [this._url, "local_json", "function_names"].join("/");
			}else{
				var dirs = parts[0].split(".");
				args.url = [this._url, "local_json", dirs[0]].join("/");
				if(dirs.length > 1){
					args.url = [args.url, dirs[1]].join(".");
				}
			}
		}

		if (this._debug) dojo.debug("ApiRef.loadParserFile('" + filename + "'): starting (looking in " + args.url + ")");
		
		dojo.io.bind(args);
		return deferred;
	},

	
	
	//
	//
	//
	
	openFile : function(fileName) {
		fileName = fileName.split(".");
		if (fileName[0] == "dojo") fileName = fileName.slice(1);
		fileName = fileName.join("/") + ".js";
		window.open(djConfig.baseScriptURI + "/src/" + fileName, "_blank");
	},
	
	//
	//	showing a particular reference (eg: "dojo.html.layout.foo()"
	//
	
	
	onTreeSelect : function(message) {
		var item = message.node,
			name = item.name
		;
		this.showItem(name);
	},
	
	showItem : function(name, type, elementId, recordState) {
		if (name == null) name = dojo.io.cookie.getCookie("ApiRef_lastItem");

		var item = this.getItem(name),
			parserFile = this.getItemParserFile(name)
		;
		if (parserFile == null) {
			return dojo.debug("ApiRef.showItem("+name+"): can't find parser file");
		}
		if (this._debug) dojo.debug("ApiRef.showItem("+name+","+parserFile+")");

		var callback = function(parserData) {
			ApiRef._showItemCallback(name, elementId, type);
		}
		this.loadParserData(parserFile, callback);

		// remember the bookmark state so we can go back if necessary
		if (recordState != false) dojo.undo.browser.addToHistory(new ApiRef.BookmarkState(item.name, type));
		
//		dojo.byId("title").innerHTML = "Dojo API Reference: " + name;
	},
	
	_showItemCallback : function (name, elementId, type) {
		var item = this.getItem(name);
//dojo.debug(name, item);
		if (this._debug) dojo.debug("ApiRef._showItemCallback("+name+","+elementId+"): type is " + this.getItemTypeString(item));
		
		// ASSERT: at this point, the parser file for the item has been loaded and parsed
		//			so the item must be loaded!
		var output = this.outputItem(item, true, type);

		if (elementId == null) {
			var el = dojo.byId(this.defaultReferenceId);
			el.innerHTML = output;
		} else {
			var el = dojo.byId(elementId);
			if (el == null) {
				alert("_showItemCallback"+name+"): no element found with id: "+elementId);
			}
			el.outerHTML = output;
		}

		dojo.io.cookie.setCookie("ApiRef_lastItem", name, 180);
		this.setSearchBoxValue(name);
	},

	// show the body of an item, loading it if necessary
	expandItem : function(name, type) {
//dojo.debug("expandItem("+name+","+type+")");

		var item = this.getItem(name);
		item.isExpanded = true;
		
		if (type == null) type = this.getItemType(item);

		// first update the header
		var headerEl = dojo.byId(name + "-header-"+type);
		if (headerEl) {
			headerEl.innerHTML = this.outputItemHeader(item, true, type);
		}
		
		// update the body with what we have (whether loaded or not)
		this.wipeReplace(name+"-body-"+type, this.outputItemBody(item, true, type));

		// and load it if we need to
		//	this will redraw the whole thing after it comes in
		if (item.isLoaded != true) {
			this.showItem(name, type, name+"-outer");
		}
	},
	

	collapseItem : function(name, type) {
		//dojo.debug("collapseItem("+name+","+type+")");
		var item = this.getItem(name);
		delete item.isExpanded;
		
		var headerEl = dojo.byId(name + "-header-"+type);
		if (headerEl) {
			headerEl.innerHTML = this.outputItemHeader(item, false, type);
		}	
		var bodyEl = dojo.byId(name+"-body-"+type);
		if (bodyEl) {
			this.wipeReplace(bodyEl, this.outputItemBody(item, false, type), 500, 200);
		}
	},

	toggleInherited : function() {
		this.setShowInherited(this.showInherited ? false : true);
	},
	setShowInherited : function(newState, reShow) {
		this.showInherited = newState;
		dojo.io.cookie.setCookie("ApiRef_showInherited", ""+this.showInherited, 180);
		if (this._debug) dojo.debug("Inherited members will now be " + (this.showInherited ? "shown." : "hidden."));

		// update the checkbox
		dojo.byId("showInherited").checked = this.showInherited;
		
		// re-show the last selected item
		if (reShow != false) this.showItem();	
	},
	
	togglePrivate : function() {
		this.setShowPrivate(this.showPrivate ? false : true);
	},
	setShowPrivate : function(newState, reShow) {
		this.showPrivate = newState;
		dojo.io.cookie.setCookie("ApiRef_showPrivate", ""+this.showPrivate, 180);
		if (this._debug) dojo.debug("Private members will now be " + (this.showPrivate ? "shown." : "hidden."));

		// update the checkbox
		dojo.byId("showPrivate").checked = this.showPrivate;

		// re-show the last selected item
		if (reShow != false) this.showItem();	
	},

	toggleDeprecated : function() {
	// NOTE: THIS IS NOT IMPLEMENTED YET
		this.setShowDeprecated(this.showDeprecated ? false : true);
	},
	setShowDeprecated : function(newState, reShow) {
	// NOTE: THIS IS NOT IMPLEMENTED YET
		this.showDeprecated = newState;
		dojo.io.cookie.setCookie("ApiRef_showDeprecated", ""+this.showDeprecated, 180);
		if (this._debug) dojo.debug("Deprecated members will now be " + (this.showDeprecated ? "shown." : "hidden."));

		// update the checkbox
		dojo.byId("showDeprecated").checked = this.showDeprecated;

		// re-show the last selected item
		if (reShow != false) this.showItem();	
	},

	toggleExperimental : function() {
	// NOTE: THIS IS NOT IMPLEMENTED YET
		this.setShowExperimental(this.showExperimental ? false : true);
	},
	setShowExperimental : function(newState, reShow) {
	// NOTE: THIS IS NOT IMPLEMENTED YET
		this.showExperimental = newState;
		dojo.io.cookie.setCookie("ApiRef_showExperimental", ""+this.showExperimental, 180);
		if (this._debug) dojo.debug("Experimental members will now be " + (this.showExperimental ? "shown." : "hidden."));

		// update the checkbox
		dojo.byId("showExperimental").checked = this.showExperimental;

		// re-show the last selected item
		if (reShow != false) this.showItem();	
	},

	
	//
	//	get an item and pieces of it
	//	NOTE: these all work with a string name or a ref to the item
	//
	
	getItem : function(name) {
		if (typeof name != "string") return name;
//		if (this._debug && this.functionMap[name] == null) dojo.debug("getItem("+name+"): name not found");
		return this.functionMap[name];
	},

	itemIsMethod : function(name) {
		return (this.getItemType(name) == "Method");
	},

	getItemTypeString : function(name) {
		var item = this.getItem(name);
		if (item.typeString) return item.typeString;
		return item.typeString = [
			(item.isPackage		|| "-"),
			(item.isModule		|| "-"),
			(item.isClass		|| "-"),
			(item.isObject		|| "-"),
			(item.hasChildren	|| "-"),
			(item.isMethod	|| "-"),
		].join("");
	},

	getItemType : function (name, recheck) {
		var item = this.getItem(name);
		
		if (item.itemType != null && recheck == null) return item.itemType;
		var type = "Method";
		if (item.isClass) type =  "Class";
		else if (item.isObject) type =  "Object";
		else if (item.isModule) type = "Module";
		else if (item.isPackage) type =  "Package";	// package is LAST
		
		return (item.itemType = type);
	},
	
	getItemParserFile : function(name) {
		var item = this.getItem(name);
		return (item ? item.parserFile : null);
	},

	getItemPackage : function(name) {
		var item = this.getItem(name);
		return (item ? item.pkg : null);
	},

	getItemTreeNode : function(name) {
		var item = this.getItem(name);
		return (item ? item.node : null);
	},

	getItemData : function(name) {
		var item = this.getItem(name);
		if (item.data) return item.data;
		return dojo.debug("getItemData("+name+"): no data found!");
	},

	getItemMetaData : function(item, property) {
		if (item.data != null) {
			for (var i = 0, datum; datum = item.data[i]; i++) {
				if (datum.meta) {
					if (property && datum.meta[property] != null) {
						return datum.meta[property];
					} else{
						return datum.meta;
					}
				}
			}
		}
		return null;
	},

	getItemDataPart : function(item, prop) {
		if (item.data != null) {
			for (var i = 0, datum; datum = item.data[i]; i++) {
				if (datum[prop]) return datum[prop];
			}
		}
		return null;		
	},
	
	_getDataProperty : function(data, prop) {
		if (data == null) return null;
		for (var i = 0, datum; datum = data[i]; i++) {
			if (datum[prop]) return datum[prop];
			if (datum.meta && datum.meta[prop]) return datum.meta[prop];
		}
		return null;
	},
	
	
	//
	//	special purpose accessors
	//
//	getItemSuperclass : function(item) {
//		return this._getDataProperty(item.constructor ? item.constructor.data : item.data, "prototype_chain");
//	},
	
	getItemSupers : function(item) {
		if (item._supers != null) return item._supers;
		var inherits = this._getDataProperty(item.constructor ? item.constructor.data : item.data, "prototype_chain");
		if (inherits == null) return null;

		var list = [];
		for (var i = 0, parentName; parentName = inherits[i]; i++) {
			list.push(parentName);
			var parent = this.getItem(parentName);
			if (parent) {
				ancestors = this.getItemSupers(parent);
				if (ancestors != null) list = list.concat(ancestors);
			}
		}
		item._supers = list;
		return list;
	},
	
	getItemSupersProp : function(item, prop, includeItem) {
		var list = [];
		if (includeItem == true && item[prop] != null) {
			list.push(item[prop]);
		}
		var supers = this.getItemSupers(item);
		if (supers) {
			for (var i = 0, parentName; parentName = supers[i]; i++) {
				var parent = this.getItem(parentName);
				if (parent == null) continue;
				if (parent[prop] != null) {
					list.push(parent[prop]);
				}
			}
		}
		return list;
	},
	
	
	getItemSuperMethods : function(item) {
		var all = {};
		var allNames = {};

		var supers = [item.name].concat(this.getItemSupers(item));

		var methodLists = this.getItemSupersProp(item, "methods", true);
//dojo.debug(methodLists);
		for (var i = 0, list; list = methodLists[i]; i++) {
			var parent = this.getItem(supers[i]);
//dojo.debug("processing " + parent.name);			
			for (var m = 0, method; method = list[m]; m++) {
//				if (method.name.indexOf(parent.name) != 0) {
//dojo.debug("skipping " + method.name);
//					continue;
//				}

				var leaf = this.getLeafName(method.name);
				if (allNames[leaf] == null) {
					allNames[leaf] = method;
					all[method.name] = method;
				}
			}
		}
		var sortedList = this._sortProperties(allNames, "array");
//		for (var i = 0; i < sortedList.length; i++) {
//			dojo.debug(sortedList[i].name);
//		}
		return sortedList;
	},
	
	_sortProperties : function(obj, returnType) {
		var names = [];
		for (var prop in obj) {
			names.push(prop.toLowerCase() + "|"+prop);
		}
		names.sort();
		
		if (returnType == "array") {
			var returnList = [];
			for (var i = 0, name; name = names[i]; i++) {
				name = name.split("|")[1];
				returnList.push(obj[name]);
			}
			return returnList;
			
		} else {
			var returnObj = {};
			for (var i = 0, name; name = names[i]; i++) {
				name = name.split("|")[1];
				returnObj[name] = obj[name];
			}
			return returnObj;
		}
	},
	
	
	//
	//	get and parts of names
	//	NOTE: THESE TAKE A STRING ONLY
	//
	
	getTitle : function(name) {
		var title = this.getLeafName(name);
		if (title == "_") title = "*";
// ITEM ISN'T DEFINED HERE... :-(
//		if (this._debug) title += " <span class='tinyGray'>"+this.getItemTypeString(item)+"</span>";
		return title;	
	},
	
	getLeafName : function(name) {
		name = name.split(".");
		return name[name.length - 1];
	},
	
	getParentName : function(name) {
		name = name.split(".");
		return name.slice(0, name.length - 1).join(".");
	},

	
	getAncestors : function(name) {
		name = name.split(".");
		if (name.length == 1) return [];

		var list = [name[0]];
		for (var i = 1, len = name.length - 1; i < len; i++) {
			list[i] = list[i-1] + "." + name[i];
		}
		return list;
	},
	
	
	showNotice : function(msg) {
		this.setContent(msg + "<br>", true);
	},
	
	clearNotice : function(msg) {
//		this.setContent("");
	},

	setContent : function(html, el, add) {
		if (el == null) el = "content";
		el = dojo.byId(el);

		if (add == true) {
			el.innerHTML += html;
		} else {
			el.innerHTML = "<span id='contentTop'></span>" + html;
		}
		dojo.html.scrollIntoView(dojo.byId("contentTop"));
	},

	wipeReplace : function(node, newHtml, outTime, inTime) {
		if (outTime == null) outTime = 200;
		if (inTime == null) inTime = 500;
		
		node = dojo.byId(node);
		var replaceCallback = function() {
			node.innerHTML = newHtml;
			setTimeout(function(){dojo.lfx.wipeIn(node, inTime).play()},100);
		}
		dojo.lfx.wipeOut(node, outTime, null, replaceCallback).play();
	},

	wipeInReplace : function(node, newHtml, time) {
		if (time == null) time = 500;
		var replaceCallback = function() {
			node.innerHTML = newHtml;
		}
		dojo.lfx.wipeIn(node, time, null, replaceCallback).play();
	},

	wipeOutReplace : function(node, newHtml, time) {
		if (time == null) time = 500;
		var replaceCallback = function() {
			node.innerHTML = newHtml;
		}
		dojo.lfx.wipeOut(node, time, null, replaceCallback).play();
	},

	
	
	//
	//	output routines
	//

	// pass an explicit type and data to output in that way
	outputItem : function(item, showDetails, type, data) {
		item = this.getItem(item);
		showDetails = showDetails || (item.isExpanded == true);
		
		var output = [];
		if (type == null) type = this.getItemType(item);
	
		// skip private methods entirely
		if (type == "Method") {
			var isPrivate = (item.title.indexOf("_") == 0);
			if (isPrivate && !this.showPrivate) {
				if (this._debug) dojo.debug("skipping private method " + item.name);
				return "";
			}
		}

		var bodyHtml = this.outputItemBody(item, showDetails, type, data),
			headerHtml = this.outputItemHeader(item, showDetails, type, data)
		;
		return this.outputItemContainer(item, type, headerHtml, bodyHtml);
	},

	outputItemContainer : function(item, type, headerHtml, bodyHtml) {
		var output = ["<div id='", item.name,"-outer' class='"+type+ (type != "Method" ? " Container" : ""), "'>",
						"<div id='", item.name,"-header-",type,"' class='", type, "Header'>",
							headerHtml,
						"</div>",
						"<div id='", item.name,"-body-",type,"' class='",type, "Body'>",
							bodyHtml,
						"</div>",
					"</div>"
		];
		return output.join("");
	},

	
	outputItemHeader : function(item, showDetails, type, data) {
		item = this.getItem(item);
		if (type == null) type = this.getItemType(item);

		switch (type) {
			case "Method" 		: return this.outputMethodHeader(item, showDetails, type, data);
			
			case "Constructor" 	: return this.outputMethodHeader(item.constructor, showDetails, type, data);
			
			case "Package" 		: return this.outputPackageHeader(item, showDetails, type, data);
			
			case "Module" 		: return this.outputModuleHeader(item, showDetails, type, data);
			
			case "Class"		: 		
			case "Object" 		: return this.outputObjectHeader(item, showDetails, type, data);
		}
		return ["outputItemHeader(",item.name,"): type:" + type + " not understood..."].join("");
	},


	
	outputItemBody : function(item, showDetails, type, data) {
		item = this.getItem(item);
//dojo.debug("outputItemBody(",item.name,")",type,data);

		if (type == null) type = this.getItemType(item);
		if (type == "Method") {
			return this.outputMethodBody(item, showDetails, type, data);
		} else if (type == "Constructor") {
			return this.outputMethodBody(item.constructor, showDetails, type, data);
		}
		
		if (showDetails != true) {
			// don't put anything in the body
			return "";
		}

		// TODO: if not loaded, print a message and load it
		if (item.isLoaded != true) {
// TODO: have a "loading" so we don't get into a loop... ?
// this.itemParserDataIsLoaded(item) ???
//			this.showItem(item.name, null, item.name + "-container");
//			return this.outputClickToLoad(item);
		}
		
		switch (type) {
			case "Package" 	: return this.outputPackageBody(item, type, data);
			
			case "Module" 	: //return this.outputModuleBody(item, type, data);
			case "Object" 	: return this.outputObjectBody(item, type, data);
			
			case "Class" 	: return this.outputClassBody(item, type, data);
		}
		
		return ["outputItemBody(",item.name,"): type:" + type + " not understood..."].join("");
	},


	outputModuleHeader : function(item, showDetails, type, data) {
		return this.outputObjectHeader.apply(this, arguments);
	},

	outputPackageHeader : function(item, showDetails, type, data) {
		return this.outputObjectHeader.apply(this, arguments);
	},

	outputObjectHeader : function(item, showDetails, type, data) {
		var output = [];
/*		if (showDetails) {
			output.push(
				"<div class='toggleDisplayLink' onclick='ApiRef.togglePrivate()'>",
					(this.showPrivate ? "(Hide Private)" : "(Show Private)"),
				"</div>",
				"<div class='toggleDisplayLink' onclick='ApiRef.toggleInherited()'>",
					(this.showInherited ? "(Hide Inherited)" : "(Show Inherited)"),
				"</div>"
			);
		}
*/
		output.push(	
			this.outputItemExpander(item, showDetails, type, "itemHeaderLink", type),
				": ",
				this.outputItemLink(item, type)
		);
		return output.join("");
	},



	outputModuleBody : function(item, type, data) {
		var output = [];

		output.push(this.outputPackages(item, type));

		// if the module has "methods", output it as an object
		if (item.methods) {
			var headerHtml = this.outputObjectHeader(item, true, "Object");

			var bodyOutput = [];
			bodyOutput.push(this.outputItemLabel(item, "Object", "Methods"));
			for (var i = 0, len = item.methods.length; i < len; i++) {
				var child = item.methods[i];
				bodyOutput.push(this.outputItem(child, false));
			}
			output.push(this.outputItemContainer(item, "Object", headerHtml, bodyOutput.join("")));
		}

		// output the child objects as normal objects, outside the context of the top-level object
		if (item.children) {
			for (var i = 0, len = item.children.length; i < len; i++) {
				var child = item.children[i];
				output.push(this.outputItem(child, false));
			}
		}

		return output.join("\n");
	},
	
	outputPackageBody : function(item, type, data) {
		var output = [];

//dojo.debug("oPB:",item.name,this.getItemMetaData(item, "requires"));
		output.push(this.outputRequires(item, type, this.getItemMetaData(item, "requires")));

		var methods = this.getItemMetaData(item, "functions");
		var constructor = (methods && methods[item.name] ? methods[item.name].meta : null);

		if (constructor) {
			if (type == "Package") {
				// HACK: if there's a constructor with the same name as the package
				//	output a header for it here.
				output.push("<div id='", item.name,"-header' class='", type, "Header'>",
					this.outputObjectHeader(item, false, (item.isClass ? "Class" : "Object"), constructor),
					"</div>"
				);
			}
			
			output.push(this.outputProperty(item, type, constructor.summary, "Summary"));

			// TODO: merge with "this_variables" ???
			output.push(this.outputProtoVariables(item, type, constructor.protovariables));

			// output the constructor itself
			output.push(this.outputItemLabel(item, type, "Constructor", "Resource File"));
			output.push(this.outputItem(item, false, "Constructor", constructor));
		}
// TODO: other things to output here?
		output.push(this.outputAllMethods(item, type, data));

		return output.join("");
	},
	
	outputObjectBody : function(item, type, data) {
		if (data == null) data = (item.data ? item.data[0] : null);
		var output = [];

		output.push(this.outputPackages(item, type));

		var extra = this.getItemDataPart(item, "extra");
		if (extra && extra.variables) {
			output.push(this.outputObjectProperties(item, type, extra.variables, "Variables"));
		}

		// if the module has "methods", output it as an object
		if (item.methods) {
			output.push(this.outputItemLabel(item, type, "Methods"));
			for (var i = 0, len = item.methods.length; i < len; i++) {
				var child = item.methods[i];
				output.push(this.outputItem(child, false));
			}
		}
		// output the child objects
		if (item.children) {
			for (var i = 0, len = item.children.length; i < len; i++) {
				var child = item.children[i];
				output.push(this.outputItem(child, false));
			}
		}
		return output.join("");
	},

	outputClassBody : function(item, type, data) {
		if (data == null) data = (item.data ? item.data[0] : null);
		var output = [];

		output.push(this.outputPackages(item, type));

		var constructor = (item.constructor && item.constructor.data ? item.constructor.data[0] : null);
		
		if (constructor) {
			output.push(this.outputSupers(item, type));

			output.push(this.outputProperty(item, type, constructor.summary, "Summary"));
			output.push(this.outputProperty(item, type, constructor.description, "Description"));

			// TODO: merge with "this_variables" ???
			output.push(this.outputProtoVariables(item, type, constructor.protovariables));

			// output the constructor itself  (NOTE: we explicitly show the constructor as not expanded)
			output.push(this.outputItemLabel(item, type, "Constructor"));
			var wasExpanded = item.isExpanded;
			item.isExpanded = false;
			output.push(this.outputItem(item, false, "Constructor", constructor));
			item.isExpanded = wasExpanded;
		}

		if (this.showInherited) {
			var superMethods = this.getItemSuperMethods(item);
			output.push(this.outputMethodList(item, type, superMethods));
		} else {
			output.push(this.outputAllMethods(item, type, data));
		}

		return output.join("");
	},
	
	outputMethodList : function(item, type, list) {
		var output = [];
		// output methods in the "all" array (which are sorted, and don't include the constructor)
		output.push(this.outputItemLabel(item, type, "Methods"));

		if (list && list.length > 0) {
			for (var i = 0, method; method = list[i]; i++) {
				output.push(this.outputItem(method, false));
			}
		} else {
			output.push("<div class='emptyMethods'>(none)</div>");		
		}	
		return output.join("");
	},

	
	outputAllMethods : function(item, type, data) {
		var output = [];
		// output methods in the "all" array (which are sorted, and don't include the constructor)
		output.push(this.outputItemLabel(item, type, "Methods"));

		if (item.all != null && item.all.length > 0) {
			for (var i = 0, method; method = item.all[i]; i++) {
				output.push(this.outputItem(method, false));
			}
		} else {
			output.push("<div class='emptyMethods'>(none)</div>");		
		}	
		return output.join("");
	},

	outputSuperMethods : function(item, type) {
		var supers = this.getItemSupers(item);
		if (supers == null || supers.length == 0) return "";

		var output = [];

		for (var p = 0, parentName; parentName = supers[p]; p++) {
			var parent = this.getItem(parentName);
			if (parent.methods && parent.methods.length > 0) {
				// output methods in the "all" array (which are sorted, and don't include the constructor)
				output.push(this.outputItemLabel(parent, type, "Methods for "+parentName));
				for (var i = 0, method; method = parent.methods[i]; i++) {
					output.push(this.outputItem(method, false));
				}
			}
		}
		return output.join("");
	},
	

	// note: this can be called before the method has actually been loaded
	//	we do NOT recusively do a showItem in this case, because our parent has almost certainly already done so... ???
	outputMethodHeader : function(item, showDetails, type, data) {
		if (data == null) {
			data = item.data ? item.data[0] : null;
		}

		var output = ["<table class='MethodHeaderTable' cellspacing=0 cellpadding=0 border=0><tr><td class='MethodHeaderName'><nobr>"];
		output.push(this.outputItemExpander(item, showDetails, type, null, this.getLeafName(item.name)));
		output.push("</nobr></td><td class='MethodHeaderParams'>(");

		if (data && data.meta) data = data.meta;
		
		if (data != null) {
			var params = data.parameters;
			if (params) {
				var paramOutput = [];
				for (var paramName in params) {
					var paramType = params[paramName].type;
					paramType = this.outputItemLink(paramType);
					if (paramType != null && paramType != "") {
						paramType = ["<span class=paramType>", paramType, "</span> "].join("");
					} else {
						paramType = "";
					}
					paramOutput.push(["<span class='param'><nobr>", paramType, paramName, "</nobr></span>"].join(""));
				}
				output.push("<span class=paramsList>", paramOutput.join(", "),  "</span>");	
			}
			output.push(")");
			if (data.returns) {
				output.push(" <span class='param'>returns <span class=paramType>", this.outputItemLink(data.returns), "</span></span>");
			}
		} else {
			output.push("???)", this.outputClickToLoad(item)); 
		}
		output.push("</td><td>");
		output.push(this.outputPackageList(item, type, item.pkg));		
		output.push("</td></tr></table>");
		return output.join("");
	},
	
	outputMethodBody : function(item, showDetails, type, data) {
		// TODO: we may have data from more than one package -- figure that out here...   Context?
		if (data == null) {
			data = item.data ? item.data[0] : null;
		}

		if (data == null) {
			return "";//this.outputClickToLoad(item);
		}

		if (data.meta) data = data.meta;

		if (showDetails) {
			return this.outputMethodDetails(item, type, data);
		} else {
			return this.outputMethodSummary(item, type, data);
		}
	},

	outputMethodSummary : function(item, type, data) {
		var output = [];
		if (data.summary) {
			output.push("<div class=MethodSummary>", data.summary, "</div>");
		}
		return output.join("");
	},

	
	outputMethodDetails : function(item, type, data) {
		var output = [];
		output.push("<div class='MethodDetails'>");

		// output interesting 		
//		output.push(this.outputPackages(item, type));
		if (type != "Constructor") output.push(this.outputProperty(item, type, data.summary, "Summary"));
		if (type != "Constructor") output.push(this.outputProperty(item, type, data.description, "Description"));
		output.push(this.outputParameters(item, type, data.parameters));
		output.push(this.outputSrc(item, type, data, data.src));

		output.push("</div>");	// detailsContainer
		return output.join("");
	},
	


	//
	//	generic outputters
	//	
	
	
	
	outputClickToLoad : function(item, type) {
		return [" <span class='",type,"ClickToLoad itemClickToLoad' onclick=\"ApiRef.expandItem('", item.name, "')\">Click to load...</span>"].join("");
	},



	outputProperty : function(item, type, value, title) {
		if (value == null || value == "") return "";
		
		return this.outputItemLabel(item, type, title) + this.outputItemValue(item, type, value, title);
	},

	outputPackages : function(item, type, pkgs, title) {
		if (pkgs == null) pkgs = item.pkg;
		if (pkgs == null) return "";
		if (title == null) title = "Defined in";
		
		var pkgOut = [];
		for (var i = 0; i < pkgs.length; i++) {
			pkgOut.push([" <span class='fileLink inlineIconLeft jsFileIcon' style='float:left;padding-right:10px;' onclick=\"ApiRef.openFile('", pkgs[i], "')\">", 
				pkgs[i], 
			"</span>"].join(""));
//			pkgOut.push(this.outputItemLink(pkgs[i]));
		}
		return this.outputProperty(item, type, pkgOut.join("") + "<div style='clear:both;height:5px;'></div>", title);
	},

	outputPackageList : function(item, type, pkgs) {
		if (pkgs == null) pkgs = item.pkg;
		if (pkgs == null) return "";
		
		if (!dojo.lang.isArrayLike(pkgs)) pkgs = [pkgs];
		var pkgOut = [];
		for (var i = 0; i < pkgs.length; i++) {
			pkgOut.push([" <div class='", type, "ResourceFile itemResourceFile inlineIconLeft jsFileIcon' onclick=\"ApiRef.openFile('", pkgs[i], "')\">", pkgs[i], "</div>"].join(""));
		}
		return pkgOut.join("");//this.outputProperty(item, type, pkgOut.join(", "), "Defined in");
	},

	outputItemLabel : function(item, type, title, rightFloat) {
//		rightFloat = (rightFloat != null ? ["<div class='", type, "RightFloat itemRightFloat'>", rightFloat, "<div>"].join("") : "");
		return ["<div class='", type, "Label itemLabel'>", title,":</div>"].join("");
	},

	outputItemValue : function(item, type, value, title) {
		return [
			"<div class='", type, title, " item", title, " ", type,"Value'>",
				value,
			"</div>"
		].join("");
	},


	outputObjectProperties : function(item, type, object, title) {
		if (object == null) return "";
		
		var output = [];
		if (title != null) output.push(this.outputItemLabel(item, type, title));
		output.push("<table class='paramTable'><tr><td class=paramHeader>Property</td><td class=paramHeader>Value</td></tr>");
		for (var prop in object) {
			output.push("<tr><td class='paramName'>",prop,"</td><td class='paramDescription'>",object[prop],"</td></tr>");
		}
		output.push("</table>");
		return output.join("");
	},
	


	outputSupers : function(item, type) {
		var supers = this.getItemSupers(item);
		if (supers == null) return "";
	
		var output = [];
		for (var i = 0, it; it = supers[i]; i++) {
			output.push(this.outputItemLink(it));
		}
		output = output.reverse();
		output.push(item.name);
		output = output.join(" &gt; ");
		return this.outputProperty(item, type, output, "Inheritance Chain");
	},

	outputRequires : function(item, type, requiresObj) {
		if (requiresObj == null) return "";

		var output = [];
		for (var prop in requiresObj) {
			var requires = requiresObj[prop];
			var requiresOutput = [];
			for (var i = 0; i < requires.length; i++) {
				requiresOutput.push(this.outputItemLink(requires[i]));
			}
			output.push(prop + ": " + requiresOutput.join(", "));
		}
		return this.outputProperty(item, type, output.join(""), "Requires");
	},

	outputSrc : function(item, type, data, src) {
		if (src == null || src == "") return "";

		// add the method signature
		var fullSrc = [];
		fullSrc.push(item.name, " = function (");
		if (data && data.parameters) {
			var paramOut = [];
			for (var name in data.parameters) {
				paramOut.push(name);
			}
			fullSrc.push(paramOut.join(", "));
		}
		fullSrc.push(") {\n", src, "\n}");
		fullSrc = fullSrc.join("");
		
		return this.outputProperty(item, type, "<pre>" + this.prettyPrintJs(fullSrc) + "</pre>", "Source"); 
	},
	
	outputParameters : function(item, type, params, filteredList, title) {
//dojo.debug("outputParameters():",item.name,type,params,filteredList);
		if (params == null) return "";

		var output = [];
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
		output.push("</table>");
//dojo.debug(output.join("\n"));
		if (title == null) title = "Parameters";
		return this.outputProperty(item, type, output.join(""), title);
	},
	
	outputParameter : function(param, name) {
		var isPrivate = name.indexOf("_") == 0;
		if (isPrivate && !this.showPrivate) {
			if (this._debug) dojo.debug("skipping private parameter " + name);
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
		if (isPrivate) description = "<span class=paramPrivate>(private)</span> " + description;
		output.push("<td class='paramDescription'>", description, "</td>");

		output.push("</tr>");
		
		return output.join("");
	},
	
	
	outputProtoVariables : function(item, type, protoVars) {
		if (protoVars == null) return "";
		
		var output = [];
		// split the vars into props and event handlers
		var propList = this.filterParams(protoVars, function(name) {return name.indexOf("on") != 0});
		var handlerList = this.filterParams(protoVars, function(name) {return name.indexOf("on") == 0});
		// if both are present, write them in a table next to each other
		var bothPresent = (propList != null && handlerList != null);
		if (bothPresent) output.push("<table class='classParamTable'><tr><td class='classParamTableCell'>");

		if (propList) {
			output.push(this.outputParameters(item, type, protoVars, propList, "Instance Variables"));
		}
		if (bothPresent) output.push("</td><td valign=top>");
		
		if (handlerList) {
			output.push(this.outputParameters(item, type, protoVars, handlerList, "Event Handlers"));					
		}

		if (bothPresent) {
			output.push("</td></tr></table>");
		}
		return output.join("");
	},


	
	outputItemExpander : function(item, isOpen, type, className, title) {
		if (type == null) type = this.getItemType(item);
		if (title == null) title = item.name;
		if (className == null) className = "itemLink";
		var toggleMethod = (isOpen ? "collapseItem" : "expandItem");
		var toggleClass = [className, " ", className, (isOpen ? "Expanded" : "Collapsed")].join("");

		return this.outputItemLink(item.name, type, toggleMethod, toggleClass, title);
	},

	outputItemLink : function(name, type, linkMethod, className, title) {
		if (name == null) return "";
		if (typeof name != "string") {
			if (name.length) {
				// TODO: make this output a list of names
				name = name[0];
//				var output = [];
//				for (var i = 0, it; it = name[i]; it++) {
//					output.push(this.outputItemLink(it, type, linkMethod, className, title));
//				}
//				return output.join(", ");
			} else {
				// else assume it is an item, use item.name
				name = name.name;
			}
		}
		if (name == null) return "";
		if (title == null) title = name;

		// skip types that are not in the functionMap, since we can't link to them anyway
		if (this.getItem(name) == null) return title;


		typeStr = (type == null ? "" : ", '" + type + "'");
		if (linkMethod == null) linkMethod = "showItem";
		if (className == null) className = "itemLink";
		
		var split = name.split(".");
		
		var searchName = name;
		if (split[split.length - 1] == "*") {
			searchName = this.getParentName(name);
		}

		var linkHandler = ["ApiRef.", linkMethod,"('"+searchName+"'", typeStr, ")"].join("");
		
		return ["<span class=\"", className, "\" onclick=\"", linkHandler, "\">", 
					title, 
				"</span>"].join("");
	},
	
	prettyPrintJs : function(src) {
		src = src.split("\t").join("  ");
		src = dojo.string.escape("html", src);
		var targets = this._jsColorizeTargets;
		for (var i = 0; i < targets.length; i++) {
			var re = targets[i].re,
				replacement = targets[i].replacement
			;
			src = src.replace(re, replacement);
		}
		return src;
	},
	_jsColorizeTargets : [
//		{re:/\t/g, replacement:"    "},
		{re:/'(.*?)'/g, replacement:"<span class='sourceString'>'$1'</span>"},
		{re:/"(.*?)"/g, replacement:"<span class='sourceString'>\"$1\"</span>"},
		{re:/(dojo[\.\w]*)/g, replacement:"<span class='sourceDojoRef' onclick=\"ApiRef.showItem('$1')\">$1</span>"},
		{re:/(\W)(break|case|catch|continue|delete|do|else|false|finally|for|function|if|in|instanceof|new|return|switch|this|true|try|typeof|var|void|while|with)(?=\W)/g, replacement:"$1<span class='sourceKeyword'>$2</span>" },
		{re:/(\/\/.*)\n/g, replacement:"<span class='sourceComment'>$1</span>\n"}
	],
	
	
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
	//	set up the search combobox
	//
	initSearchBox : function() {
		var searchBox = this.searchBox = dojo.widget.byId("searchBox");
		
		var provider = searchBox.dataProvider;
		// munge the functionlist into [  [name,name], ... ]
		var optionList = [];
		for (var i = 0, name; name = this.functionList[i]; i++) {
			optionList[i] = [name, name];
		}
		// and assign this as the data for the searchBox provider
		provider.setData(optionList);

		// override the startSearch routine to look at local data rather than going to a server page
		provider.startSearch = function(searchStr) {
			var searchLength = searchStr.length;
			var searchType = "SUBSTRING";
			if("dojo.".match(new RegExp("^" + searchStr)) || searchStr.match(new RegExp("^dojo\."))){
				var searchType = "STARTSTRING";
				searchLength -= 4;
			}
			var searchBox = dojo.widget.byId("searchBox");
//			searchBox.downArrowNode.style.visibility = "hidden";
//			if(searchLength > 2) {
//				searchBox.downArrowNode.style.visibility = "visible";
//			}
			this._preformSearch(searchStr, searchType);			
		}

		// set up the "selectOption" event to run the search		
		dojo.event.connect(searchBox, "selectOption", 
			function(event) {
				var name = ApiRef.getSearchBoxValue();
				ApiRef.showItem(name);
			}
		);
		
//dojo.debug("Done initializing searchBox");
	},
	
	getSearchBoxValue : function() {
		// summary:  return the value currently displayed by the search box
		return this.searchBox.textInputNode.value;
	},
		
	setSearchBoxValue : function(value) {
		// summary: set the value currently displayed by the search box
		this.searchBox.textInputNode.value = value;
	},
		

	//
	//	routines to build the tree of objects
	//
	
	
	initTreeWidget : function(packageMap) {
		this.startProfile("initTreeWidget");
		this.packageMap = packageMap;
	
		try {
			// make the map of nodes, which also figures out their types
			this.showNotice("Parsing API index...");
			this.buildFunctionMap();
	
			this.showNotice("Creating API Tree...");
			// hook the function items up into an tree, that we will use as nodes in the tree widget
			this.makeFunctionTree();
			this.buildTreeWidget();
			
			
		} catch (error) {
			dojo.debug(error);
		}

		this.endProfile("initTreeWidget");
		
		this.onAfterInit();
	},

	buildFunctionMap : function() {
		// summary: Build the data structures from the "packageMap" file needed to display things.
		// description:
		//	Populates two objects:
		//		ApiRef.functionList	: a sorted array of all of the functions the parser told us about
		//		ApiRef.functionMap	: an object listing each function, and its:
		//				.type		: "module" "package" "class" or "method"
		//				.parserFile	: local_json file it comes from
		//				.pkg	: high-level object it can be found in (ie: for 'nested classes' listed under superclass)

		this.startProfile("buildFunctionMap");

		this.initFunctionMap();		
		this.sortFunctionMap();

		this.endProfile("buildFunctionMap");
	},
	
	initFunctionMap : function() {
		this.startProfile("initFunctionMap");

		var packageMap = this.packageMap;
				
		for (var packageName in packageMap) {
			var fnList = packageMap[packageName],
				nameSplit = packageName.split("."),
				leafName = nameSplit[nameSplit.length - 1]
			;

			// get the parserFile, which is the first two items of the packageName
			//  XXX I'm not sure this is always correct
			var parserFile = nameSplit.slice(0,2).join(".");

			// if entry ends with "_", it's a __package__ file -- strip off the "_"
			var itemName = packageName;//(leafName != "_" ? packageName : nameSplit.slice(0, nameSplit.length - 1).join(".")+".*");

			// add the package item itself to the map
			this.addFunctionToMap("isPackage", itemName, packageName, parserFile);

			for (var i = 0; i < fnList.length; i++) {
				var fn = fnList[i];
				
				if (fn.charAt(0) == "[") {
					if (this._debug) dojo.debug("Skipping array item: " + fn);
					continue;			
				}
				
				var typeFlag = "isMethod";
				this.addFunctionToMap(typeFlag, fn, packageName, parserFile);
				continue;
			}
		}
		this.endProfile("initFunctionMap");	
	},

	addFunctionToMap : function(typeFlag, name, pkg, parserFile) {
		// NOTE: this adds the items to the map in lower case, to speed sorting
		//	converted back to mixed-case in buildFunctionMap by looking at node.name
		if (!name) return;

		// handle case where an object is passed in
		//	(this indicates something that was pre-seeded in the list and being normalized)
		if (typeof pkg == "object") {
			this.functionMap[name] = pkg;
			return;
		}

		// make sure the ancestors have been added
		var ancestors = this.getAncestors(name),
			lastAncestor = null
		;
		for (var i = 0, len = ancestors.length; i < len; i++) {
			var ancestorName = ancestors[i],
				ancestor = this.functionMap[ancestorName]
			;

			if (ancestor == null) {
				var ancestorSplit = ancestorName.split(".");
				var ancestorFlag = (ancestorSplit[0] == "dojo" && ancestorSplit.length < 3 ? "isModule" : "isObject");

				ancestor = this.functionMap[ancestorName] = {
					name : ancestorName,
					title : this.getTitle(ancestorName),
					pkg : [(ancestorName == "dojo" ? "dojo" : pkg)],		// TOTAL HACK
					parserFile : (ancestorName == "dojo" ? "dojo" : parserFile),		// TOTAL HACK
					parentName : (lastAncestor ? lastAncestor.name : null)
				}
				ancestor[ancestorFlag] = ancestorFlag.charAt(2);
				if (this._looksLikeAClass(ancestorName)) this._setUpClass(ancestor);

			} else {
				// note that an item was installed from this pkg
// TOO SPAMMY -- ONLY ADD TO DIRECT ANCESTORS?
//				this._addPackage(ancestor.pkg, pkg);
				
			}
			ancestor.hasChildren = "K";
			ancestor.isObject = "O";
			lastAncestor = ancestor;
		}

//		if (lastAncestor) this._addPackage(lastAncestor.pkg, pkg);

		// now add the item itself
		var item = this.functionMap[name];
		// NOTE: check for typeof item == "function" to handle "toString" function name, which was conflicting with built-in obj.toString
		if (item == null || typeof item == "function") {
			item = this.functionMap[name] = {
				name : name,
				title : this.getTitle(name),
				pkg : [pkg],
				parserFile : parserFile,
				parentName : (lastAncestor ? lastAncestor.name : null)
			}
			if (this._looksLikeAClass(name)) this._setUpClass(item);
		} else {
//dojo.debug(name,item);
			// the item was already found
			// note that it was found in the specified package
			this._addPackage(item.pkg, pkg);

			//if (name != item.name) dojo.debug("!!! _add(",name,pkg,parserFile,"): item name was ",item.name);
			//if (pkg != item.pkg) dojo.debug("!!! _add(",name,pkg,parserFile,"): item pkg was ",item.pkg);
			//if (parserFile != item.parserFile) dojo.debug("!!! _add(",name,pkg,parserFile,"): item parserFile was ",item.parserFile);
		}
		item[typeFlag] = (typeFlag == "isMethod" ? "F" : typeFlag.charAt(2));
		
	},
	
	_addPackage : function(pkgList, pkg) {
		for (var i = 0, it; it = pkgList[i]; i++) {
			if (it == pkg) return;
		}
		pkgList.push(pkg);
	},


	sortFunctionMap : function() {
		// summary: Sort names of all functions in the unsortedMap and sort them
		this.endProfile("sortFunctionMap");
		
		var unsortedMap = this.functionMap;
		
		this.startProfile("sortFunctionMap:getList");
		var sortFnList = [];
		for (var fn in unsortedMap) {
			// put a "0" before functions, "1" before everything else 
			//	so loose functions sort above everything else (???)
			var item = unsortedMap[fn];
			sortFnList.push(fn.toLowerCase() + " " + fn);
		}
		this.endProfile("sortFunctionMap:getList");
		if (this._debug) dojo.debug("buildFunctionMap(): found " + sortFnList.length + " items");


		this.startProfile("sortFunctionMap:sort");
		sortFnList.sort();
		this.endProfile("sortFunctionMap:sort");


		// now re-build a sorted map based on the sorted list
		// note: we transform map back to case sensitive here
		// also populate this.functionList with the sorted names
		this.startProfile("sortFunctionMap:repopulate");
		var sortedList = this.functionList = [];
		var sortedMap = {};
		for (var i = 0, sortName; sortName = sortFnList[i]; i++) {
			var name = sortName.split(" ")[1],
				item = unsortedMap[name]
			;

			sortedMap[name] = item;
			sortedList.push(name);
		}
		this.endProfile("sortFunctionMap:repopulate");

		this.functionMap = sortedMap;
		this.endProfile("sortFunctionMap");
	},

	makeFunctionTree : function() {
		// summary: Make the function tree from the sorted list of functions.
		
		this.startProfile("makeFunctionTree");
		var sortedList = this.functionList;
		var sortedMap = this.functionMap;

		var fnTree = this.functionTree = [];		// tree of all functions, look in the "all", "methods" and "children" properties for kids
		var objTree = this.objectTree = [];			// tree of only non-function object -- look in the "children" property for kids
		for (var i = 0, len = sortedList.length; i < len; i++) {
			var name = sortedList[i],
				item = sortedMap[name],
				fnParent = (item.parentName ? sortedMap[item.parentName] : null)
			;
			if (fnParent) {
				if (fnParent.all == null) fnParent.all = [];
				fnParent.all.push(item);
			} else {
				fnTree.push(item);
			}
			
			// if the item is a method and the parent is present
			if (this.itemIsMethod(item)) {
				if (fnParent) {
					// add methods to fnParent.methods
					if (fnParent.methods == null) fnParent.methods = [];
					fnParent.methods.push(item);
				}
				
			} else if (item.isClass || item.hasChildren) {
				var objParent = (item.parentName ? sortedMap[item.parentName] : null);
				if (objParent) {
					if (objParent.children == null) objParent.children = [];
					objParent.children.push(item);
				} else{
					objTree.push(item);
				}
				
				// hack in the debug titles here
				if (this._debug) {
					item.title = [item.title, " <span class='tinyGray'>", this.getItemTypeString(item), "</span>"].join("");
				}
			}
		}
		this.endProfile("makeFunctionTree");	
	},

	
	_looksLikeAClass : function(name) {
		if (name.constructor == String) name = name.split(".");
		var firstChar = name[name.length - 1].charAt(0);
		return (firstChar != "_" && firstChar.toLowerCase() != firstChar  && isNaN(parseInt(firstChar)));
	},
	
	_setUpClass : function(item) {
		item.isClass = "C";
		item.constructor = {
			name : item.name,
			title : item.title,
			pkg : item.pkg,
			parserFile : item.parserFile,
			parentName : item.parentName,
			isMethod : "F"
		}
	},
	

	buildTreeWidget : function() {
		this.startProfile("buildTreeWidget");
		
		// create the tree and controller
		var controller = this.treeController = dojo.widget.createWidget("TreeBasicControllerV3");
		var selector = this.treeSelector = dojo.widget.createWidget("TreeSelectorV3");
		var hiliter = this.treeHiliter = dojo.widget.createWidget("TreeEmphasizeOnSelect", {selector:selector.widgetId});
		var treeWidget = this.treeWidget = dojo.widget.createWidget("TreeV3", {listeners: [selector.widgetId, controller.widgetId]});

		dojo.event.topic.subscribe(selector.eventNames.select, this, "onTreeSelect")

		treeWidget.setChildren(this.objectTree);
		// expand the tree to the first level
		controller.expandToLevel(treeWidget, 1);

		// after expanding, set things up so it'll wipe up and down when opened
//BUG:TREE there is a bug in the tree with the wipe toggle where it doesn't reset the height properly on closing
//		treeWidget.toggleObj = dojo.lfx.toggle.wipe;

		var displayEl = dojo.byId("fnTreeContainer");
		displayEl.innerHTML = "";
		displayEl.appendChild(treeWidget.domNode);
		
		this.endProfile("buildTreeWidget");
	},

	
	//
	//	debug stuff
	//

	debug_show : function(text) {
		var el = dojo.byId("debug");
		if (!el) el = dojo.byId("content");
		el.innerHTML = text;
	},

	
	debugMenuAction : function(action, el) {
		eval(action);
		el.selectedIndex = 0;
	},
	
	debug_toggleDebug : function() {
		this._debug = (this._debug ? false : true);
		this._autoDebugProfile = (this._profile && this._debug);
		dojo.io.cookie.setCookie("ApiRef_debug", ""+this._debug, 180);
		dojo.debug("Debugging is now " + (this._debug ? "on." : "off."));
	},
	
	debug_toggleProfile : function() {
		this._profile = (this._profile ? false : true);
		this._autoDebugProfile = (this._profile && this._debug);
		dojo.io.cookie.setCookie("ApiRef_profile", ""+this._profile, 180);
		dojo.debug("Profiling is now " + (this._profile ? "on." : "off."));
	},
		
	debug_showPackageMap : function() {
		this.debug_show("<H2>Package to function map (from local_json/function_names)</h2>"+ApiRef.objectToHtml(ApiRef.packageMap, true, null));
	},

	debug_showKnownFunctions : function() {
		this.debug_show("<H2>List of known functions:</h2>"+ApiRef.objectToHtml(this.functionList, true));
	},
	
	debug_showFunctionMap : function(showFunctions) {
		var map = this.functionMap;
		if (showFunctions == false) {
			var map = {};
			for (var prop in this.functionMap) {
				var item = this.functionMap[prop];
				if (this.itemIsMethod(item)) continue;
				map[prop] = this.functionMap[prop];
			}
		} else {
			var map = this.functionMap;	
		}

		var fieldList = ["type","parentName","parserFile","pkg"]
			getRowClassFn = function(prop, item) {
				var type = ApiRef.getItemTypeString(item);
				item.type = "<tt>"+type+"</tt>";
				return (ApiRef.itemIsMethod(item) ? "subtleRow" : "normalRow");
			}
		this.debug_show("<H2>Function -> Type Map</h2>"+ApiRef.objectToTable(map, fieldList, getRowClassFn));
	},

	debug_showObjectMap : function() {
		this.debug_showFunctionMap(false);
	},

	debug_showFunctionTree : function() {
		this.debug_show("<H2>Function tree:</h2>"+ApiRef.objectToHtml(ApiRef.functionTree, true, null));
	},
	debug_showFunctionTreeNames : function() {
		this.debug_show("<H2>Function tree:</h2>"+ApiRef.childMapToHtml(ApiRef.functionTree, true, null));
	},

	
	debug_showParserData : function(parserFile, parserData) {
		// summary:
		//	debug the entire parser output for a particular doc file

		if (parserData == null) {
			if (parserFile == null) {
				parserFile = prompt("Show data for which parser file?", dojo.io.cookie.getCookie("ApiRef_lastParserFile") || "dojo");
				if (parserFile == null) return;
				dojo.io.cookie.setCookie("ApiRef_lastParserFile", parserFile);
			}
			var callback = function() {
				var parserData = ApiRef.getParserData(parserFile);
				ApiRef.debug_show("<H2>Data for parser file '"+parserFile+"'</h2>"+ApiRef.objectToHtml(parserData, true, null));	
			}
			this.loadParserData(parserFile, callback);
		} else {
			ApiRef.debug_show("<H2>Data for parser file '"+parserFile+"'</h2>"+ApiRef.objectToHtml(parserData, true, null));	
		}
	},

	debug_showItemData : function(itemName) {
		// summary
		//	debug the parser output for a named reference
		if (itemName == null) {
			itemName = prompt("Show data for which item?", dojo.io.cookie.getCookie("ApiRef_lastItem") || "dojo");
			if (itemName == null) return;
			dojo.io.cookie.setCookie("ApiRef_lastItem", itemName);
		}
		var item = this.getItem(itemName);
		var callback = function() {
			var itemData = ApiRef.getItemData(item);
			var itemType = ApiRef.getItemTypeString(item);
			ApiRef.debug_show("<H2>Data for item '"+itemName+"' which looks like a "+itemType+"</h2>"+ApiRef.objectToHtml(itemData, true, null));	
		}
		this.loadParserData(item.parserFile, callback);
	},
	
	debug_showItem : function(itemName) {	
		if (itemName == null) {
			itemName = prompt("Show data for which item?", dojo.io.cookie.getCookie("ApiRef_lastItem") || "dojo");
			if (itemName == null) return;
			dojo.io.cookie.setCookie("ApiRef_lastItem", itemName);
		}
		var item = this.getItem(itemName);
		dojo.debug(item);
	},
	
	debug_showTodo : function() {
		window.open("ApiRef_todo.html", "todo");
	}

}


//
//	back-forward state
//
// NOTE: declaring this inline below was hosing safari
var fn = function init(name, type) {
	//dojo.debug("CREATING STATE: ", this.name, this.type);
	this.name = name; 
	this.type = type;
	this.changeUrl = this.name + (this.type ? ":" + this.type : "");
};
dojo.lang.declare(
	"ApiRef.BookmarkState", 
	null, 
	fn,
	{
		back : function() {
			//dojo.debug("BACK TO:", this.name, this.type);
			ApiRef.showItem(this.name, this.type, null, false);
		},
		
		forward : function() {
			//dojo.debug("FORWARD TO:", this.name, this.type);
			ApiRef.showItem(this.name, this.type, null, false);						
		}
	}
);


dojo.addOnLoad(dojo.lang.hitch(ApiRef, ApiRef.init));


// mix in the profiling helper code
dojo.lang.mixin(ApiRef, dojo.profile.ProfileHelper);
ApiRef._profile = false;
ApiRef._autoDebugProfile = false;



/** DEBUG STUFF -- MOVE EVENTUALLY **/

ApiRef.childMapToHtml = function (/*Object*/ it) {
	function getKidMap(obj) {
		if (!obj || !obj.children) return null;
		var output = {};
		for (var prop in obj.children) {
			var kid = obj.children[prop];
			output[prop] = getKidMap(kid);
		}
		return output;
	}
ApiRef.startProfile("debug:getKidMap");
	var kidMap = getKidMap(it);
ApiRef.endProfile("debug:getKidMap");
	return ApiRef.objectToHtml(kidMap);
}


ApiRef.objectToHtml = function(/*Object*/ it, /*Boolean*/ sort) {
	return "<pre class='objectOutput'>" + ApiRef.objectToString(it, sort) + "</pre>";
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
			it = it.replace(/>/g, "&gt;");
			it = it.replace(/</g, "&lt;");
	//		it = it.replace(/\n/g, "\\n");
			return '"' + it + '"';

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


// hack up ComoboBox._handleKeyEvents to make return and tab do the same thing
// I'm sure this could be done with aspect oriented programming, but I don't know how to do it...
dojo.widget.ComboBox.prototype.__handleKeyEvents = dojo.widget.ComboBox.prototype._handleKeyEvents;
dojo.widget.ComboBox.prototype._handleKeyEvents = function(/*Event*/ evt){
	var key = evt.key;
	if (key == dojo.event.browser.keys.KEY_ENTER) {
		evt.key = dojo.event.browser.keys.KEY_TAB;
	}
	return this.__handleKeyEvents(evt);
}