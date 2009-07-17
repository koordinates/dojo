dojo.provide("dojo.parser-face");
dojo.required("dojo.parser");

dojo.parser = function(){
	// summary: The Dom/Widget parsing package

	var dtName = dojo._scopeName + "Type";
	var qry = "[" + dtName + "]";

	var _anonCtr = 0, _anon = {};
	var nameAnonFunc = function(/*Function*/anonFuncPtr, /*Object*/thisObj){
		// summary:
		//		Creates a reference to anonFuncPtr in thisObj with a completely
		//		unique name. The new name is returned as a String. 
		var nso = thisObj || _anon;
		var cn = anonFuncPtr.__dojoNameCache;
		if(cn && nso[cn] === anonFuncPtr){
			return cn;
		}
		var name;
		do{
			name = "__" + _anonCtr++;
		}while(name in nso);
		nso[name] = anonFuncPtr;
		return name; // String
	};

	function val2type(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.

		if(typeof value == 'string'){ return "string"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(typeof value == "function"){ return "function"; }
		if(dojo.isArray(value)){ return "array"; } // typeof [] == "object"
		if(dojo.isDate(value)) { return "date"; } // assume timestamp
		if(value instanceof dojo._Url){ return "url"; }
		return "object";
	}

	function str2obj(/*String*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "number":
				return value.length ? Number(value) : NaN;
			case "boolean":
				// for checked/disabled value might be "" or "checked".  interpret as true.
				return typeof value == "boolean" ? value : !(value.toLowerCase()=="false");
			case "function":				
				try{
					if(value.search(/[^\w\.]+/i) != -1){
						// TODO: "this" here won't work
						value = nameAnonFunc(new Function(value), this);
					}
					return dojo.getObject(value, false);
				}catch(e){}
				return new Function();
			case "array":
				return value ? value.split(/\s*,\s*/) : [];
			case "date":
				switch(value){
				case "":
					return new Date("");	// the NaN of dates
				case "now":
					return new Date();	// current date		
				}
				return dojo.date.stamp.fromISOString(value);
			case "url":
				return dojo.baseUrl + value;
			default:
				return dojo.fromJson(value);
		}
	}

	var instanceClasses = {
		// map from fully qualified name (like "dijit.Button") to structure like
		// { cls: dijit.Button, params: {label: "string", disabled: "boolean"} }
	};
	
	function getClassInfo(/*String*/ className){
		// className:
		//		fully qualified name (like "dijit.form.Button")
		// returns:
		//		structure like
		//			{ 
		//				cls: dijit.Button, 
		//				params: { label: "string", disabled: "boolean"}
		//			}

		if(!instanceClasses[className]){

			// get pointer to widget class

			var cls = dojo.getObject(className);
			if(typeof cls != 'function'){
				throw new Error("Could not load class '" + className +
					"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
			}
			var proto = cls.prototype;
	
			// get table of parameter names & types
			var params = {}, dummyClass = {};
			for(var name in proto){
				if(name.charAt(0)=="_"){ continue; } 	// skip internal properties
				if(name in dummyClass){ continue; }		// skip "constructor" and "toString"
				var defVal = proto[name];
				params[name]=val2type(defVal);
			}

			instanceClasses[className] = { cls: cls, params: params };
		}
		return instanceClasses[className];
	}

	this._functionFromScript = function(script){
		var preamble = "";
		var suffix = "";
		var argsStr = script.getAttribute("args");
		if(argsStr){
			dojo.forEach(argsStr.split(/\s*,\s*/), function(part, idx){
				preamble += "var "+part+" = arguments["+idx+"]; ";
			});
		}
		var withStr = script.getAttribute("with");
		if(withStr && withStr.length){
			dojo.forEach(withStr.split(/\s*,\s*/), function(part){
				preamble += "with("+part+"){";
				suffix += "}";
			});
		}
		return new Function(preamble+script.innerHTML+suffix);
	};

	this.instantiate = function(/* Array */nodes, /* Object? */mixin){
		// summary:
		//		Takes array of nodes, and turns them into class instances and
		//		potentially calls a layout method to allow them to connect with
		//		any children		
		// mixin: Object
		//		An object that will be mixed in with each node in the array.
		//		Values in the mixin will override values in the node, if they
		//		exist.
		var thelist = [];
		mixin = mixin || {};

		dojo.forEach(nodes, function(node) {
			if(!node){ return; }

			var value, type = dtName in mixin?mixin[dtName]:node.getAttribute(dtName);
			if(!type || !type.length){ return; }
			var clsInfo = getClassInfo(type),
				clazz = clsInfo.cls,
				ps = clazz._noScript || clazz.prototype._noScript;

			// read parameters (attributes)

			// clsInfo.params lists expected params like {"checked": "boolean", "n": "number"}
			// use null for standard attributes to convert automatically

			var params = {};
			var expectedType;

			// For backward compatibility
			// Copy className to class

			if ('className' in mixin && !('class' in mixin)) {
				mixin['class'] = mixin.className;
			}

			var classParams = clsInfo.params;

			for(var name in classParams){
				if (dojo.isOwnProperty(classParams, name)) {
					var isStyle = /^style$/i.test(name);
					value = undefined;
					if (name in mixin) {
						value = mixin[name];
					} else {
						if (dojo.hasAttr(node, name)) {

							// Get property, with exception of style

							value = (isStyle ? dojo.realAttr : dojo.attr)(node, name);

							// Undefined result is an expando or missing attribute (e.g. onclick in FF)
							// Try real getAttribute

							if (typeof value == 'undefined') {
								value = node.getAttribute(name);
							}
						}
					}
					if (value !== undefined) {
						expectedType = clsInfo.params[name];

						// Convert custom attributes as specified, making sure style is not

						if (expectedType !== null && typeof value == 'string' && expectedType != 'string' && !isStyle) {
							value = str2obj(value, expectedType);
						}
						params[name] = value;
					}
				}
			}

			// Process <script type="dojo/*"> script tags
			// <script type="dojo/method" event="foo"> tags are added to params, and passed to
			// the widget on instantiation.
			// <script type="dojo/method"> tags (with no event) are executed after instantiation
			// <script type="dojo/connect" event="foo"> tags are dojo.connected after instantiation
			// note: dojo/* script tags cannot exist in self closing widgets, like <input />

			if(!ps){
				var connects = [],	// functions to connect after instantiation
					calls = [];	// functions to call after instantiation

				var query = dojo.query("> script[type^='dojo/']", node);
				if (query.orphan) {
					query.orphan().forEach(function(script){
						var event = script.getAttribute("event"),
							type = script.getAttribute("type"),
							nf = dojo.parser._functionFromScript(script);
						if(event){
							if(type == "dojo/connect"){
								connects.push({event: event, func: nf});
							}else{
								params[event] = nf;
							}
							}else{
							calls.push(nf);
						}
					});
				} else {
					console.log('No orphan method for ' + node.id);
				}
			}

			var markupFactory = clazz.markupFactory;
			if(!markupFactory && clazz.prototype){
				markupFactory = clazz.prototype.markupFactory;
			}

			// create the instance

			var instance = markupFactory ? markupFactory(params, node, clazz) : new clazz(params, node);
			thelist.push(instance);

			// map it to the JS namespace

			var jsname = node.getAttribute("jsId");

			if (jsname) {
				dojo.setObject(jsname, instance);
			}

			// process connections and startup functions
			if (!ps) {
				dojo.forEach(connects, function(connect){
					dojo.connect(instance, connect.event, null, connect.func);
				});
				dojo.forEach(calls, function(func){
					func.call(instance);
				});
			}
		});

		// Call startup on each top level instance if it makes sense (as for
		// widgets).  Parent widgets will recursively call startup on their
		// (non-top level) children
		dojo.forEach(thelist, function(instance){
			if(	instance  && 
				instance.startup &&
				!instance._started && 
				(!instance.getParent || !instance.getParent())
			){
				instance.startup();
			}
		});
		return thelist;
	};

	this.parse = function(/*DomNode?*/ rootNode){
		// summary:
		//		Search specified node (or root node) recursively for class instances,
		//		and instantiate them Searches for
		//		dojoType="qualifieddojo.class.name"

		var list = dojo.query(qry, rootNode);

		// go build the object instances

		var instances = this.instantiate(list);
		return instances;
	};
};

// NOTE: Odd structure

dojo.parser.call(dojo.parser);

// Register the parser callback. It should be the first callback
// after the a11y test.

(function(){
	var parseRunner = function(){ 
		if(dojo.config.parseOnLoad){
			dojo.parser.parse(); 
		}
	};

	// FIXME: need to clobber cross-dependency!!

	if(dojo.exists("dijit.wai.onload") && (dijit.wai.onload === dojo._loaders[0])){
		dojo._loaders.splice(1, 0, parseRunner);
	}else{
		dojo._loaders.unshift(parseRunner);
	}
})();