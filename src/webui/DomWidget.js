dojo.hostenv.startPackage("dojo.webui.DomWidget");

dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

dojo.webui.DomWidget = function(){

	// mixin inheritance
	dojo.webui.Widget.call(this);

	this.attachProperty = "dojoAttachPoint";

	this.domNode = null; // this is our visible representation of the widget!

	this.addChild = function(widget){
		if(!this.isContainer){
			dj_debug("dojo.webui.DomWidget.addChild() attempted on non-container widget");
			return false; // we aren't allowed to contain other widgets, it seems
		}
	}

	// method over-ride
	this.buildRendering = function(){
		// DOM widgets construct themselves from a template
		this.buildFromTemplate();
		this.fillInTemplate();
	}

	this.buildFromTemplate = function(){
		var node = null;
		// attempt to clone a template node, if there is one
		if((!this.templateNode)&&(this.templateString)){
			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations
			node = this.createNodesFromText(this.templateString, true);
			this.templateNode = node[0].cloneNode(true); // we're optimistic here
		}
		var node = this.templateNode.cloneNode(true);

		if(!node){ return false; }

		// recurse through the node, looking for, and attaching to, our
		// attachment points which should be defined on the template node.

		this.domNode = node;
		this.attachTemplateNodes(this.domNode);
	}

	this.attachTemplateNodes = function(baseNode){
		// if a "template attach point" method was installed on this widget class, use it!
		if(!baseNode){ 
			baseNode = this.domNode;
			// FIXME: is this going to have capitalization problems?
			var aa = this.domNode.getAttribute(this.attachProperty);
			if(aa){
				// __log__.debug(aa);
				this[aa]=baseNode;
			}
		}
		for(var x=0; x<baseNode.childNodes.length; x++){
			var tn = baseNode.childNodes[x];
			if(tn.nodeType!=1){ continue; }
			var aa = dojo.xml.htmlUtil.getAttr(tn, this.attachProperty);
			if(aa){
				// __log__.debug(aa);
				this[aa]=tn;
			}
			if(tn.childNodes.length>0){
				this.attachTemplateNodes(tn);
			}
		}
	}

	this.fillInTemplate = function(){
		dj_unimplemented("dojo.webui.DomWidget.fillInTemplate");
	}
	
	this.getContainerHeight = function(){
		// FIXME: the generic DOM widget shouldn't be using HTML utils!
		return dojo.xml.htmlUtil.getInnerHeight(this.domNode.parentNode);
	}

	this.getContainerWidth = function(){
		// FIXME: the generic DOM widget shouldn't be using HTML utils!
		return dojo.xml.htmlUtil.getInnerWidth(this.domNode.parentNode);
	}

	this.createNodesFromText = function(){
		dj_unimplemented("dojo.webui.DomWidget.createNodesFromText");
	}

	if(arguments.length>0){
		this.create(arguments[0]);
	}
}

dojo.webui.DomWidget.prototype.templateNode = null;
dojo.webui.DomWidget.prototype.templateString = null;

dj_inherits(dojo.webui.DomWidget, dojo.webui.Widget);

// HTMLWidget is a mixin ONLY
dojo.webui.HTMLWidget = function(args){
	// mixin inheritance
	// dojo.webui.DomWidget.call(this);

	this.getContainerHeight = function(){
		// NOTE: container height must be returned as the INNER height
		dj_unimplemented("dojo.webui.HTMLWidget.getContainerHeight");
	}

	this.getContainerWidth = function(){
		return this.parent.domNode.offsetWidth;
	}

	this.setNativeHeight = function(height){
		var ch = this.getContainerHeight();
	}

	this.createNodesFromText = function(txt, wrap){
		// alert("HTMLWidget.createNodesFromText");
		var tn = document.createElement("span");
		// tn.style.display = "none";
		tn.style.visibility= "hidden";
		document.body.appendChild(tn);
		tn.innerHTML = txt;
		tn.normalize();
		if(wrap){ 
			var ret = [tn.cloneNode(true)];
			return ret;
		}
		var nodes = [];
		for(var x=0; x<tn.childNodes.length; x++){
			nodes.push(tn.childNodes[x].cloneNode(true));
		}
		// tn.style.display = "none";
		return nodes;
	}
}

dj_inherits(dojo.webui.HTMLWidget, dojo.webui.DomWidget);

// SVGWidget is a mixin ONLY
dojo.webui.SVGWidget = function(){
	// dojo.webui.DomWidget.call(this);
}

