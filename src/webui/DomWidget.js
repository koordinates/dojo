dojo.hostenv.startPackage("dojo.webui.DomWidget");

doj.hostenv.loadModule("dojo.webui.Widget");

dojo.webui.DomWidget = function(){

	// mixin inheritance
	dojo.webui.Widget.call(this);

	this.addChild = function(widget){
	}

	this.domNode = null; // this is our visible representation of the widget!

	// method over-ride
	this.buildRendering = function(){
		// DOM widgets construct themselves from a template
		this.buildFromTemplate();
	}

	this.buildFromTemplate = function(){
		var node = null;
		// attempt to clone a template node, if there is one
		if(this.templateNode){ 	// usually provided as an attachment to the
								// prototype of the specialization
			node = this.templateNode.cloneNode(true);
		}else if(this.templateString){
			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations

		}

		if(!node){ return false; }

		// recurse through the node, looking for, and attaching to, our
		// attachment points which should be defined on the template node.
	}
	
	this.getContainerHeight = function(){
		return dojo.xml.htmlUtil.getInnerHeight(this.domNode.parentNode);
	}

	this.getContainerWidth = function(){
		return dojo.xml.htmlUtil.getInnerWidth(this.domNode.parentNode);
	}

	if(arguments.length>0){
		this.create(arguments[0]);
	}
}

dojo.webui.DomWidget.prototype.templateNode = null;
dojo.webui.DomWidget.prototype.templateString = null;

dj_inherits(dojo.webui.DomWidget, dojo.webui.Widget);

dojo.webui.HTMLWidget = function(args){
	// mixin inheritance
	dojo.webui.DomWidget.call(this);

	this.getContainerHeight = function(){
		// NOTE: container height must be returned as the INNER height
	}

	this.getContainerWidth = function(){
		return this.parent.domNode.offsetWidth;
	}

	this.setNativeHeight = function(height){
		var ch = this.getContainerHeight();
	}
}

dj_inherits(dojo.webui.HTMLWidget, dojo.webui.DomWidget);

dojo.webui.SVGWidget = function(){
	dojo.webui.DomWidget.call(this);
}

