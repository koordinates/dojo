// FIXME: Dylan, "Parse" should be "parse" since it's only being used as a
// singleton, and not a class. Please fix.
dojo.hostenv.startPackage("dojo.webui.widgets.Parse");
// dojo.webui.widgets.Parse = {};

dojo.webui.widgets.Parse.ParseFragment = function() {
	
}

dojo.webui.widgets.Parse.ParseFragment.prototype.createComponents = function(fragment) {
	for(var item in fragment){
		if(	(fragment[item].tagName)&&(fragment[item] != fragment.nodeRef)&&
			(dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()]) ){
			dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()](fragment[item]);
		}
		if((typeof fragment[item] == "object")&&(fragment[item] != fragment.nodeRef)&&(fragment[item] != fragment.tagName)){
			this.createComponents(fragment[item]);
		}
	}
}

// FIXME: Dylan, why is this a class?
dojo.webui.widgets.Parse.ParseProperties = function() {
	
}

dojo.webui.widgets.Parse.ParseProperties.prototype.createProperties = function(fragment) {
	var properties = {};
	for (var item in fragment) {
		// case: its a tagName or nodeRef
		if((fragment[item] == fragment.tagName) || (fragment[item] != fragment.nodeRef)) {
			// do nothing
		} else if(fragment[item]) {
			if(fragment[item].tagName && dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()]) {
				// TODO: it isn't a property or property set, it's a fragment, so do something else
				// TODO: handle xlink:href for external property sets
			}
			if(fragment[item][0] && fragment[item][0].value) {
					properties[fragment[item][0]] = fragment[item][0].value;
			}
			if(typeof fragment[item] == "object") {
					// check for nested properties
					this.createProperties(fragment[item]);
			}			
		}
	}
	return properties;
}

dojo.webui.widgets.Parse.ParseProperties.prototype.getPropertySets = function(propertyProviderList, fragment) {
	var propertyProviders = propertyProviderList.split(" ") || propertyProviderList;
	for (var propertySet in propertyProviders) {
		// FIXME: should the propertyProviderList attribute contain # syntax for reference to ids or not?
		// FIXME: need a better test to see if this is local or external
		// FIXME: doesn't handle nested propertySets, or propertySets that just contain information about css documents, etc.
		if(propertySet.indexOf("..")==-1 && propertySet.indexOf("://")==-1) {
			// get a reference to a propertySet within the current parsed structure
			return this.findPropertySet(propertySet,fragment);
		} else {
			// FIXME: add code to parse and return a propertySet from another document
		}
	}
}

dojo.webui.widgets.Parse.ParseProperties.prototype.findPropertySet = function(name,fragment) {
	for (var item in fragment) {
		if (fragment[item].tagName && fragment[item]["id"] && fragment[item].tagName=="dojo:propertySet" && fragment[item]["id"][0] == name) {
			return dojo.webui.widgets.tags[fragment[item].tagName.toLowerCase()]
		} else {
			// FIXME: does this make sense?
			if(fragment[item].tagName && fragment[item] != fragment.nodeRef) {
				return this.findPropertySet(name,fragment[item]);
			}
		}
	} 
}


// FIXME: propertySet stuff doesn't work yet... in progress
// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone raw markup fragments/nodes as appropriate
dojo.webui.widgets.tags = {};
dojo.webui.widgets.tags["div"] = function(fragment) {
	// Because a div is not a dojo component, you don't really want this here.
	var propertyParser = new dojo.webui.widgets.Parse.ParseProperties();
	var propertySets = (fragment["DIV"]["dojo:propertyproviderlist"] && fragment["DIV"]["dojo:propertyproviderlist"][0]) ? propertyParser.getPropertySets(fragment["DIV"]["dojo:propertyproviderlist"][0].value, fragment) : "";
	var localProperties = propertyParser.createProperties(fragment);
	// FIXME: Now do something with these propertySets and local Properties
}
dojo.webui.widgets.tags["dojo:button"] = function(fragment) {
	var propertyParser = new dojo.webui.widgets.Parse.ParseProperties();
	// FIXME: need a more elegant way for the next if block

	// FIXME: dylan, I don't understand at all why we care what the tag's
	// container tag name is if we're going to be passing in node as one of the
	// properties. I'm just really confused by this. Wouldn't we have already
	// filtered by the time we hit this function?

	var tagContainerName = "";
	if (fragment["DOJO:BUTTON"]) {
		tagContainerName = "DOJO:BUTTON";
	} else if (fragment["BUTTON"]) {
		tagContainerName = "BUTTON";
	} else if (fragment["dojo:button"]) {
		tagContainerName = "dojo:button";
	} else if (fragment["button"]) {
		tagContainerName = "button";
	} else if (fragment["DIV"]) {
		tagContainerName = "DIV";
	} else if (fragment["div"]) {
		tagContainerName = "div";
	} 
	
	// FIXME: needs to pass the top level fragment as its parent rather than the current fragment...
	var propertySets = (tagContainerName && fragment[tagContainerName] && fragment[tagContainerName]["dojo:propertyproviderlist"] && fragment[tagContainerName]["dojo:propertyproviderlist"][0])  ? propertyParser.getPropertySets(fragment[tagContainerName]["dojo:propertyproviderlist"][0].value, fragment) : "";
	var localProperties = propertyParser.createProperties(fragment);
	// FIXME: Now do something with these propertySets and local Properties
}

dojo.webui.widgets.tags["dojo:propertySet"] = function(fragment) {
	var propertyParser = new dojo.webui.widgets.Parse.ParseProperties();
	// FIXME: add support for nested propertySets
	// var propertySets = (fragment[propertyProviderList]) ? propertyParser.getPropertySets(fragment[propertyProviderList], fragment) : "";
	return propertyParser.createProperties(fragment);
}
