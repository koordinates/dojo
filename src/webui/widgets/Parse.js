if(!dojo){ dojo = {}; }
if(!dojo.webui){ 
	dojo.webui = {};
}
if(!dojo.webui.widgets){ 
	dojo.webui.widgets = {};
}

// for loading script:
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

// TODO: should have a more general way to add tags or tag libraries?
// TODO: need a default tags class to inherit from
// TODO: parse properties/propertySets into component attributes
// TODO: parse subcomponents
// TODO: copy/clone HTML fragments as appropriate
dojo.webui.widgets.tags = {};
dojo.webui.widgets.tags["div"] = function() {
	alert("found a div");
	// TODO: should I then parse DIVs based on their dojoType, or should I instead 
	// do that at the top level?... meaning that I could do something analogous to 
	// dojo.webui.widgets.tags[fragment[item]["dojoType"]== "button"]
}
dojo.webui.widgets.tags["dojo:button"] = function() {
	alert("found a button");
}
dojo.webui.widgets.tags["button"] = dojo.webui.widgets.tags["dojo:button"];
