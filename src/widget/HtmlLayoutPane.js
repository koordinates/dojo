dojo.provide("dojo.widget.LayoutPane");
dojo.provide("dojo.widget.HtmlLayoutPane");

//
// this widget provides Delphi-style panel layout semantics
// this is a good place to stash layout logic, then derive components from it
//
// TODO: allow more edge priority orders (e.g. t,r,l,b)
// TODO: allow percentage sizing stuff
// TODO: integrate somehow with HtmlSplitPane stuff?
//

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlContainer");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");

dojo.widget.HtmlLayoutPane = function(){
	dojo.widget.HtmlContainer.call(this);
}

dojo.inherits(dojo.widget.HtmlLayoutPane, dojo.widget.HtmlContainer);

dojo.lang.extend(dojo.widget.HtmlLayoutPane, {
	widgetType: "LayoutPane",

	isChild: false,

	clientLeft: 0,
	clientTop: 0,
	clientRect: {'left':0, 'right':0, 'top':0, 'bottom':0},
	clientWidth: 0,
	clientHeight: 0,

	layoutAlign: 'none',
	layoutChildPriority: 'top-bottom',
	layoutSizeMode: 'relative',

	fillInTemplate: function(){
		this.filterAllowed('layoutAlign',         ['none', 'left', 'top', 'right', 'bottom', 'client']);
		this.filterAllowed('layoutChildPriority', ['left-right', 'top-bottom']);
		this.filterAllowed('layoutSizeMode',      ['absolute', 'relative']);

		this.domNode.style.position = 'relative';
	},

	postCreate: function(args, fragment, parentComp){
		this.domNode.style.position = 'relative';

		for(var i=0; i<this.children.length; i++){
			if (this.hasLayoutAlign(this.children[i])){
				this.children[i].domNode.style.position = 'absolute';
				this.children[i].isChild = true;
			}
		}

		this.layoutChildren();
	},

	filterAllowed: function(param, values){

		for(i in values){
			if (this[param] == values[i]){
				return;
			}
		}
		this[param] = values[0];
	},

	layoutChildren: function(){

		// find the children to arrange

		var kids = {'left':[], 'right':[], 'top':[], 'bottom':[], 'client':[]};
		var hits = 0;

		for(var i=0; i<this.children.length; i++){
			if (this.hasLayoutAlign(this.children[i])){
				kids[this.children[i].layoutAlign].push(this.children[i]);
				hits++;
			}
		}

		if (!hits){
			return;
		}


		// calc layout space

		this.clientWidth  = dojo.style.getContentWidth(this.domNode);
		this.clientHeight = dojo.style.getContentHeight(this.domNode);
		this.clientLeft   = dojo.style.getPixelValue(this.domNode, "padding-left", true);
		this.clientTop    = dojo.style.getPixelValue(this.domNode, "padding-top", true);

		this.clientRect['left']   = this.clientLeft;
		this.clientRect['right']  = this.clientLeft + this.clientWidth;
		this.clientRect['top']    = this.clientTop;
		this.clientRect['bottom'] = this.clientTop + this.clientHeight;


		// arrange them in order

		if (this.layoutChildPriority == 'top-bottom'){

			this.layoutTop(kids);
			this.layoutBottom(kids);
			this.layoutLeft(kids);
			this.layoutRight(kids);
		}else{
			this.layoutLeft(kids);
			this.layoutRight(kids);
			this.layoutTop(kids);
			this.layoutBottom(kids);
		}
		this.layoutClient(kids);
	},

	layoutTop: function(kids){

		for(var i=0; i<kids.top.length; i++){

			this.positionChild(kids.top[i], this.clientRect.left, this.clientRect.top);

			dojo.style.setOuterWidth(kids.top[i].domNode, this.clientRect.right - this.clientRect.left);
			this.clientRect.top += dojo.style.getOuterHeight(kids.top[i].domNode);
		}
	},

	layoutBottom: function(kids){

		for(var i=0; i<kids.bottom.length; i++){

			var h = dojo.style.getOuterHeight(kids.bottom[i].domNode);

			this.positionChild(kids.bottom[i], this.clientRect.left, this.clientRect.bottom - h);

			dojo.style.setOuterWidth(kids.bottom[i].domNode, this.clientRect.right - this.clientRect.left);
			this.clientRect.bottom -= h;
		}
	},

	layoutLeft: function(kids){

		for(var i=0; i<kids.left.length; i++){

			this.positionChild(kids.left[i], this.clientRect.left, this.clientRect.top);

			dojo.style.setOuterHeight(kids.left[i].domNode, this.clientRect.bottom - this.clientRect.top);
			this.clientRect.left += dojo.style.getOuterWidth(kids.left[i].domNode);
		}
	},

	layoutRight: function(kids){

		for(var i=0; i<kids.right.length; i++){

			var w = dojo.style.getOuterWidth(kids.right[i].domNode);

			this.positionChild(kids.right[i], this.clientRect.right - w, this.clientRect.top);

			dojo.style.setOuterHeight(kids.right[i].domNode, this.clientRect.bottom - this.clientRect.top);
			this.clientRect.right -= w;
		}
	},

	layoutClient: function(kids){

		if (kids.client[1]){
			dojo.debug('We can only layout one client pane per parent pane!');
		}

		if (!kids.client[0]){
			return;
		}

		this.positionChild(kids.client[0], this.clientRect.left, this.clientRect.top);
		
		dojo.style.setOuterWidth(kids.client[0].domNode, this.clientRect.right - this.clientRect.left);		
		dojo.style.setOuterHeight(kids.client[0].domNode, this.clientRect.bottom - this.clientRect.top);
	},

	positionChild: function(child, x, y){

		if (child.domNode.style.position == 'relative'){

			x -= this.clientLeft;
			y -= this.clientTop;
		}

		child.domNode.style.left = x + 'px';
		child.domNode.style.top = y + 'px';
	},

	hasLayoutAlign: function(child){
		if (child.layoutAlign == 'left'){ return 1; }
		if (child.layoutAlign == 'right'){ return 1; }
		if (child.layoutAlign == 'top'){ return 1; }
		if (child.layoutAlign == 'bottom'){ return 1; }
		if (child.layoutAlign == 'client'){ return 1; }
		return 0;
	},

	addPane: function(pane){

		this.children.push(pane);
		this.domNode.appendChild(pane.domNode);

		pane.domNode.style.position = 'absolute';
		pane.isChild = true;

		this.onResized();
	},

	layoutSoon: function(){

		var self = this;
		var closure = function(){ return function(){ self.layoutChildren(); } }();

		window.setTimeout(closure, 0);
	},

	resizeSoon: function(){

		var self = this;
		var closure = function(){ return function(){ self.onResized(); } }();

		window.setTimeout(closure, 0);
	},

	onResized: function(){
		//dojo.debug(this.widgetId + ": resized");

		// set position/size for my children
		this.layoutChildren();

		// notify children that they have been moved/resized
		this.notifyChildrenOfResize();
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:LayoutPane");
