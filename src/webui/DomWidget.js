dojo.hostenv.startPackage("dojo.webui.DomWidget");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.text.*");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.xml.domUtil");
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

dojo.webui.DomWidget = function(){

	// mixin inheritance
	dojo.webui.Widget.call(this);

	this.attachProperty = "dojoAttachPoint";
	this.eventAttachProperty = "dojoAttachEvent";

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
		this.fillInTemplate(20, 20, 12, "testing", "ellipse"); 	// this is where individual widgets will handle
								// population of data from properties, remote
								// data sets, etc.
	}

	this.buildFromTemplate = function(){
		var node = null;
		// attempt to clone a template node, if there is one
		if((!this.templateNode)&&(this.templateString)){
			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations
			node = this.createNodesFromText(this.templateString(20, 20, 12, "testing", "ellipse"), true);
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
		var elementNodeType = dojo.xml.domUtil.nodeTypes.ELEMENT_NODE;

		if(!baseNode){ 
			baseNode = this.domNode;
		}

		if(baseNode.nodeType != elementNodeType){
			return;
		}

		// FIXME: is this going to have capitalization problems?
		var attachPoint = this.domNode.getAttribute(this.attachProperty);
		if(attachPoint){
			this[attachPoint]=baseNode;
		}

		var attachEvent = this.domNode.getAttribute(this.eventAttachProperty);
		if(attachEvent){
			// NOTE: we want to support attributes that have the form
			// "domEvent: nativeEvent; ..."
			var evts = attachEvent.split(";");
			for(var x=0; x<evts.length; x++){
				if(!evts[x]){ continue; }
				var evt = dojo.text.trim(evts[x]);
				var thisFunc = null;
				if(evt.indexOf(":") >= 0){
					// oh, if only JS had tuple assignment
					var funcNameArr = evt.split(":");
					evt = dojo.text.trim(funcNameArr[0]);
					thisFunc = dojo.text.trim(funcNameArr[1]);
				}
				if(dojo.hostenv.name_ == "browser"){
					dojo.event.browser.addListener(baseNode, evt.toLowerCase(), this[thisFunc||evt]);
				}else{
					var en = evt.toLowerCase().substr(2);
					baseNode.addEventListener(en, this[thisFunc||evt], false);
				}
			}
		}
		
		// FIXME: temporarily commenting this out as it is breaking things
		/*for(var x=0; x<baseNode.childNodes.length; x++){
			if(baseNode.childNodes.item(x).nodeType == elementNodeType){
				this.attachTemplateNodes(baseNode.childNodes[x]);
			}
		}*/

		/*
		for(var x=0; x<baseNode.childNodes.length; x++){
			var tn = baseNode.childNodes[x];
			if(tn.nodeType!=1){ continue; }
			var aa = dojo.xml.htmlUtil.getAttr(tn, this.attachProperty);
			if(aa){
				// __log__.debug(aa);
				var thisFunc = null;
				if(aa.indexOf(":") >= 0){
					// oh, if only JS had tuple assignment
					var funcNameArr = aa.split(":");
					aa = funcNameArr[0];
					thisFunc = funcNameArr[1];
				}
				alert(aa);
				if((this[aa])&&((thisFunc)||(typeof this[aa] == "function"))){
					var _this = this;
					baseNode[thisFunc||aa] = function(evt){ 
						_this[aa](evt);
					}
				}else{
					this[aa]=tn;
				}
			}
			if(tn.childNodes.length>0){
				this.attachTemplateNodes(tn);
			}
		}
		*/
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

// SVGWidget is a mixin ONLY
dojo.webui.SVGWidget = function(args){
	// mixin inheritance
	// dojo.webui.DomWidget.call(this);

	this.getContainerHeight = function(){
		// NOTE: container height must be returned as the INNER height
		dj_unimplemented("dojo.webui.SVGWidget.getContainerHeight");
	}

	this.getContainerWidth = function(){
		return this.parent.domNode.offsetWidth;
	}

	this.setNativeHeight = function(height){
		var ch = this.getContainerHeight();
		dj_unimplemented("dojo.webui.SVGWidget.setNativeHeight");
	}

	this.createNodesFromText = function(txt, wrap){
		// from http://wiki.svg.org/index.php/ParseXml
		var docFrag = parseXML(txt, window.document);
		docFrag.normalize();
		if(wrap){ 
			var ret = [docFrag.firstChild.cloneNode(true)];
			return ret;
		}
		var nodes = [];
		for(var x=0; x<docFrag.childNodes.length; x++){
			nodes.push(docFrag.childNodes.item(x).cloneNode(true));
		}
		// tn.style.display = "none";
		return nodes;
	}
}

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
			var ret = [tn.firstChild.cloneNode(true)];
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

