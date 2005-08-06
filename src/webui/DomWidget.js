dojo.provide("dojo.webui.DomWidget");

dojo.require("dojo.event.*");
dojo.require("dojo.text.*");
dojo.require("dojo.webui.Widget");
dojo.require("dojo.webui.DragAndDrop");
dojo.require("dojo.xml.*");
dojo.require("dojo.math.curves");
dojo.require("dojo.animation.Animation");
dojo.require("dojo.uri.*");

dojo.webui._cssFiles = {};

// static method to build from a template w/ or w/o a real widget in place
dojo.webui.buildFromTemplate = function(obj, templatePath, templateCssPath, templateString) {
	var tpath = templatePath || obj.templatePath;
	var cpath = templateCssPath || obj.templateCssPath;

	if (!cpath && obj.templateCSSPath) {
		obj.templateCssPath = cpath = obj.templateCSSPath;
		obj.templateCSSPath = null;
		dj_deprecated("templateCSSPath is deprecated, use templateCssPath");
	}

	// DEPRECATED: use Uri objects, not strings
	if (tpath && !(tpath instanceof dojo.uri.Uri)) {
		tpath = dojo.uri.dojoUri(tpath);
		dj_deprecated("templatePath should be of type dojo.uri.Uri");
	}
	if (cpath && !(cpath instanceof dojo.uri.Uri)) {
		cpath = dojo.uri.dojoUri(cpath);
		dj_deprecated("templateCssPath should be of type dojo.uri.Uri");
	}
	
	var tmplts = dojo.webui.DomWidget.templates;
	if(!obj["widgetType"]) { // don't have a real template here
		do {
			var dummyName = "__dummyTemplate__" + dojo.webui.buildFromTemplate.dummyCount++;
		} while(tmplts[dummyName]);
		obj.widgetType = dummyName;
	}

	if((cpath)&&(!dojo.webui._cssFiles[cpath])){
		dojo.xml.htmlUtil.insertCssFile(cpath);
		obj.templateCssPath = null;
		dojo.webui._cssFiles[cpath] = true;
	}

	var ts = tmplts[obj.widgetType];
	if(!ts){
		tmplts[obj.widgetType] = {};
		ts = tmplts[obj.widgetType];
	}
	if(!obj.templateString){
		obj.templateString = templateString || ts["string"];
	}
	if(!obj.templateNode){
		obj.templateNode = ts["node"];
	}
	if((!obj.templateNode)&&(!obj.templateString)&&(tpath)){
		// fetch a text fragment and assign it to templateString
		// NOTE: we rely on blocking IO here!
		var tstring = dojo.hostenv.getText(tpath);
		if(tstring) {
			var matches = tstring.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
			if(matches) {
				tstring = matches[1];
			}
		} else {
			tstring = "";
		}
		obj.templateString = tstring;
		ts.string = tstring;
	}
}
dojo.webui.buildFromTemplate.dummyCount = 0;

dojo.webui.attachProperty = "dojoAttachPoint";
dojo.webui.eventAttachProperty = "dojoAttachEvent";
dojo.webui.subTemplateProperty = "dojoSubTemplate";
dojo.webui.onBuildProperty = "dojoOnBuild";

dojo.webui.attachTemplateNodes = function(rootNode, targetObj, subTemplateParent, events){
	// FIXME: this method is still taking WAAAY too long. We need ways of optimizing:
	//	a.) what we are looking for on each node
	//	b.) the nodes that are subject to interrogation (use xpath instead?)
	//	c.) how expensive event assignment is (less eval(), more connect())
	// var start = new Date();
	var elementNodeType = dojo.xml.domUtil.nodeTypes.ELEMENT_NODE;

	if(!rootNode){ 
		rootNode = targetObj.domNode;
	}

	if(rootNode.nodeType != elementNodeType){
		return;
	}
	// alert(events.length);

	var nodes = rootNode.getElementsByTagName("*");
	var _this = targetObj;
	for(var x=-1; x<nodes.length; x++){
		var baseNode = (x == -1) ? rootNode : nodes[x];
		// FIXME: is this going to have capitalization problems?
		var attachPoint = baseNode.getAttribute(this.attachProperty);
		if(attachPoint){
			targetObj[attachPoint]=baseNode;
		}

		// FIXME: we need to put this into some kind of lookup structure
		// instead of direct assignment
		var tmpltPoint = baseNode.getAttribute(this.templateProperty);
		if(tmpltPoint){
			targetObj[tmpltPoint]=baseNode;
		}

		// subtemplates are always collected "flatly" by the widget class
		var tmpltPoint = baseNode.getAttribute(this.subTemplateProperty);
		if(tmpltPoint){
			// we assign by removal in this case, mainly because we assume that
			// this will get proccessed later when the sub-template is filled
			// in (usually by this method, and usually repetitively)
			subTemplateParent.subTemplates[tmpltPoint]=baseNode.parentNode.removeChild(baseNode);
			// make sure we don't get stopped here the next time we try to process
			subTemplateParent.subTemplates[tmpltPoint].removeAttribute(this.subTemplateProperty);
			// return;
		}

		var attachEvent = baseNode.getAttribute(this.eventAttachProperty);
		if(attachEvent){
			// NOTE: we want to support attributes that have the form
			// "domEvent: nativeEvent; ..."
			var evts = attachEvent.split(";");
			for(var y=0; y<evts.length; y++){
				if(!evts[y]){ continue; }
				if(!evts[y].length){ continue; }
				var tevt = null;
				var thisFunc = null;
				tevt = dojo.text.trim(evts[y]);
				if(tevt.indexOf(":") >= 0){
					// oh, if only JS had tuple assignment
					var funcNameArr = tevt.split(":");
					tevt = dojo.text.trim(funcNameArr[0]);
					thisFunc = dojo.text.trim(funcNameArr[1]);
				}
				if(!thisFunc){
					thisFunc = tevt;
				}
				//if(dojo.hostenv.name_ == "browser"){
				var tf = function(){ 
					var ntf = new String(thisFunc);
					return function(evt){
						if(_this[ntf]){
							_this[ntf](evt);
						}
					}
				}();
				// dojo.event.connect(baseNode, tevt.toLowerCase(), tf);
				dojo.event.browser.addListener(baseNode, tevt.substr(2), tf);
			}
		}

		for(var y=0; y<events.length; y++){
			//alert(events[x]);
			var evtVal = baseNode.getAttribute(events[y]);
			if((evtVal)&&(evtVal.length)){
				var thisFunc = null;
				var domEvt = events[y].substr(4).toLowerCase(); // clober the "dojo" prefix
				thisFunc = dojo.text.trim(evtVal);
				var tf = function(){ 
					var ntf = new String(thisFunc);
					return function(evt){
						if(_this[ntf]){
							_this[ntf](evt);
						}
					}
				}();
				// dojo.event.connect(baseNode, domEvt, tf);
				dojo.event.browser.addListener(baseNode, domEvt.substr(2), tf);
			}
		}

		var onBuild = baseNode.getAttribute(this.onBuildProperty);
		if(onBuild){
			eval("var node = baseNode; var widget = targetObj; "+onBuild);
		}
	}

	// dj_debug("attachTemplateNodes toc: ", new Date()-start, "ms");
}

dojo.webui.getDojoEventsFromStr = function(str){
	// var lstr = str.toLowerCase();
	var re = /(dojoOn([a-z]+)(\s?))=/gi;
	var evts = str ? str.match(re)||[] : [];
	var ret = [];
	var lem = {};
	for(var x=0; x<evts.length; x++){
		if(evts[x].legth < 1){ continue; }
		var cm = evts[x].replace(/\s/, "");
		cm = (cm.slice(0, cm.length-1));
		if(!lem[cm]){
			lem[cm] = true;
			ret.push(cm);
		}
	}
	return ret;
}


dojo.webui.buildAndAttachTemplate = function(obj, templatePath, templateCssPath, templateString, targetObj) {
	this.buildFromTemplate(obj, templatePath, templateCssPath, templateString);
	var node = dojo.xml.domUtil.createNodesFromText(obj.templateString, true)[0];
	this.attachTemplateNodes(node, targetObj||obj, obj, dojo.webui.getDojoEventsFromStr(templateString));
	return node;
}

dojo.webui.DomWidget = function(preventSuperclassMixin){

	// FIXME: this is sort of a hack, but it seems necessaray in the case where
	// a widget might already have another mixin base class and DomWidget is
	// mixed in to provide extra attributes, but not necessarialy an over-write
	// of the defaults (which might have already been changed);
	if(!preventSuperclassMixin){
		// mixin inheritance
		dojo.webui.Widget.call(this);
	}

	this.subTemplates = {};

	this.domNode = null; // this is our visible representation of the widget!
	this.containerNode = null; // holds child elements

	// FIXME: should we support addition at an index in the children arr and
	// order the display accordingly? Right now we always append.
	this.addChild = function(widget, overrideContainerNode, pos, ref){ 
		// var start = new Date();
		if(!this.isContainer){ // we aren't allowed to contain other widgets, it seems
			dj_debug("dojo.webui.DomWidget.addChild() attempted on non-container widget");
			return false;
		}else if(!this.containerNode){
			dj_debug("dojo.webui.DomWidget.addChild() attempted without containerNode");
			return false;
		}else{
			var cn = (overrideContainerNode) ? overrideContainerNode : this.containerNode;
			if(!pos){ pos = "after"; }
			if(!ref){ ref = cn.lastChild; }
			if(!ref){
				cn.appendChild(widget.domNode);
			}else{
				dojo.xml.domUtil[pos](widget.domNode, ref);
			}
			// dj_debug(this.widgetId, "added", widget.widgetId, "as a child");
			this.children.push(widget);
			widget.parent = this;
			widget.addedTo(this);
		}
		// dj_debug("add child took: ", new Date()-start, "ms");
	}

	// FIXME: we really need to normalize how we do things WRT "destroy" vs. "remove"
	this.removeChild = function(widget){
		for(var x=0; x<this.children.length; x++){
			if(this.children[x] === widget){
				this.children.splice(x, 1);
				break;
			}
		}
		return widget;
	}
	
	this.postInitialize = function(args, frag, parentComp){
		if(parentComp){
			parentComp.addChild(this);
		}else{
			if(!frag){ return; }
			var sourceNodeRef = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
			if(!sourceNodeRef){ return; } // fail safely if we weren't instantiated from a fragment
			// FIXME: this will probably break later for more complex nesting of widgets
			// FIXME: this will likely break something else, and has performance issues
			// FIXME: it also seems to be breaking mixins
			// FIXME: this breaks when the template for the container widget has child
			// nodes

			this.parent = dojo.webui.widgetManager.root;
			// insert our domNode into the DOM in place of where we started
			if(this.domNode) {
				var oldNode = sourceNodeRef.parentNode.replaceChild(this.domNode, sourceNodeRef);
			}
		}

		if(this.isContainer){
			var elementNodeType = dojo.xml.domUtil.nodeTypes.ELEMENT_NODE;
			// FIXME: this is borken!!!

			var fragParser = dojo.webui.widgets.getParser();
			// build any sub-components with us as the parent
			fragParser.createComponents(frag, this);
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
		var ts = dojo.webui.DomWidget.templates[this.widgetType];
		if(	
			(this.templatePath)||
			(this.templateNode)||
			(
				(this["templateString"])&&(this.templateString.length) 
			)||
			(
				(typeof ts != "undefined")&&( (ts["string"])||(ts["node"]) )
			)
		){
			// if it looks like we can build the thing from a template, do it!
			this.buildFromTemplate(args, frag);
		}else{
			// otherwise, assign the DOM node that was the source of the widget
			// parsing to be the root node
			this.domNode = frag["dojo:"+this.widgetType.toLowerCase()]["nodeRef"];
		}
		this.fillInTemplate(args, frag); 	// this is where individual widgets
											// will handle population of data
											// from properties, remote data
											// sets, etc.
	}

	this.buildFromTemplate = function(args, frag){
		// var start = new Date();
		// copy template properties if they're already set in the templates object
		var ts = dojo.webui.DomWidget.templates[this.widgetType];
		if(ts){
			if(!this.templateString.length){
				this.templateString = ts["string"];
			}
			if(!this.templateNode){
				this.templateNode = ts["node"];
			}
		}
		var node = null;
		// attempt to clone a template node, if there is one
		if((!this.templateNode)&&(this.templateString)){
			// do root conversion on the template string if required
			this.templateString = this.templateString.replace(/\$\{baseScriptUri\}/mg, dojo.hostenv.getBaseScriptUri());
			this.templateString = this.templateString.replace(/\$\{dojoRoot\}/mg, dojo.hostenv.getBaseScriptUri());
			// FIXME: what other replacement productions do we want to make available? Arbitrary eval's?

			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations
			// FIMXE: this breaks if the template has whitespace as its first 
			// characters
			// node = this.createNodesFromText(this.templateString, true);
			// this.templateNode = node[0].cloneNode(true); // we're optimistic here
			this.templateNode = this.createNodesFromText(this.templateString, true)[0];
			ts.node = this.templateNode;
		}
		if(!this.templateNode){ 
			dj_debug("weren't able to create template!");
			return false;
		}

		// dj_debug("toc0: ", new Date()-start, "ms");
		var node = this.templateNode.cloneNode(true);
		if(!node){ return false; }

		// recurse through the node, looking for, and attaching to, our
		// attachment points which should be defined on the template node.

		this.domNode = node;
		// dj_debug("toc1: ", new Date()-start, "ms");
		this.attachTemplateNodes(this.domNode, this);
		// dj_debug("toc2: ", new Date()-start, "ms");
	}

	this.attachTemplateNodes = function(baseNode, targetObj){
		if(!targetObj){ targetObj = this; }
		return dojo.webui.attachTemplateNodes(baseNode, targetObj, this, 
					dojo.webui.getDojoEventsFromStr(this.templateString));
	}
	this.fillInTemplate = function(){
		// dj_unimplemented("dojo.webui.DomWidget.fillInTemplate");
	}
	
	// method over-ride
	this.destroyRendering = function(){
		try{
			var tempNode = this.domNode.parentNode.removeChild(this.domNode);
			delete tempNode;
		}catch(e){ /* squelch! */ }
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
dojo.webui.DomWidget.templates = {};

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
		return dojo.xml.domUtil.createNodesFromText(txt, wrap);
	}
}

// HTMLWidget is a mixin ONLY
dojo.webui.HTMLWidget = function(args){
	// mixin inheritance
	// dojo.webui.DomWidget.call(this);
	this.templateCssPath = null;
	this.templatePath = null;
	this.allowResizeX = true;
	this.allowResizeY = true;

	this.resizeGhost = null;
	this.initialResizeCoords = null;
	// this.templateString = null;

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
		this.updateResize(coords, true);
	}

	this.updateResize = function(coords, override){
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.resizeGhost.style){
			if((this.allowResizeX)||(override)){
				width = this.initialResizeCoords.innerWidth + dx + "px";
			}
			if((this.allowResizeY)||(override)){
				height = this.initialResizeCoords.innerHeight + dy + "px";
			}
		}
	}

	this.endResize = function(coords){
		// FIXME: need to actually change the size of the widget!
		var dx = coords.x-this.initialResizeCoords.x;
		var dy = coords.y-this.initialResizeCoords.y;
		with(this.domNode.style){
			if(this.allowResizeX){
				width = this.initialResizeCoords.innerWidth + dx + "px";
			}
			if(this.allowResizeY){
				height = this.initialResizeCoords.innerHeight + dy + "px";
			}
		}
		this.resizeGhost.style.display = "none";
	}


	this.createNodesFromText = function(txt, wrap){
		return dojo.xml.domUtil.createNodesFromText(txt, wrap);
	}

	this._old_buildFromTemplate = this.buildFromTemplate;

	this.buildFromTemplate = function(){
		dojo.webui.buildFromTemplate(this);
		this._old_buildFromTemplate();
	}
}
// dj_inherits(dojo.webui.HTMLWidget, dojo.webui.DomWidget);
dojo.webui.HTMLWidgetMixin = new dojo.webui.HTMLWidget();

dojo.webui.htmlDragAndDropManager = new function(){
	dojo.webui.DragAndDropManager.call(this);

	this.resizeTarget = null;
	this.hoverNode = null;
	this.dragIcon = null;
	this._cheapChecks = true;
	this.isResizing = false;
	this.overResizeHandle = false;
	this.overDragHandle  = false;
	this.init = [];
	this.curr = [];

	this.checkForResize = function(node){
		if(this._cheapChecks){
			return dojo.xml.htmlUtil.getAttribute(node, "resizeHandle");
		}
		var rh = false;
		var ca = null;
		var ancestors = dojo.xml.domUtil.getAncestors(node);
		while((ancestors.length)&&(!rh)){
			var ca = ancestors.shift();
			rh = dojo.xml.htmlUtil.getAttribute(ca, "resizeHandle");
		}
		return rh;
	}

	this.checkForDrag = function(node){
		if(this._cheapChecks){
			return dojo.xml.htmlUtil.getAttribute(node, "dragHandle");
		}
		var rh = false;
		var ca = null;
		var ancestors = dojo.xml.domUtil.getAncestors(node);
		while((ancestors.length)&&(!rh)){
			var ca = ancestors.shift();
			rh = dojo.xml.htmlUtil.getAttribute(ca, "dragHandle");
		}
		return rh;
	}

	this.mouseMove = function(evt){
		this.curr = [evt.clientX, evt.clientY];
		this.curr.x = this.curr[0];
		this.curr.absx = this.curr.x+((dojo.render.html.moz) ? window.pageXOffset : document.body.scrollLeft);
		this.curr.y = this.curr[1];
		this.curr.absy = this.curr.y+((dojo.render.html.moz) ? window.pageYOffset : document.body.scrollTop);
		if((this.isDragging)||(this.isResizing)){
			// FIXME: we should probably implement a distance threshold here!
			this.mouseDrag(evt);
		}else{
			var dh = this.checkForDrag(evt.target);
			var rh = this.checkForResize(evt.target);
			// FIXME: we also need to handle horizontal-only or vertical-only
			// reisizing
			if(rh||dh){
				if(rh){ this.overResizeHandle = true; }
				if(dh){ this.overDragHandle = true; }
				document.body.style.cursor = "move";
			}else{
				this.overResizeHandle = false;
				this.overDragHandle = false;
				document.body.style.cursor = "";
			}
		}
		// update hoverTarget only when necessaray!
		if(evt.target != this.hoverNode){ 
			this.hoverNode = evt.target;
			var tdt = dojo.webui.widgetManager.getWidgetFromEvent(evt);
			this.hoverTarget = tdt;
			while((tdt)&&(!tdt["dragEnter"])&&(tdt != dojo.webui.widgetManager.root)){
				tdt = tdt.parent;
			}
			if(this.isDragging){
				if(tdt != dojo.webui.widgetManager.root){
					if(tdt != this.dropTarget){
						// dj_debug(tdt);
						if(this.dropTarget){
							this.dropTarget.dragLeave(this.dragSource);
						}
						this.dropTarget = tdt;
						if((this.dropTarget)&&(this.dropTarget["dragEnter"])){
							this.dropTarget.dragEnter(this.dragSource);
						}
					}
				}else{
					if(this.dropTarget){
						this.dropTarget.dragLeave(this.dragSource);
					}
					this.dropTarget = null;
				}
			}
		}
	}

	this.mouseDown = function(evt){
		this.init = this.curr;
		if(!this.hoverTarget){ return; }
		if(this.overResizeHandle){
			this.isResizing = true;
			this.resizeTarget = this.hoverTarget;
			if(this.resizeTarget["startResize"]){
				evt.preventDefault();
				evt.stopPropagation();
				this.resizeTarget.startResize(this.curr);
			}
			if(this.dragSource){
				this.dragSource.startDrag();
			}
		}else{
			if((this.hoverTarget["isDragSource"] === true)||(this.overDragHandle)){
				this.isDragging = true;
				this.dragSource = this.hoverTarget;
				
				// create a rudimentary event object to be passed to startDrag()
				var evt = {target: this.hoverNode, type: "startDrag"};
				
				while((this.dragSource)&&(!this.dragSource["isDragSource"])){
					this.dragSource = this.dragSource.parent;
				}
				if(!this.dragSource){
					this.isDragging = false;
				}else{
					document.body.style.cursor = "move";
				}
				this.dragSource.startDrag(evt);
				var di = this.dragSource.getDragIcon();
				if(di){
					if(!this.dragIcon){
						this.dragIcon = document.createElement("span");
						with(this.dragIcon.style){
							position = "absolute";
							border = margin = padding = "0px";
							zIndex = "1000";
							display = "none";
						}
						document.body.appendChild(this.dragIcon);
						dojo.xml.htmlUtil.setOpacity(this.dragIcon, 0.5);
					}
					// FIXME: can't do this without making sure the dragover
					//        events get fired on the DropTargets
					// start dragging the icon from its origin
					//var pos = dojo.xml.htmlUtil.getAttribute(di, "originalPosition")
					//if (pos) {
					//	pos = pos.split(",");
					//	this.dragIcon.offsetX = pos[0] - this.curr.absx;
					//	this.dragIcon.offsetY = pos[1] - this.curr.absy;
					//} else {
						this.dragIcon.offsetX = 15;
						this.dragIcon.offsetY = 15;
					//}
					with(this.dragIcon){
						style.left = this.curr.absx+offsetX+"px";
						style.top = this.curr.absy+offsetY+"px";
					}
					this.dragIcon.appendChild(di);
					this.dragIcon.style.display = "";
				}
			}
		}
	}

	// turns out that these are pretty useless
	this.mouseOver = function(nativeEvt){ return; }
	this.mouseOut = function(nativeEvt){ return; }

	this.mouseUp = function(nativeEvt){ 
		this.drop(nativeEvt);
		if((this.isResizing)||(this.isDragging)){
			if(this.resizeTarget){
				this.resizeTarget.endResize(this.curr);
				this.exitDrag();
			}else if(this.dropTarget){
				this.dropTarget.dragLeave(this.dragSource);
				this.exitDrag();
			}else{
				this.cancelDrag();
			}
		} else {
			this.cancelDrag();
		}
	}

	this.mouseDrag = function(evt){ 
		if(this.isResizing){
			if(this.resizeTarget){
				this.resizeTarget.updateResize(this.curr);
			}
		}else if(this.isDragging){
			evt.preventDefault();
			evt.stopPropagation();
			this.drag(evt);
			if(this.dragIcon){
				with (this.dragIcon) {
					style.left = this.curr.absx+offsetX+"px";
					style.top = this.curr.absy+offsetY+"px";
				}
			}
		}
	}
	
	this.keyDown = function(evt){
		if (evt.keyCode == 27) { // escape key
			// FIXME: don't seem to be able to animate as setTimeout isn't
			// being fired with the mouse button held down?
			//this.cancelDrag();
			this.exitDrag();
		}
	}

	this.cancelDrag = function(){
		// scoots the drag icon off back to it's original position
		// and then exits
		var endcoords = (this.dragIcon) ? dojo.xml.htmlUtil.getAttribute(
			this.dragIcon.firstChild, "originalPosition") : false;
		
		if(endcoords){
			endcoords = endcoords.split(",");
			endcoords[0]++; endcoords[1]++; // offset so the end can be seen
			var begincoords = [dojo.xml.htmlUtil.getAbsoluteX(this.dragIcon),
					dojo.xml.htmlUtil.getAbsoluteY(this.dragIcon)];

			// steal the icon so that other d&ds are free to start
			var dragIcon = this.dragIcon; this.dragIcon = null;
		
			// animate
			var line = new dojo.math.curves.Line(begincoords, endcoords);
			var anim = new dojo.animation.Animation(line, 300, 0, 0);
			dojo.event.connect(anim, "onAnimate", function(e) {
				dragIcon.style.left = e.x + "px";
				dragIcon.style.top = e.y + "px";
			});
			dojo.event.connect(anim, "onEnd", function (e) {
				// pause for a second (not literally) and disappear
				setTimeout(function () {
					dragIcon.parentNode.removeChild(dragIcon);
				}, 100);
			});
			anim.play();
		}
		this.exitDrag();
	}
	
	this.exitDrag = function(){
		// resets drag manager after a drag has finished
		if(this.dragIcon){
			this.dragIcon.style.display = "none";
			with(this.dragIcon){
				while(firstChild){ removeChild(firstChild); }
			}
		}
		if((this.isResizing)||(this.isDragging)){
			if(!this.resizeTarget){
				this.dragSource.endDrag();
				this.dragSource.selection.clear();
			}
			this.dropTarget = null;
			this.resizeTarget = null;
			this.isResizing = false;
			this.overResizeHandle = false;

			this.dragSource = null;
			this.isDragging = false;
			this.overDragHandle = false;

			document.body.style.cursor = "default";
		}
		this.init = [];
	}

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
			dojo.event.connect(document, "onkeydown", htmldm, "keyDown");
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
