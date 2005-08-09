dojo.provide("dojo.webui.DragAndDrop");
dojo.provide("dojo.webui.selection");
dojo.provide("dojo.webui.dragAndDrop");
dojo.provide("dojo.webui.DragSource");
dojo.provide("dojo.webui.DropTarget");
dojo.provide("dojo.webui.DragAndDropManager");

dojo.webui.DragSource = function(){
	// The interface that all drag data sources MUST implement
	this.isDragSource = true;

	this.startDrag = function(){
	}

	this.endDrag = function(){
	}

	this.getDragIcon = function(){
	}

	this.getTypes = function(){
		// DragSource objects MUST include a selection property or overload
		// this method
		if(this.selection){
			return this.selection.getTypes();
		}
		return [];
	}
}

dojo.webui.DropTarget = function(){
	// The interface that all components that accept drops MUST implement
	this.acceptedTypes = []; // strings

	this.handleDrag = function(dragSourceObj){ 
	}

	this.dragEnter = function(dragSourceObj){ 
	}

	this.dragLeave = function(dragSourceObj){
	}

	this.acceptDrag = function(dragSourceObj){
		if(!dragSourceObj){ return false; }
		if(!dragSourceObj["getTypes"]){ 
			// dj_debug("won't accept");
			return false; 
		}
		var dtypes = dragSourceObj.getTypes();
		if(dtypes.length == 0){
			// dj_debug("won't accept");
			return false; 
		}
		for(var x=0; x<dtypes.length; x++){
			if(!dojo.alg.inArray(this.acceptedTypes, dtypes[x])){
				return false;
			}
		}
		// dj_debug(this.widgeType+" will accept!");
		return true;
	}

	this.handleDrop = function(dragSourceObj){
		// this is the default action. it's not very smart and so this method
		// should be over-ridden by widgets wanting to handle drops
		var sel = dragSourceObj.selection.selected;
		for(var x=0;x<sel.length; x++){
			var tmp = dragSourceObj.removeChild(sel[x]);
			// dj_debug(tmp);
			this.addChild(tmp);
		}
		return false;
	}
}

dojo.webui.DragAndDropManager = function(){
	
	this.hoverTarget = null;
	this.dragSource = null;
	this.dropTarget = null;
	this.isDragging = false;
	this.targetAccepts = false;

	// FIXME: should these be replaced by some DOM/HTML variant? is there some
	// other method they should call?
	this.keyDown = function(nativeEvt){ return; }
	this.mouseOver = function(widget){ return; }
	this.mouseOut = function(widget){ return; }
	this.mouseMove = function(widget){ return; }
	this.mouseDown = function(){ return; }
	this.mouseUp = function(nativeEvt){ this.drop(nativeEvt); }
	this.mouseDrag = function(nativeEvt){ return; }
	this.startDrag = function(nativeEvt){ return; }
	this.checkForResize = function(nativeEvt){ return; }
	this.checkForDrag = function(nativeEvt){ return; }

	this.checkTargetAccepts = function(){
		if((this.dropTarget)&&(this.dropTarget["acceptDrag"])&&(this.dropTarget.acceptDrag(this.dragSource))){
			this.targetAccepts = true;
		}else{
			this.targetAccepts = false;
			// FIXME: visually signal that the drop won't work!
		}
		return this.targetAccepts;
	}

	this.drag = function(nativeEvt){
		// FIXME: when dragging over a potential drop target, we must ask it if
		// it can accept our selected items. Need to preform that check here
		// and provide visual feedback.
		this.checkTargetAccepts();
		if((this.dropTarget)&&(this.dragSource)){
			this.dropTarget.handleDrag(this.dragSource, nativeEvt);
		}
	}

	this.drop = function(nativeEvt){
		// FIXME: we need to pass dojo.webui.selection to the drop target here.
		// If rejected, need to provide visual feedback of rejection. Need to
		// determine how to handle copy vs. move drags and if that can/should
		// be set by the dragged items or the receiver of the drop event.
		if((this.dropTarget)&&(this.dragSource)&&(this.targetAccepts)){
			this.dropTarget.handleDrop(this.dragSource, nativeEvt);
		}
	}
}

/* FIXME:
 *	The base widget classes should support drag-and-drop completely, but
 *	perhaps through a mixin.  Firstly, any widget should implement a "drop"
 *	handler that implements multiple states. The first state is an accepted
 *	drop, in which case the widget is passed to the There needs to be support
 *	for an acception rubric based on type and/or some other set of handler
 *	functions that can act as gatekeepers. These acceptance functions should be
 *	settable through property sets on a type or instance basis.  Likewise, a
 *	"provisional" state which eventually results in the accepted or denied
 *	states must be supported (at least visually). A drop-rejection must also be
 *	made available, in which the widget "move" is never completed, but the
 *	provisional drop is rolled back visually.
 */

// FIXME: need to support types of drops other than movement, such as copying.
//		  Should this be modifiable keystrokes in order to set what should be
//		  done?
// FIXME: need to select collections of selected objects. Is this a clipboard
// 		  concept? Will we want our own clipboard?

dojo.webui.Selection = function(){

	this.selected = [];
	var selectionIndexProp = "_dojo.webui.selection.index";
	// var selectionTypeProp = "_dojo.webui.selection.type";

	this.add = function(obj, type){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(true);
		}
		// obj[selectionIndexProp] = this.selected.length;
		this.selected.push([obj, ((!type) ? (new String(typeof obj)) : type)]);
		// obj[selectionTypeProp] = (!type) ? (new String(typeof obj)) : type;
		// dj_debug(obj[selectionTypeProp]);
	}

	this.getSelected = function(){
		var ret = [];
		for(var x=0; x<this.selected.length; x++){
			if(this.selected[x]){
				ret.push({
					value: this.selected[x][0],
					type: this.selected[x][1]
				});
			}
		}
		return ret;
	}

	this.getTypes = function(){
		var uniqueTypes = [];
		for(var x=0; x<this.selected.length; x++){
			// var st = this.selected[x][selectionTypeProp];
			var st = this.selected[x][1];
			if((this.selected[x])&&(!uniqueTypes[st])){
				uniqueTypes[st] = true;
				uniqueTypes.push(st);
			}
		}
		return uniqueTypes;
	}

	this.addMultiple = function(){
		// FIXME: how do we pass type info!?
		for(var x=0; x<arguments.length; x++){
			this.add(arguments[x]);
		}
	}

	this.remove = function(obj){
		if(typeof obj["setSelected"] == "function"){
			obj.setSelected(false);
		}
		if(typeof obj[selectionIndexProp] != "undefined"){
		}else{
			for(var x=0; x<this.selected.length; x++){
				if(this.selected[x] === obj){
					// delete this.selected[x][selectionIndexProp];
					// delete this.selected[x][selectionTypeProp];
					delete this.selected[x];
				}
			}
		}
	}

	this.clear = function(){
		for(var x=0; x<this.selected.length; x++){
			if(this.selected[x]){
				this.remove(this.selected[x]);
			}
		}
		this.selected = [];
	}
}

// the drag and drop manager is a singleton
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
		var rw = new function(){
			dojo.webui.HtmlWidget.call(this);
			this.buildRendering = function(){ return; }
			this.destroyRendering = function(){ return; }
			this.postInitialize = function(){ return; }
			this.cleanUp = function(){ return; }
			this.widgetType = "HTMLRootWidget";
			this.domNode = document.body;
			this.widgetId = "html_builtin";
		}
		// FIXME: need to attach to DOM events and the like here
		
		var htmldm = dojo.webui.htmlDragAndDropManager;
		dojo.event.connect(document, "onkeydown", htmldm, "keyDown");
		dojo.event.connect(document, "onmousemove", htmldm, "mouseMove");
		dojo.event.connect(document, "onmouseover", htmldm, "mouseOver");
		dojo.event.connect(document, "onmouseout", htmldm, "mouseOut");
		dojo.event.connect(document, "onmousedown", htmldm, "mouseDown");
		dojo.event.connect(document, "onmouseup", htmldm, "mouseUp");

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
