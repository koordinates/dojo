if(!dojo){ dojo = {}; }
if(!dojo.webui){ 
	dojo.webui = {};
}
if(!dojo.webui.widgets){ 
	dojo.webui.widgets = {};
}

// for loading script:
// TODO: my naming conventions here leave much to be desired... I'll blame it 
// on the cold I'm battling
dojo.webui.widgets.Parse = {};

dojo.webui.widgets.Parse.ParseFragment = function() {
	
}

dojo.webui.widgets.Parse.ParseFragment.prototype.createComponents = function(fragment) {
	for (var item in fragment) {
		if(dojo.webui.widgets.tags[item.toLowerCase()]) {
			dojo.webui.widgets.tags[item.toLowerCase()](fragment[item]);
		}
		if(typeof fragment[item] == "object" && fragment[item] != fragment.nodeRef) {
			this.createComponents(fragment[item]);
		}
	}
}

dojo.webui.widgets.Parse.ParseProperties = function() {
	
}

dojo.webui.widgets.Parse.ParseProperties.prototype.createProperties = function(fragment) {
	var properties = {};
	for (var item in fragment) {
		if(dojo.webui.widgets.tags[item.toLowerCase()]) {
			// TODO: it isn't a property or property set, it's a fragment, so do something else
			// TODO: handle xlink:href for external property sets
		} else { 
			if(fragment[item][0] && fragment[item][0].value) {
				properties[fragment[item][0]] = fragment[item][0].value;
			}
			if(typeof fragment[item] == "object" && fragment[item] != fragment.nodeRef) {
				// check for nested properties
				this.createProperties(fragment[item]);
			}
		}
	}
	return properties;
}



// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone raw markup fragments/nodes as appropriate
dojo.webui.widgets.tags = {};
dojo.webui.widgets.tags["div"] = function(fragment) {
	//alert("found a div");
	// TODO: should I then parse DIVs based on their dojoType, or should I instead 
	// do that at the top level?... meaning that I could do something analogous to 
	// dojo.webui.widgets.tags[fragment[item]["dojoType"]== "button"]
}
dojo.webui.widgets.tags["dojo:button"] = function(fragment) {
	var propertyParser = new dojo.webui.widgets.Parse.ParseProperties();
	this.properties = propertyParser.createProperties(fragment);
	// now we have all of the properties, so we need to instantiate a component
	// and set its properties... in fact, the two lines above are probably generic 
	// for all components as they are written currently
}
dojo.webui.widgets.tags["button"] = dojo.webui.widgets.tags["dojo:button"];
