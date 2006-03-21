dojo.provide("dojo.dnd.HtmlDragManager");
dojo.require("dojo.dnd.DragAndDrop");
dojo.require("dojo.event.*");
dojo.require("dojo.lang.array");
dojo.require("dojo.html");
dojo.require("dojo.style");

// NOTE: there will only ever be a single instance of HTMLDragManager, so it's
// safe to use prototype properties for book-keeping.
dojo.dnd.HtmlDragManager = function(){
}

dojo.inherits(dojo.dnd.HtmlDragManager, dojo.dnd.DragManager);

dojo.lang.extend(dojo.dnd.HtmlDragManager, {
	/**
	 * There are several sets of actions that the DnD code cares about in the
	 * HTML context:
	 *	1.) mouse-down ->
	 *			(draggable selection)
	 *			(dragObject generation)
	 *		mouse-move ->
	 *			(draggable movement)
	 *			(droppable detection)
	 *			(inform droppable)
	 *			(inform dragObject)
	 *		mouse-up
	 *			(inform/destroy dragObject)
	 *			(inform draggable)
	 *			(inform droppable)
	 *	2.) mouse-down -> mouse-down
	 *			(click-hold context menu)
	 *	3.) mouse-click ->
	 *			(draggable selection)
	 *		shift-mouse-click ->
	 *			(augment draggable selection)
	 *		mouse-down ->
	 *			(dragObject generation)
	 *		mouse-move ->
	 *			(draggable movement)
	 *			(droppable detection)
	 *			(inform droppable)
	 *			(inform dragObject)
	 *		mouse-up
	 *			(inform draggable)
	 *			(inform droppable)
	 *	4.) mouse-up
	 *			(clobber draggable selection)
	 */
	disabled: false, // to kill all dragging!
	nestedTargets: false,
	mouseDownTimer: null, // used for click-hold operations
	dsCounter: 0,
	dsPrefix: "dojoDragSource",

	// dimension calculation cache for use durring drag
	dropTargetDimensions: [],

	currentDropTarget: null,
	// currentDropTargetPoints: null,
	previousDropTarget: null,
	_dragTriggered: false,

	selectedSources: [],
	dragObjects: [],

	// mouse position properties
	currentX: null,
	currentY: null,
	lastX: null,
	lastY: null,
	mouseDownX: null,
	mouseDownY: null,
	threshold: 7,

	dropAcceptable: false,

	cancelEvent: function(e){ e.stopPropagation(); e.preventDefault();},

	// method over-rides
	registerDragSource: function(ds){
		if(ds["domNode"]){
			// FIXME: dragSource objects SHOULD have some sort of property that
			// references their DOM node, we shouldn't just be passing nodes and
			// expecting it to work.
			var dp = this.dsPrefix;
			var dpIdx = dp+"Idx_"+(this.dsCounter++);
			ds.dragSourceId = dpIdx;
			this.dragSources[dpIdx] = ds;
			ds.domNode.setAttribute(dp, dpIdx);

			// so we can drag links
			if(dojo.render.html.ie){
				dojo.event.connect(ds.domNode, "ondragstart", this.cancelEvent);
			}
		}
	},

	unregisterDragSource: function(ds){
		if (ds["domNode"]){

			var dp = this.dsPrefix;
			var dpIdx = ds.dragSourceId;
			delete ds.dragSourceId;
			delete this.dragSources[dpIdx];
			ds.domNode.setAttribute(dp, null);
		}
		if(dojo.render.html.ie){
			dojo.event.disconnect(ds.domNode, "ondragstart", this.cancelEvent );
		}
	},

	registerDropTarget: function(dt){
		this.dropTargets.push(dt);
	},

	unregisterDropTarget: function(dt){
		var index = dojo.lang.find(this.dropTargets, dt, true);
		if (index>=0) {
			this.dropTargets.splice(index, 1);
		}
	},

	getDragSource: function(e){
		var tn = e.target;
		if(tn === document.body){ return; }
		var ta = dojo.html.getAttribute(tn, this.dsPrefix);
		while((!ta)&&(tn)){
			tn = tn.parentNode;
			if((!tn)||(tn === document.body)){ return; }
			ta = dojo.html.getAttribute(tn, this.dsPrefix);
		}
		return this.dragSources[ta];
	},

	onKeyDown: function(e){
	},

	onMouseDown: function(e){
		if(this.disabled) { return; }

		// only begin on left click
		if(dojo.render.html.ie) {
			if(e.button != 1) { return; }
		} else if(e.which != 1) {
			return;
		}

		var target = e.target.nodeType == dojo.dom.TEXT_NODE ?
			e.target.parentNode : e.target;

		// do not start drag involvement if the user is interacting with
		// a form element.
		if(dojo.html.isTag(target, "button", "textarea", "input")) {
			return;
		}

		// find a selection object, if one is a parent of the source node
		var ds = this.getDragSource(e);
		
		// this line is important.  if we aren't selecting anything then
		// we need to return now, so preventDefault() isn't called, and thus
		// the event is propogated to other handling code
		if(!ds){ return; }

		if(!dojo.lang.inArray(this.selectedSources, ds)){
			this.selectedSources.push(ds);
		}

		this.mouseDownX = e.clientX;
		this.mouseDownY = e.clientY;

		// Must stop the mouse down from being propogated, or otherwise can't
		// drag links in firefox.
		// WARNING: preventing the default action on all mousedown events
		// prevents user interaction with the contents.
		e.preventDefault();

		dojo.event.connect(document, "onmousemove", this, "onMouseMove");
	},

	onMouseUp: function(e, cancel){
		// if we aren't dragging then ignore the mouse-up
		// (in particular, don't call preventDefault(), because other
		// code may need to process this event)
		if(this.selectedSources.length==0){
			return;
		}

		this.mouseDownX = null;
		this.mouseDownY = null;
		this._dragTriggered = false;
		var _this = this;
 		e.preventDefault();
		e.dragSource = this.dragSource;
		if((!e.shiftKey)&&(!e.ctrlKey)){
			if(_this.currentDropTarget) {
				_this.currentDropTarget.onDropStart();
			}
			dojo.lang.forEach(this.dragObjects, function(tempDragObj){
				var ret = null;
				if(!tempDragObj){ return; }
				if(_this.currentDropTarget) {
					e.dragObject = tempDragObj;

					// NOTE: we can't get anything but the current drop target
					// here since the drag shadow blocks mouse-over events.
					// This is probelematic for dropping "in" something
					var ce = _this.currentDropTarget.domNode.childNodes;
					if(ce.length > 0){
						e.dropTarget = ce[0];
						while(e.dropTarget == tempDragObj.domNode){
							e.dropTarget = e.dropTarget.nextSibling;
						}
					}else{
						e.dropTarget = _this.currentDropTarget.domNode;
					}
					if (_this.dropAcceptable){
						ret = _this.currentDropTarget.onDrop(e);
					} else {
						 _this.currentDropTarget.onDragOut(e);
					}
				}

				e.dragStatus = _this.dropAcceptable && ret ? "dropSuccess" : "dropFailure";
				tempDragObj.dragSource.onDragEnd(e);
				tempDragObj.onDragEnd(e);
			});

			this.selectedSources = [];
			this.dragObjects = [];
			this.dragSource = null;
			if(_this.currentDropTarget) {
				_this.currentDropTarget.onDropEnd();
			}
		}

		dojo.event.disconnect(document, "onmousemove", this, "onMouseMove");
		this.currentDropTarget = null;
	},

	onScroll: function() {
		for(var i = 0; i < this.dragObjects.length; i++) {
			if(this.dragObjects[i].updateDragOffset) {
				this.dragObjects[i].updateDragOffset();
			}
		}
		// TODO: do not recalculate, only adjust coordinates
		this.cacheTargetLocations();
	},

	_dragStartDistance: function(x, y){
		if((!this.mouseDownX)||(!this.mouseDownX)){
			return;
		}
		var dx = Math.abs(x-this.mouseDownX);
		var dx2 = dx*dx;
		var dy = Math.abs(y-this.mouseDownY);
		var dy2 = dy*dy;
		return parseInt(Math.sqrt(dx2+dy2), 10);
	},

	cacheTargetLocations: function() {
		var _this = this;

		this.dropTargetDimensions = [];
		dojo.lang.forEach(this.dropTargets, function(tempTarget){
			var tn = tempTarget.domNode;
			if(!tn){ return; }
			var ttx = dojo.style.getAbsoluteX(tn, true);
			var tty = dojo.style.getAbsoluteY(tn, true);
			_this.dropTargetDimensions.push([
				[ttx, tty],	// upper-left
				// lower-right
				[ ttx+dojo.style.getInnerWidth(tn), tty+dojo.style.getInnerHeight(tn) ],
				tempTarget
			]);
			//dojo.debug("Cached for "+tempTarget)
		});

		//dojo.debug("Cache locations")

	},

	onMouseMove: function(e){
		var _this = this;
		if(dojo.render.html.ie && e.button != 1) {
			// Oooops - mouse up occurred - e.g. when mouse was not over the window.
			// I don't think we can detect this for FF - but at least we can be nice in IE.
			this.currentDropTarget = null;
			this.onMouseUp(e, true);
			return;
		}
		// if we've got some sources, but no drag objects, we need to send
		// onDragStart to all the right parties and get things lined up for
		// drop target detection
		if(	(this.selectedSources.length)&&
			(!this.dragObjects.length) ){
			var dx;
			var dy;
			if(!this._dragTriggered){
				this._dragTriggered = (this._dragStartDistance(e.clientX, e.clientY) > this.threshold);
				if(!this._dragTriggered){ return; }
				dx = e.clientX-this.mouseDownX;
				dy = e.clientY-this.mouseDownY;
			}

			if (this.selectedSources.length == 1) {
				this.dragSource = this.selectedSources[0];
			}

			dojo.lang.forEach(this.selectedSources, function(tempSource){
				if(!tempSource){ return; }
				var tdo = tempSource.onDragStart(e);
				if(tdo){
					tdo.onDragStart(e);

					// "bump" the drag object to account for the drag threshold
					tdo.dragOffset.top += dy;
					tdo.dragOffset.left += dx;
					tdo.dragSource = tempSource;

					_this.dragObjects.push(tdo);
				}
			});

			/* clean previous drop target in dragStart */
			this.previousDropTarget = null;

			this.cacheTargetLocations();
		}
		// FIXME: we need to add dragSources and dragObjects to e
		for (var i = 0; i < this.dragObjects.length; i++){
			if(this.dragObjects[i]){ this.dragObjects[i].onDragMove(e); }
		}

		// if we have a current drop target, check to see if we're outside of
		// it. If so, do all the actions that need doing.
		if (this.currentDropTarget) {
			//dojo.debug(dojo.dom.hasParent(this.currentDropTarget.domNode))
			var c = dojo.html.toCoordinateArray(this.currentDropTarget.domNode);
			//		var dtp = this.currentDropTargetPoints;
			var dtp = [
				[c[0],c[1]], [c[0]+c[2], c[1]+c[3]]
			];
		}

		if((!this.nestedTargets)&&(dtp)&&(this.isInsideBox(e, dtp))){
			if(this.dropAcceptable){
				this.currentDropTarget.onDragMove(e, this.dragObjects);
			}
		}else{
			// FIXME: need to fix the event object!
			// see if we can find a better drop target
			var bestBox = this.findBestTarget(e);

			if(bestBox.target === null){
				if(this.currentDropTarget){
					this.currentDropTarget.onDragOut(e);
					this.previousDropTarget = this.currentDropTarget;
					this.currentDropTarget = null;
					// this.currentDropTargetPoints = null;
				}
				this.dropAcceptable = false;
				return;
			}

			if(this.currentDropTarget !== bestBox.target){
				if(this.currentDropTarget){
					this.previousDropTarget = this.currentDropTarget;
					this.currentDropTarget.onDragOut(e);
				}
				this.currentDropTarget = bestBox.target;
				// this.currentDropTargetPoints = bestBox.points;
				e.dragObjects = this.dragObjects;
				this.dropAcceptable = this.currentDropTarget.onDragOver(e);

			}else{
				if(this.dropAcceptable){
					this.currentDropTarget.onDragMove(e, this.dragObjects);
				}
			}

		}
	},

	findBestTarget: function(e) {
		var _this = this;
		var bestBox = new Object();
		bestBox.target = null;
		bestBox.points = null;
		dojo.lang.forEach(this.dropTargetDimensions, function(tmpDA) {
			if(_this.isInsideBox(e, tmpDA)){
				bestBox.target = tmpDA[2];
				bestBox.points = tmpDA;
				if(!_this.nestedTargets){ return "break"; }
			}
		});

		return bestBox;
	},

	isInsideBox: function(e, coords){
		if(	(e.clientX > coords[0][0])&&
			(e.clientX < coords[1][0])&&
			(e.clientY > coords[0][1])&&
			(e.clientY < coords[1][1]) ){
			return true;
		}
		return false;
	},

	onMouseOver: function(e){
	},

	onMouseOut: function(e){
	}
});

dojo.dnd.dragManager = new dojo.dnd.HtmlDragManager();

// global namespace protection closure
(function(){
	var d = document;
	var dm = dojo.dnd.dragManager;
	// set up event handlers on the document
	dojo.event.connect(d, "onkeydown", 		dm, "onKeyDown");
	dojo.event.connect(d, "onmouseover",	dm, "onMouseOver");
	dojo.event.connect(d, "onmouseout", 	dm, "onMouseOut");
	dojo.event.connect(d, "onmousedown",	dm, "onMouseDown");
	dojo.event.connect(d, "onmouseup",		dm, "onMouseUp");
	// TODO: process scrolling of elements, not only window
	dojo.event.connect(window, "onscroll",	dm, "onScroll");
})();
