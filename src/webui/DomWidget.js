dojo.hostenv.startPackage("dojo.webui.DomWidget");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.text.*");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.webui.DragAndDrop");
dojo.hostenv.loadModule("dojo.xml.domUtil");
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

dojo.webui.DomWidget = function(preventSuperclassMixin){

	// FIXME: this is sort of a hack, but it seems necessaray in the case where
	// a widget might already have another mixin base class and DomWidget is
	// mixed in to provide extra attributes, but not necessarialy an over-write
	// of the defaults (which might have already been changed);
	if(!preventSuperclassMixin){
		// mixin inheritance
		dojo.webui.Widget.call(this);
	}

	this.attachProperty = "dojoAttachPoint";
	this.eventAttachProperty = "dojoAttachEvent";
	this.subTemplateProperty = "dojoSubTemplate";
	this.onBuildProperty = "dojoOnBuild";
	this.subTemplates = {};

	this.domNode = null; // this is our visible representation of the widget!

	this.addChild = function(widget){
		if(!this.isContainer){
			dj_debug("dojo.webui.DomWidget.addChild() attempted on non-container widget");
			return false; // we aren't allowed to contain other widgets, it seems
		}
	}


	this.postInitialize = function(args, frag){
		if(!frag){ return; }
		var nr = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
		if(!nr){ return; } // fail safely if we weren't instantiated from a fragment
		// FIXME: this will probably break later for more complex nesting of widgets
		// FIXME: this will likely break something else, and has performance issues
		// FIXME: it also seems to be breaking mixins
		// FIXME: this breaks when the template for the container widget has child
		// nodes
		if(this.isContainer) {
			var elementNodeType = dojo.xml.domUtil.nodeTypes.ELEMENT_NODE;
			// FIXME: this is borken!!!
			var on = nr.parentNode.replaceChild(this.domNode, nr);
			var fragParser = new dojo.webui.widgets.Parse(frag);
			fragParser.createComponents(frag);
			this.domNode.innerHTML = on.innerHTML;
			for(var i=0; i<on.childNodes.length; i++) {
				if(on.childNodes.nodeType == elementNodeType) {
					// FIXME: not sure they the above innerHTML switch works, but this doesn't...
					//this.addChild(on.childNodes.item(i));
				}
			}
		} else {
			nr.parentNode.replaceChild(this.domNode, nr);
		}
	}

	this.startResize = function(coords){
		dj_unimplemented("dojo.webui.DomWidget.startResize");
	}

	this.updateResize = function(coords){
		dj_unimplemented("dojo.webui.DomWidget.updateResize");
	}

	this.endResize = function(coords){
		dj_unimplemented("dojo.webui.DomWidget.endResize");
	}
	// method over-ride
	this.buildRendering = function(args, frag){
		// DOM widgets construct themselves from a template
		this.buildFromTemplate(args, frag);
		this.fillInTemplate(args, frag); 	// this is where individual widgets
											// will handle population of data
											// from properties, remote data
											// sets, etc.
	}

	this.buildFromTemplate = function(args, frag){
		var node = null;
		// attempt to clone a template node, if there is one
		if((!this.templateNode)&&(this.templateString)){
			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations
			// FIMXE: this breaks if the template has whitespace as its first 
			// characters
			node = this.createNodesFromText(this.templateString, true);
			this.templateNode = node[0].cloneNode(true); // we're optimistic here
		}
		if(!this.templateNode){ 
			dj_debug("weren't able to create template!");
			return false;
		}
		var node = this.templateNode.cloneNode(true);
		if(!node){ return false; }

		// recurse through the node, looking for, and attaching to, our
		// attachment points which should be defined on the template node.

		this.domNode = node;
		this.attachTemplateNodes(this.domNode);
	}

	this.attachTemplateNodes = function(baseNode, targetObj){
		if(!targetObj){ targetObj = this; }
		var elementNodeType = dojo.xml.domUtil.nodeTypes.ELEMENT_NODE;

		if(!baseNode){ 
			baseNode = targetObj.domNode;
		}

		if(baseNode.nodeType != elementNodeType){
			return;
		}

		// FIXME: is this going to have capitalization problems?
		var attachPoint = baseNode.getAttribute(this.attachProperty);
		if(attachPoint){
			targetObj[attachPoint]=baseNode;
		}

		/*
		// FIXME: we need to put this into some kind of lookup structure
		// instead of direct assignment
		var tmpltPoint = baseNode.getAttribute(this.templateProperty);
		if(tmpltPoint){
			targetObj[tmpltPoint]=baseNode;
		}
		*/

		// subtemplates are always collected "flatly" by the widget class
		var tmpltPoint = baseNode.getAttribute(this.subTemplateProperty);
		if(tmpltPoint){
			// we assign by removal in this case, mainly because we assume that
			// this will get proccessed later when the sub-template is filled
			// in (usually by this method, and usually repetitively)
			this.subTemplates[tmpltPoint]=baseNode.parentNode.removeChild(baseNode);
			// make sure we don't get stopped here the next time we try to process
			this.subTemplates[tmpltPoint].removeAttribute(this.subTemplateProperty);
			return;
		}

		var attachEvent = baseNode.getAttribute(this.eventAttachProperty);
		if(attachEvent){
			// NOTE: we want to support attributes that have the form
			// "domEvent: nativeEvent; ..."
			var evts = attachEvent.split(";");
			for(var x=0; x<evts.length; x++){
				var tevt = null;
				var thisFunc = null;
				if(!evts[x]){ continue; }
				if(!evts[x].length){ continue; }
				tevt = dojo.text.trim(evts[x]);
				if(tevt.indexOf(":") >= 0){
					// oh, if only JS had tuple assignment
					var funcNameArr = tevt.split(":");
					tevt = dojo.text.trim(funcNameArr[0]);
					thisFunc = dojo.text.trim(funcNameArr[1]);
				}
				if(!thisFunc){
					thisFunc = tevt;
				}
				if(dojo.hostenv.name_ == "browser"){
					var _this = targetObj;
					// dojo.event.browser.addListener(baseNode, tevt.toLowerCase(), function(ea){ _this[thisFunc||tevt](ea); });
					// baseNode[tevt.toLowerCase()] 
					var tf = function(){ 
						var ntf = new String(thisFunc);
						return function(evt){
							if(_this[ntf]){
								_this[ntf](evt);
							}
						}
					}();
					dojo.event.browser.addListener(baseNode, tevt.toLowerCase(), tf);
				}else{
					var en = tevt.toLowerCase().substr(2);
					baseNode.addEventListener(en, targetObj[thisFunc||tevt], false);
				}
			}
		}

		var onBuild = baseNode.getAttribute(this.onBuildProperty);
		if(onBuild){
			eval("var node = baseNode; var widget = targetObj; "+onBuild);
		}

		// FIXME: temporarily commenting this out as it is breaking things
		for(var x=0; x<baseNode.childNodes.length; x++){
			if(baseNode.childNodes.item(x).nodeType == elementNodeType){
				this.attachTemplateNodes(baseNode.childNodes.item(x), targetObj);
			}
		}

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
		// dj_unimplemented("dojo.webui.DomWidget.fillInTemplate");
	}
	
	// method over-ride
	this.destroyRendering = function(){
		var tempNode = this.domNode.parentNode.removeChild(this.domNode);
		delete tempNode;
	}

	// method over-ride
	this.cleanUp = function(){
		
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

	if((arguments.length>0)&&(typeof arguments[0] == "object")){
		this.create(arguments[0]);
	}
}

dojo.webui.DomWidget.prototype.templateNode = null;
dojo.webui.DomWidget.prototype.templateString = null;

dj_inherits(dojo.webui.DomWidget, dojo.webui.Widget);

// SVGWidget is a mixin ONLY
dojo.webui.SVGWidget = function(args){
	// alert("dojo.webui.SVGWidget");
	// mixin inheritance
	// dojo.webui.DomWidget.call(this);

	this.getContainerHeight = function(){
		// NOTE: container height must be returned as the INNER height
		dj_unimplemented("dojo.webui.SVGWidget.getContainerHeight");
	}

	this.getContainerWidth = function(){
		// return this.parent.domNode.offsetWidth;
		dj_unimplemented("dojo.webui.SVGWidget.getContainerWidth");
	}

	this.setNativeHeight = function(height){
		// var ch = this.getContainerHeight();
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
	this.templateCSSPath = null;
	this.templatePath = null;

	this.resizeGhost = null;
	this.initialResizeCoords = null;

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

	this.startResize = function(coords){
		// get the left and top offset of our dom node
		var hu = dojo.xml.htmlUtil;
		
		coords.offsetLeft = hu.totalOffsetLeft(this.domNode);
		coords.offsetTop = hu.totalOffsetTop(this.domNode);
		coords.innerWidth = hu.getInnerWidth(this.domNode);
		coords.innerHeight = hu.getInnerHeight(this.domNode);
		if(!this.resizeGhost){
			this.resizeGhost = document.createElement("div");
			var rg = this.resizeGhost;
			rg.style.position = "absolute";
			rg.style.backgroundColor = "white";
			rg.style.border = "1px solid black";
			dojo.xml.htmlUtil.setOpacity(rg, 0.3);
			document.body.appendChild(rg);
		}
		with(this.resizeGhost.style){
			left = coords.offsetLeft + "px";
			top = coords.offsetTop + "px";
		}
		this.initialResizeCoords = coords;
		this.resizeGhost.style.display = "";
		this.updateResize(coords);
	}

	this.updateResize = function(coords){
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.resizeGhost.style){
			width = this.initialResizeCoords.innerWidth + dx + "px";
			height = this.initialResizeCoords.innerHeight + dy + "px";
		}
	}

	this.endResize = function(coords){
		// FIXME: need to actually change the size of the widget!
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.domNode.style){
			width = this.initialResizeCoords.innerWidth + dx + "px";
			height = this.initialResizeCoords.innerHeight + dy + "px";
		}
		this.resizeGhost.style.display = "none";
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
			// start hack
			if(tn.firstChild.nodeValue == " " || tn.firstChild.nodeValue == "\t") {
				var ret = [tn.firstChild.nextSibling.cloneNode(true)];
			} else {
				var ret = [tn.firstChild.cloneNode(true)];
			}
			// end hack
			tn.style.display = "none";
			return ret;
		}
		var nodes = [];
		for(var x=0; x<tn.childNodes.length; x++){
			nodes.push(tn.childNodes[x].cloneNode(true));
		}
		tn.style.display = "none";
		return nodes;
	}

	this._old_buildFromTemplate = this.buildFromTemplate;

	this.buildFromTemplate = function(){
		if((!this.templateNode)&&(!this.templateString)&&(this.templatePath)){
			// fetch a text fragment and assign it to templateString
			// NOTE: we rely on blocking IO here!
			// FIXME: extra / being inserted in URL?
			this.templateString = dojo.hostenv.getText(dojo.hostenv.getBaseScriptUri()+"/"+this.templatePath);
		}

		if(this.templateCSSPath){
			// FIXME: extra / being inserted in URL?
			insertCSSFile(dojo.hostenv.getBaseScriptUri()+"/"+this.templateCSSPath);
			this.templateCSSPath = null;
		}

		this._old_buildFromTemplate();
	}

	// FIXME: should this be moved into htmlUtil?
	function insertCSSFile(URI, doc){
		if(!doc){ doc = document; }
		var file = doc.createElement("link");
		file.setAttribute("type", "text/css");
		file.setAttribute("rel", "stylesheet");
		file.setAttribute("href", URI);
		var head = doc.getElementsByTagName("head")[0];
		head.appendChild(file);
	}
}

dj_inherits(dojo.webui.HTMLWidget, dojo.webui.DomWidget);

dojo.webui.htmlDragAndDropManager = new function(){

	var dm = dojo.webui.dragAndDropManager;
	this.resizeTarget = null;
	this.dragSource = null;
	this.hoverTarget = null;
	this.isResizing = false;
	this.overResize = false;
	this.isDragging = false;
	this.init = [];
	this.curr = [];

	this.checkForResize = function(node){
		var rh = false;
		var ca = null;
		var ancestors = dojo.xml.domUtil.getAncestors(node);
		while((ancestors.length)&&(!rh)){
			var ca = ancestors.shift();
			rh = dojo.xml.htmlUtil.getAttribute(ca, "resizeHandle");
		}
		return rh;
	}

	this.mouseMove = function(evt){
		this.curr = [evt.clientX, evt.clientY];
		this.curr.x = this.curr[0];
		this.curr.y = this.curr[1];
		if(this.isResizing){
			if(this.resizeTarget){
				this.resizeTarget.updateResize(this.curr);
				evt.preventDefault();
				evt.stopPropagation();
			}
		}else if(this.isDragging){
			// FIXME: what do we do here?
		}else{
			var rh = this.checkForResize(evt.target);
			// FIXME: we need to check for "hotspots" here!!
			// FIXME: we also need to handle horizontal-only or vertical-only
			// reisizing
			if(rh){
				this.overResize = true;
				// document.body.style.cursor = "nw-resize";
				document.body.style.cursor = "move";
			}else{
				this.overResize = false;
				document.body.style.cursor = "";
			}
		}
		this.hoverTarget = dojo.webui.widgetManager.getWidgetFromEvent(evt);
	}

	this.mouseDown = function(evt){
		this.init = this.curr;
		if(!this.hoverTarget){ return; }
		if(this.overResize){
			this.isResizing = true;
			this.resizeTarget = this.hoverTarget;
			if(this.resizeTarget["startResize"]){
				evt.preventDefault();
				evt.stopPropagation();
				this.resizeTarget.startResize(this.curr);
			}
		}else{
			if(this.hoverTarget["isDragSource"] == true){
				this.isDragging = true;
				this.dragSource = this.hoverTarget;
				document.body.style.cursor = "move";
			}
		}
	}

	// turns out that these are pretty useless
	this.mouseOver = function(nativeEvt){ return; }
	this.mouseOut = function(nativeEvt){ return; }

	this.mouseUp = function(nativeEvt){ 
		// alert(nativeEvt); 
		if(this.isResizing){
			if(this.resizeTarget){
				this.resizeTarget.endResize(this.curr);
			}
			this.resizeTarget = null;
			this.isResizing = false;
			this.overResize = false;
			document.body.style.cursor = "";
		}
		dojo.webui.dragAndDropManager.drop(nativeEvt);
		this.init = [];
	}
	this.mouseDrag = function(nativeEvt){ return; }
}

try{
(function(){
	var tf = function(){
		var rw = null;
		if(dojo.render.html){
			function rwClass(){
				dojo.webui.Widget.call(this);
				dojo.webui.DomWidget.call(this, true);
				dojo.webui.HTMLWidget.call(this);
				this.buildRendering = function(){ return; }
				this.destroyRendering = function(){ return; }
				this.postInitialize = function(){ return; }
				this.cleanUp = function(){ return; }
				this.widgetType = "HTMLRootWidget";
			}
			rw = new rwClass();
			rw.domNode = document.body;
			// FIXME: need to attach to DOM events and the like here
			
			var htmldm = dojo.webui.htmlDragAndDropManager;
			dojo.event.connect(document, "onmousemove", htmldm, "mouseMove");
			dojo.event.connect(document, "onmouseover", htmldm, "mouseOver");
			dojo.event.connect(document, "onmouseout", htmldm, "mouseOut");
			dojo.event.connect(document, "onmousedown", htmldm, "mouseDown");
			dojo.event.connect(document, "onmouseup", htmldm, "mouseUp");

		}else if(dojo.render.svg){
			// FIXME: fill this in!!!
			function rwClass(){
				dojo.webui.Widget.call(this);
				dojo.webui.DomWidget.call(this, true);
				dojo.webui.SVGWidget.call(this);
				this.buildRendering = function(){ return; }
				this.destroyRendering = function(){ return; }
				this.postInitialize = function(){ return; }
				this.cleanUp = function(){ return; }
				this.widgetType = "SVGRootWidget";
			}
			rw = new rwClass();
			rw.domNode = document.documentElement;
		}
		var wm = dojo.webui.widgetManager;
		wm.root = rw;
		wm.add(rw);

		// extend the widgetManager with a getWidgetFromNode method
		wm.getWidgetFromNode = function(node){
			var filter = function(x){
				if(x.domNode == node){
					return true;
				}
			}
			var widgets = [];
			while((node)&&(widgets.length < 1)){
				widgets = this.getWidgetsByFilter(filter);
				node = node.parentNode;
			}
			if(widgets.length > 0){
				return widgets[0];
			}else{
				return null;
			}
		}

		wm.getWidgetFromEvent = function(domEvt){
			return this.getWidgetFromNode(domEvt.target);
		}

		wm.getWidgetFromPrimitive = wm.getWidgetFromNode;
	}

	// make sure we get called when the time is right
	dojo.event.connect(dojo.hostenv, "loaded", tf);
})();
}catch(e){ alert(e); }
