dojo.hostenv.startPackage("dojo.webui.widgets.Parse");

dojo.hostenv.loadModule("dojo.webui.WidgetManager");
dojo.hostenv.loadModule("dojo.text.*");

dojo.webui.widgets.Parse = function(fragment) {
	this.propertySetsList = [];
	this.fragment = fragment;

	/*	createComponents recurses over a raw JavaScript object structure,
			and calls the corresponding handler for its normalized tagName if it exists
	*/
	this.createComponents = function(fragment, parentComp){
		var djTags = dojo.webui.widgets.tags;
		var returnValue = [];
		for(var item in fragment){
			// if we have items to parse/create at this level, do it!
			try{
				if( (fragment[item]["tagName"])&&
					(fragment[item] != fragment["nodeRef"])){
					var tn = new String(fragment[item]["tagName"]);
					// we split so that you can declare multiple
					// non-destructive widgets from the same ctor node
					var tna = tn.split(";");
					for(var x=0; x<tna.length; x++){
						var ltn = dojo.text.trim(tna[x]).toLowerCase();
						if(djTags[ltn]){
							fragment[item].tagName = ltn;
							returnValue.push(djTags[ltn](fragment[item], this, parentComp));
						}else{
							if(ltn.substr(0, 5)=="dojo:"){
								dj_debug("no tag handler registed for type: ", ltn);
							}
						}
					}
				}
			}catch(e){
				if(dojo.hostenv.is_debug_){ dj_debug(e); }
				// throw(e);
				// IE is such a bitch sometimes
			}

			// if there's a sub-frag, build widgets from that too
			if( (typeof fragment[item] == "object")&&
				(fragment[item] != fragment.nodeRef)&&
				(fragment[item] != fragment["tagName"])){
				returnValue.push(this.createComponents(fragment[item], parentComp));
			}
		}
		return returnValue;
	}

	/*  parsePropertySets checks the top level of a raw JavaScript object
			structure for any propertySets.  It stores an array of references to 
			propertySets that it finds.
	*/
	this.parsePropertySets = function(fragment) {
		var propertySets = [];
		for(var item in fragment){
			if(	(fragment[item]["tagName"] == "dojo:propertyset") ) {
				propertySets.push(fragment[item]);
			}
		}
		// FIXME: should we store these propertySets somewhere for later retrieval
		this.propertySetsList.push(propertySets);
		return propertySets;
	}
	
	/*  parseProperties checks a raw JavaScript object structure for
			properties, and returns an array of properties that it finds.
	*/
	this.parseProperties = function(fragment) {
		var properties = {};
		for(var item in fragment){
			// FIXME: need to check for undefined?
			// case: its a tagName or nodeRef
			if((fragment[item] == fragment["tagName"])||
				(fragment[item] == fragment.nodeRef)){
				// do nothing
			}else{
				if((fragment[item]["tagName"])&&
					(dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()])){
					// TODO: it isn't a property or property set, it's a fragment, 
					// so do something else
					// FIXME: needs to be a better/stricter check
					// TODO: handle xlink:href for external property sets
				}else if((fragment[item][0])&&(fragment[item][0].value!="")){
					try{
						// FIXME: need to allow more than one provider
						if(item.toLowerCase() == "dataprovider") {
							var _this = this;
							this.getDataProvider(_this, fragment[item][0].value);
							properties.dataProvider = this.dataProvider;
						}
						properties[item] = fragment[item][0].value;
						var nestedProperties = this.parseProperties(fragment[item]);
						// FIXME: this kind of copying is expensive and inefficient!
						for(var property in nestedProperties){
							properties[property] = nestedProperties[property];
						}
					}catch(e){ dj_debug(e); }
				/*
				}else if((fragment[item])&&(fragment[item].value!="")){
					//dj_debug(item+": "+fragment[item]);
					if(typeof fragment[item] == "object"){
						for(var x in fragment[item]){
							dj_debug("- "+x+": "+fragment[item][x]);
						}
					}
				*/
				}
			}
		}
		return properties;
	}

	/* getPropertySetById returns the propertySet that matches the provided id
	*/
	
	this.getDataProvider = function(objRef, dataUrl) {
		// FIXME: this is currently sync.  To make this async, we made need to move 
		//this step into the widget ctor, so that it is loaded when it is needed 
		// to populate the widget
		dojo.io.bind({
			url: dataUrl,
			load: function(type, evaldObj){
				if(type=="load"){
					objRef.dataProvider = evaldObj;
				}
			},
			mimetype: "text/javascript",
			sync: true
		});
	}

	
	this.getPropertySetById = function(propertySetId){
		for(var x = 0; x < this.propertySetsList.length; x++){
			if(propertySetId == this.propertySetsList[x]["id"][0].value){
				return this.propertySetsList[x];
			}
		}
		return "";
	}
	
	/* getPropertySetsByType returns the propertySet(s) that match(es) the
	 * provided componentClass
	 */
	this.getPropertySetsByType = function(componentType){
		var propertySets = [];
		for(var x=0; x < this.propertySetsList.length; x++){
			var cpl = this.propertySetsList[x];
			var cpcc = cpl["componentClass"]||cpl["componentType"]||null;
			if((cpcc)&&(propertySetId == cpcc[0].value)){
				propertySets.push(cpl);
			}
		}
		return propertySets;
	}
	
	/* getPropertySets returns the propertySet for a given component fragment
	*/
	this.getPropertySets = function(fragment){
		var ppl = "dojo:propertyproviderlist";
		var propertySets = [];
		var tagname = fragment["tagName"];
		if(fragment[ppl]){ 
			var propertyProviderIds = fragment[ppl].value.split(" ");
			// FIXME: should the propertyProviderList attribute contain #
			// 		  syntax for reference to ids or not?
			// FIXME: need a better test to see if this is local or external
			// FIXME: doesn't handle nested propertySets, or propertySets that
			// 		  just contain information about css documents, etc.
			for(propertySetId in propertyProviderIds){
				if((propertySetId.indexOf("..")==-1)&&(propertySetId.indexOf("://")==-1)){
					// get a reference to a propertySet within the current parsed structure
					var propertySet = this.getPropertySetById(propertySetId);
					if(propertySet != ""){
						propertySets.push(propertySet);
					}
				}else{
					// FIXME: add code to parse and return a propertySet from
					// another document
					// alex: is this even necessaray? Do we care? If so, why?
				}
			}
		}
		// we put the typed ones first so that the parsed ones override when
		// iteration happens.
		return (this.getPropertySetsByType(tagname)).concat(propertySets);
	}
	
	/* 
		nodeRef is the node to be replaced... in the future, we might want to add 
		an alternative way to specify an insertion point

		componentName is the expected dojo widget name, i.e. Button of ContextMenu

		properties is an object of name value pairs
	*/
	this.createComponentFromScript = function(nodeRef, componentName, properties) {
		var frag = {};
		var tagName = "dojo:" + componentName.toLowerCase();
		frag[tagName] = {};
		var bo = {};
		for(prop in properties){
			if(typeof bo[prop] == "undefined"){
				frag[tagName][prop.toLowerCase()] = [{value: properties[prop]}];
			}
		}
		frag[tagName]["dojotype"] = [{value: componentName}];
		frag[tagName].nodeRef = nodeRef;
		frag.tagName = tagName;
		var fragContainer = [frag];
		return this.createComponents(fragContainer);
	}
}


dojo.webui.widgets._parser_collection = {"dojo": new dojo.webui.widgets.Parse() };
dojo.webui.widgets.getParser = function(name){
	if(!name){ name = "dojo"; }
	if(!this._parser_collection[name]){
		this._parser_collection[name] = new dojo.webui.widgets.Parse();
	}
	return this._parser_collection[name];
}

dojo.webui.widgets.fromScript = function(parentNode, name, props){
	return dojo.webui.widgets.getParser().createComponentFromScript(parentNode, name, props);
}

dojo.webui.fromScript = dojo.webui.widgets.fromScript;
