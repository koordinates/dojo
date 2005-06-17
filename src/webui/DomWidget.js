dojo.hostenv.startPackage("dojo.webui.DomWidget");

dojo.hostenv.loadModule("dojo.event.*");
dojo.hostenv.loadModule("dojo.text.*");
dojo.hostenv.loadModule("dojo.webui.Widget");
dojo.hostenv.loadModule("dojo.webui.DragAndDrop");
dojo.hostenv.loadModule("dojo.xml.domUtil");
dojo.hostenv.loadModule("dojo.xml.htmlUtil");

// static method to build from a template w/ or w/o a real widget in place
dojo.webui.buildFromTemplate = function(obj, templatePath, templateCSSPath, templateString) {
	var tpath = templatePath || obj.templatePath;
	var cpath = templateCSSPath || obj.templateCSSPath;

	var tmplts = dojo.webui.DomWidget.templates;
	if(!obj.widgetType) { // don't have a real template here
		do {
			var dummyName = "__dummyTemplate__" + dojo.webui.buildFromTemplate.dummyCount++;
		} while(tmplts[dummyName]);
		obj.widgetType = dummyName;
	}

	if(cpath){
		// FIXME: extra / being inserted in URL?
		dojo.xml.htmlUtil.insertCSSFile(dojo.hostenv.getBaseScriptUri()+"/"+cpath);
		obj.templateCSSPath = null;
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
		// FIXME: extra / being inserted in URL?
		var tmplts = dojo.webui.DomWidget.templates;
		var ts = tmplts[obj.widgetType];
		if(!ts){
			tmplts[obj.widgetType] = {};
			ts = tmplts[obj.widgetType];
		}
		var tp = dojo.hostenv.getBaseScriptUri()+""+tpath;
		var tstring = dojo.hostenv.getText(tp);
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

dojo.webui.attachTemplateNodes = function(baseNode, targetObj, subTemplateParent, events){
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
		subTemplateParent.subTemplates[tmpltPoint]=baseNode.parentNode.removeChild(baseNode);
		// make sure we don't get stopped here the next time we try to process
		subTemplateParent.subTemplates[tmpltPoint].removeAttribute(this.subTemplateProperty);
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
			//if(dojo.hostenv.name_ == "browser"){
			var _this = targetObj;
			var tf = function(){ 
				var ntf = new String(thisFunc);
				return function(evt){
					if(_this[ntf]){
						_this[ntf](evt);
					}
				}
			}();
			dojo.event.connect(baseNode, tevt.toLowerCase(), tf);
			/*
			}else{
				var en = tevt.toLowerCase().substr(2);
				baseNode.addEventListener(en, targetObj[thisFunc||tevt], false);
			}
			*/
		}
	}

	for(var x=0; x<events.length; x++){
		//alert(events[x]);
		var evtVal = baseNode.getAttribute(events[x]);
		if(evtVal){
			var thisFunc = null;
			if((!evtVal)||(!evtVal.length)){ continue; }
			var domEvt = events[x].substr(4).toLowerCase(); // clober the "dojo" prefix
			thisFunc = dojo.text.trim(evtVal);
			var _this = targetObj;
			var tf = function(){ 
				var ntf = new String(thisFunc);
				return function(evt){
					if(_this[ntf]){
						_this[ntf](evt);
					}
				}
			}();
			dojo.event.connect(baseNode, domEvt, tf);
		}
	}

	var onBuild = baseNode.getAttribute(this.onBuildProperty);
	if(onBuild){
		eval("var node = baseNode; var widget = targetObj; "+onBuild);
	}

	// FIXME: temporarily commenting this out as it is breaking things
	for(var x=0; x<baseNode.childNodes.length; x++){
		if(baseNode.childNodes.item(x).nodeType == elementNodeType){
			this.attachTemplateNodes(baseNode.childNodes.item(x), targetObj, subTemplateParent, events);
		}
	}
}

dojo.webui.getDojoEventsFromStr = function(str){
	// var lstr = str.toLowerCase();
	var re = /(dojoOn([a-z]+)(\s?))=/gi;
	var evts = str ? str.match(re)||[] : [];
	for(var x=0; x<evts.length; x++){
		if(evts[x].legth < 1){ continue; }
		var cm = evts[x].replace(/\s/, "");
		evts[x] = (cm.slice(0, cm.length-1));
	}
	return evts;
}


dojo.webui.buildAndAttachTemplate = function(obj, templatePath, templateCSSPath, templateString, targetObj) {
	this.buildFromTemplate(obj, templatePath, templateCSSPath, templateString);
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
			this.children.push(widget);
			widget.parent = this;
		}
	}

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

			// FIXME: Dylan, why do we keep having to create new frag parsers
			// left and right? It seems horribly inefficient.
			var fragParser = new dojo.webui.widgets.Parse(frag);
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
		this.buildFromTemplate(args, frag);
		this.fillInTemplate(args, frag); 	// this is where individual widgets
											// will handle population of data
											// from properties, remote data
											// sets, etc.
	}

	this.buildFromTemplate = function(args, frag){
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
			// otherwise, we are required to instantiate a copy of the template
			// string if one is provided.
			
			// FIXME: need to be able to distinguish here what should be done
			// or provide a generic interface across all DOM implementations
			// FIMXE: this breaks if the template has whitespace as its first 
			// characters
			node = this.createNodesFromText(this.templateString, true);
			this.templateNode = node[0].cloneNode(true); // we're optimistic here
			ts.node = this.templateNode;
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
		this.attachTemplateNodes(this.domNode, this);
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
	this.templateCSSPath = null;
	this.templatePath = null;

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
	this.isResizing = false;
	this.overResizeHandle = false;
	this.overDragHandle  = false;
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

	this.checkForDrag = function(node){
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
							dj_debug("checking");
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
				while((this.dragSource)&&(!this.dragSource["isDragSource"])){
					this.dragSource = this.dragSource.parent;
				}
				if(!this.dragSource){
					this.isDragging = false;
				}else{
					document.body.style.cursor = "move";
				}
				this.dragSource.startDrag();
				var di = this.dragSource.getDragIcon();
				if(di){
					if(!this.dragIcon){
						this.dragIcon = document.createElement("span");
						with(this.dragIcon.style){
							position = "absolute";
							left = this.curr.absx+15+"px";
							top = this.curr.absy+15+"px";
							border = margin = padding = "0px";
							zIndex = "1000";
						}
						document.body.appendChild(this.dragIcon);
						dojo.xml.htmlUtil.setOpacity(this.dragIcon, 0.5);
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
		if(this.dragIcon){
			dj_debug('clobbering drag icon');
			this.dragIcon.style.display = "none";
			with(this.dragIcon){
				while(firstChild){
					removeChild(firstChild);
				}
			}
		}
		this.drop(nativeEvt);
		if((this.isResizing)||(this.isDragging)){
			if(this.resizeTarget){
				this.resizeTarget.endResize(this.curr);
			}else{
				if(this.dropTarget){
					this.dropTarget.dragLeave(this.dragSource);
				}
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

			document.body.style.cursor = "";
		}
		this.init = [];
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
				this.dragIcon.style.left = this.curr.absx+15+"px";
				this.dragIcon.style.top = this.curr.absy+15+"px";
			}
		}
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
