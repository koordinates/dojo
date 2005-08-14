dojo.provide("dojo.dnd.HtmlDragManager");
dojo.require("dojo.event.*");
dojo.require("dojo.alg.*");
dojo.require("dojo.xml.htmlUtil");

// NOTE: there will only ever be a single instance of HTMLDragManager, so it's
// safe to use prototype properties for book-keeping.
dojo.dnd.HtmlDragManager = function(){
}

dj_inherits(dojo.dnd.HtmlDragManager, dojo.dnd.DragManager);

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
	mouseDownTimer: null, // used for click-hold operations
	dsCounter: 0,
	dsPrefix: "dojoDragSource",

	// method over-rides
	registerDragSource: function(ds){
		// FIXME: dragSource objects SHOULD have some sort of property that
		// references their DOM node, we shouldn't just be passing nodes and
		// expecting it to work.
		var dp = this.dsPrefix;
		var dpIdx = dp+"Idx_"+(this.dsCounter++);
		ds.dragSourceId = dpIdx;
		this.dragSources[dpIdx] = ds;
		ds.domNode.setAttribute(dp, dpIdx);
	},

	registerDropTarget: function(dt){
		this.dropTargets.push(dt);
	},

	getDragSource: function(e){
		var tn = e.target;
		if(tn === document.body){ return; }
		var ta = dojo.xml.htmlUtil.getAttribute(tn, this.dsPrefix);
		while((!ta)&&(tn)){
			tn = tn.parentNode;
			if((!tn)||(tn === document.body)){ return; }
			ta = dojo.xml.htmlUtil.getAttribute(tn, this.dsPrefix);
		}
		return this.dragSources[ta];
	},

	onKeyDown: function(e){
	},

	onMouseDown: function(e){
		// find a selection object, if one is a parent of the source node
		var ds = this.getDragSource(e);
		if(!ds){ return; }
		if(!dojo.alg.inArray(this.selectedSources, ds)){
			this.selectedSources.push(ds);
		}
		e.preventDefault();
		dojo.event.connect(document, "onmousemove", this, "onMouseMove");
	},

	onMouseUp: function(e){
		if((!e.shiftKey)&&(!e.ctrlKey)){
			dojo.alg.forEach(this.dragObjects, function(tempDragObj){
				if(!tempDragObj){ return; }
				tempDragObj.onDragEnd({
					dragStatus: "dropFailure"
				});
			});
			this.selectedSources = [];
			this.dragObjects = [];
		}
		dojo.event.disconnect(document, "onmousemove", this, "onMouseMove");
	},

	onMouseMove: function(e){
		var _this = this;
		if((this.selectedSources.length)&&(!this.dragObjects.length)){
			dojo.alg.forEach(this.selectedSources, function(tempSource){
				if(!tempSource){ return; }
				var tdo = tempSource.onDragStart(e);
				if(tdo){
					tdo.onDragStart(e);
					_this.dragObjects.push(tdo);
				}
			});
		}
		dojo.alg.forEach(this.dragObjects, function(tempDragObj){
			if(!tempDragObj){ return; }
			tempDragObj.onDragMove(e);
		});
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
})();
