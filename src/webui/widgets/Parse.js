dojo.hostenv.startPackage("dojo.webui.widgets.Parse");

dojo.hostenv.loadModule("dojo.webui.WidgetManager");

dojo.webui.widgets.Parse = function(fragment) {
	this.propertySetsList = [];
	this.fragment = fragment;

	/*	createComponents recurses over a raw JavaScript object structure,
			and calls the corresponding handler for its normalized tagName if it exists
	*/
	this.createComponents = function(fragment) {
		var djTags = dojo.webui.widgets.tags;
		for(var item in fragment){
			if(fragment[item]["tagName"]) {
			}
			try{
				if((fragment[item]["tagName"])&&
				(fragment[item] != fragment["nodeRef"])){
						var tn = new String(fragment[item]["tagName"]);
						if(djTags[tn.toLowerCase()]){
						// dj_debug(tn);
						// dj_debug(djTags[tn.toLowerCase()]);
						djTags[tn.toLowerCase()](fragment[item], this);
					}
				}
			}catch(e){
				// throw(e);
				// IE is such a bitch sometimes
			}
			if( (typeof fragment[item] == "object")&&
				(fragment[item] != fragment.nodeRef)&&
				(fragment[item] != fragment["tagName"])){
				this.createComponents(fragment[item]);
			}
		}
	}

	/*  parsePropertySets checks the top level of a raw JavaScript object
			structure for any propertySets.  It stores an array of references to 
			propertySets that it finds.
	*/
	this.parsePropertySets = function(fragment) {
		this.propertySets = [];
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
			// dj_debug(x);
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
			var propertyProviderIds = fragment[ppl].value.split(" ") || fragment[ppl].value;
			// FIXME: should the propertyProviderList attribute contain # syntax for reference to ids or not?
			// FIXME: need a better test to see if this is local or external
			// FIXME: doesn't handle nested propertySets, or propertySets that just contain information about css documents, etc.
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
		for (prop in properties) {
			frag[tagName][prop.toLowerCase()] = [{value: properties[prop]}];
		}
		frag[tagName]["dojotype"] = [{value: componentName}];
		frag[tagName].nodeRef = nodeRef;
		frag.tagName = tagName;
		var fragContainer = [frag];
		this.createComponents(fragContainer);
	}
}
