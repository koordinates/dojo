dojo.hostenv.startPackage("dojo.webui.widgets.Parse");

dojo.webui.widgets.Parse = function(fragment) {
	this.propertySetsList = [];
	this.fragment = fragment;
	/*	createComponents recurses over a raw JavaScript object structure,
			and calls the corresponding handler for its normalized tagName if it exists
	*/

	this.createComponents = function(fragment) {
		var djTags = dojo.webui.widgets.tags;
		for(var item in fragment){
			try{
				if((fragment[item]["tagName"])&&(fragment[item] != fragment["nodeRef"])){
					var tn = new String(fragment[item]["tagName"]);
					if(djTags[tn.toLowerCase()]){
						djTags[tn.toLowerCase()](fragment[item], this);
					}
				}
			}catch(e){
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
		for (var item in fragment) {
			// FIXME: need to check for undefined?
			// case: its a tagName or nodeRef
			if((fragment[item] == fragment["tagName"]) || (fragment[item] == fragment.nodeRef)) {
				// do nothing
			} else {
				if((fragment[item]["tagName"])&&(dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()])){
					// TODO: it isn't a property or property set, it's a fragment, 
					// so do something else
					// FIXME: needs to be a better/stricter check
					// TODO: handle xlink:href for external property sets
				} else if (fragment[item][0] && fragment[item][0].value!="") {
					properties[item] = fragment[item][0].value;
					var nestedProperties = this.parseProperties(fragment[item]);
					for (var property in nestedProperties) {
						properties[property] = nestedProperties[property];
					}
				}
			}
		}
		return properties;
	}

	/* getPropertySetById returns the propertySet that matches the provided id
	*/
	
	this.getPropertySetById = function(propertySetId){
		for (propertySet in this.propertySetsList) {
			if(propertySetId == this.propertySetsList[propertySet]["id"][0].value) {
				return this.propertySetsList[propertySet]
			}
		}
		return "";
	}
	
	/* getPropertySetsByClass returns the propertySet(s) that match(es) the provided componentClass
	*/
	
	this.getPropertySetsByClass = function(propertySetClass){
		var propertySets = [];
		for (propertySet in this.propertySetsList) {
			if(this.propertySetsList[propertySet]["componentClass"] && (propertySetId == this.propertySetsList[propertySet]["componentClass"][0].value)) {
				propertySets.push(this.propertySetsList[propertySet]);
			}
		}
		return propertySets;
	}
	
	/* getPropertySets returns the propertySet for a given component fragment
	*/
	
	
	this.getPropertySets = function(fragment) {
		if(fragment["dojo:propertyproviderlist"]) { 
			var propertyProviderIds = fragment["dojo:propertyproviderlist"].value.split(" ") || fragment["dojo:propertyproviderlist"].value;
			var propertySetClass = fragment["tagName"];
			var propertySets = [];
			// FIXME: should the propertyProviderList attribute contain # syntax for reference to ids or not?
			// FIXME: need a better test to see if this is local or external
			// FIXME: doesn't handle nested propertySets, or propertySets that just contain information about css documents, etc.
			for (propertySetId in propertyProviderIds) {
				if(propertySetId.indexOf("..")==-1 && propertySetId.indexOf("://")==-1) {
					// get a reference to a propertySet within the current parsed structure
					var propertySet = this.getPropertySetById(propertySetId);
					if(propertySet != "") {
						propertySets.push(propertySet);
					}
				} else {
					// FIXME: add code to parse and return a propertySet from another document
				}
			}
			propertySets.push(this.getPropertySetsByClass(propertySetClass));
			return propertySets
		} else {
			return "";
		}
	}
}

// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from for things like getting propertySets
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone raw markup fragments/nodes as appropriate
dojo.webui.widgets.tags = {};

dojo.webui.widgets.tags["dojo:button"] = function(fragment, widgetParser) {
	dj_debug("starting to build a <button label='button' title='button'>button</button>");
	var propertySets = widgetParser.getPropertySets(fragment);
	// FIXME: should we take each propertySet and parse it into properties at this point?
	var localProperties = widgetParser.parseProperties(fragment);
	for (prop in localProperties) {
		dj_debug("localProperties: "+prop+": "+localProperties[prop]);
	}

	dj_debug(dojo.webui.widgetManager.getImplementationName("button"));
	var tbutton = dojo.webui.widgetManager.getImplementation("button");
	// tbutton.create(fragment);
	tbutton.create(localProperties);
	var nr = fragment["dojo:button"].nodeRef;
	/*
	var tn = document.createElement("div");
	tn.innerHTML = "this is a temporary node";
	nr.parentNode.replaceChild(tn, nr);
	*/
	// nr.parentNode.replaceChild(tbutton.domNode, nr);
	document.body.appendChild(tbutton.domNode);
	// alert(tbutton.domNode.parentNode.innerHTML);
}

dojo.webui.widgets.tags["dojo:propertyset"] = function(fragment, widgetParser) {
	// FIXME: Is this needed?
	// FIXME: Not sure that this parses into the structure that I want it to parse into...
	// FIXME: add support for nested propertySets
	var properties = widgetParser.parseProperties(fragment);
}
