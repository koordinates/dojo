dojo.provide("dijit.util.parser");

dojo.require("dijit.util.manager");
dojo.require("dojo.date.stamp");

dijit.util.parser = new function(){

	function val2type(/*Object*/ value){
		// summary:
		//		Returns name of type of given value.

		if(dojo.isString(value)){ return "string"; }
		if(typeof value == "number"){ return "number"; }
		if(typeof value == "boolean"){ return "boolean"; }
		if(dojo.isFunction(value)){ return "function"; }
		if(dojo.isArray(value)){ return "array"; } // typeof [] == "object"
		if(value instanceof Date) { return "date"; } // assume timestamp
		if(value instanceof dojo._Url){ return "url"; }
		return "object";
	}

	function str2obj(/*String*/ value, /*String*/ type){
		// summary:
		//		Convert given string value to given type
		switch(type){
			case "string":
				return value;
			case "number":
				return value.length ? Number(value) : null;
			case "boolean":
				return typeof value == "boolean" ? value : !(value.toLowerCase()=="false");
			case "function":
				if(dojo.isFunction(value)){
					return value;
				}
				try{
					if(value.search(/[^\w\.]+/i) != -1){
						// TODO: "this" here won't work
						value = dijit.util.parser._nameAnonFunc(new Function(value), this);
					}
					return dojo.getObject(value, false);
				}catch(e){ return new Function(); }
			case "array":
				return value.split(";");
			case "date":
				return dojo.date.stamp.fromISOString(value);
			case "url":
//PORT FIXME: is value absolute or relative?  Need to join with "/"?
				return dojo.baseUrl + value;
			default:
				try{ eval("var tmp = "+value); return tmp; }
				catch(e){ return value; }
		}
	}

	var widgetClasses = {
		// map from fully qualified name (like "dijit.Button") to structure like
		// { cls: dijit.Button, params: {caption: "string", disabled: "boolean"} }
	};
	
	function getWidgetClassInfo(/*String*/ className){
		// className:
		//		fully qualified name (like "dijit.Button")
		// returns:
		//		structure like
		//			{ 
		//				cls: dijit.Button, 
		//				params: { caption: "string", disabled: "boolean"}
		//			}

		if(!widgetClasses[className]){
			// get pointer to widget class
			var cls = dojo.getObject(className);
			if(!dojo.isFunction(cls)){
				throw new Error("Could not load widget '" + className +
					"'. Did you spell the name correctly and use a full path, like 'dijit.form.Button'?");
			}
			var proto = cls.prototype;
	
			// get table of parameter names & types
			var params={};
			for(var name in proto){
				if(name.charAt(0)=="_"){ continue; } 	// skip internal properties
				var defVal = proto[name];
				params[name]=val2type(defVal);
			}

			widgetClasses[className] = { cls: cls, params: params };
		}
		return widgetClasses[className];
	}
	
	this.instantiate = function(nodes){
		// summary:
		//		Takes array of nodes, and turns them into widgets Calls their
		//		layout method to allow them to connect with any children		
		var thelist = [];
		dojo.forEach(nodes, function(node){
			if(!node){ return; }
			var type = node.getAttribute('dojoType');
			if((!type)||(!type.length)){ return; }
			var clsInfo = getWidgetClassInfo(type);
			var params = {};
			for(var attrName in clsInfo.params){
				var attrValue = node.getAttribute(attrName);
				if(attrValue != null){
					var attrType = clsInfo.params[attrName];
					params[attrName] = str2obj(attrValue, attrType);
				}
			}
			thelist.push(new clsInfo.cls(params, node));
			var jsname = node.getAttribute('jsId');
			if(jsname){
				dojo.setObject(jsname, thelist[thelist.length-1]);
			}
		});

		// Call startup on each top level widget.  Parent widgets will
		// recursively call startup on their (non-top level) children
		dojo.forEach(thelist, function(widget){
			if(widget && widget.startup && (!widget.getParent || widget.getParent()==null)){
				widget.startup();
			}
		});
		return thelist;
	};

	this.parse = function(/*DomNode?*/ rootNode){
		// summary:
		//		Search specified node (or root node) recursively for widgets,
		//		and instantiate them Searches for
		//		dojoType="qualified.class.name"
		var list = dojo.query('[dojoType]', rootNode);
		return this.instantiate(list);
	};
}();

dojo.addOnLoad(function(){ dijit.util.parser.parse(); });

//TODO: ported from 0.4.x Dojo.  Can we reduce this?
dijit.util.parser._anonCtr = 0;
dijit.util.parser._anon = {}; // why is this property required?
dijit.util.parser._nameAnonFunc = function(/*Function*/anonFuncPtr, /*Object*/thisObj, /*Boolean*/searchForNames){
	// summary:
	//		Creates a reference to anonFuncPtr in thisObj with a completely
	//		unique name. The new name is returned as a String.  If
	//		searchForNames is true, an effort will be made to locate an
	//		existing reference to anonFuncPtr in thisObj, and if one is found,
	//		the existing name will be returned instead. The default is for
	//		searchForNames to be false.
	var jpn = "$joinpoint";
	var nso = (thisObj|| dijit.util.parser._anon);
	if(dojo.isIE){
		var cn = anonFuncPtr["__dojoNameCache"];
		if(cn && nso[cn] === anonFuncPtr){
			return anonFuncPtr["__dojoNameCache"];
		}else if(cn){
			// hack to see if we've been event-system mangled
			var tindex = cn.indexOf(jpn);
			if(tindex != -1){
				return cn.substring(0, tindex);
			}
		}
	}
	var ret = "__"+dijit.util.parser._anonCtr++;
	while(typeof nso[ret] != "undefined"){
		ret = "__"+dijit.util.parser._anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret; // String
}
