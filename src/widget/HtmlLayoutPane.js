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
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");

dojo.widget.HtmlLayoutPane = function(){

	dojo.widget.HtmlWidget.call(this);

	this.widgetType = "LayoutPane";

	this.isContainer = true;
	this.containerNode = null;
	this.domNode = null;
	this.isChild = false;

	this.clientRect = {'left':0, 'right':0, 'top':0, 'bottom':0};
	this.clientWidth = 0;
	this.clientHeight = 0;

	this.layoutAlign = 'none';
	this.layoutChildPriority = 'top-bottom';
	this.layoutSizeMode = 'relative';


	this.fillInTemplate = function(){

		this.filterAllowed('layoutAlign',         ['none', 'left', 'top', 'right', 'bottom', 'client']);
		this.filterAllowed('layoutChildPriority', ['left-right', 'top-bottom']);
		this.filterAllowed('layoutSizeMode',      ['absolute', 'relative']);

		// if we're a child panel, this will get updated by our parent's postCreate

		this.domNode.style.position = 'relative';
		dojo.event.connect(window, 'onresize', this, 'layoutChildren');
	}

	this.postCreate = function(args, fragment, parentComp){

		// attach our children

		for(var i=0; i<this.children.length; i++){
			this.domNode.appendChild(this.children[i].domNode);

			if (this.hasLayoutAlign(this.children[i])){
				this.children[i].domNode.style.position = 'absolute';
				this.children[i].isChild = true;
				dojo.event.disconnect(window, 'onresize', this.children[i], 'layoutChildren');
			}
		}

		this.layoutChildren();
	}

	this.filterAllowed = function(param, values){

		for(i in values){
			if (this[param] == values[i]){
				return;
			}
		}
		this[param] = values[0];
	}

	this.layoutChildren = function(){

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

		this.clientWidth = dojo.style.getContentWidth(this.domNode);
		this.clientHeight = dojo.style.getContentHeight(this.domNode);
		this.clientRect['left'] = 0;
		this.clientRect['right'] = this.clientWidth;
		this.clientRect['top'] = 0;
		this.clientRect['bottom'] = this.clientHeight;


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
	}

	this.layoutTop = function(kids){

		for(var i=0; i<kids.top.length; i++){

			kids.top[i].domNode.style.left = this.clientRect.left + 'px';
			kids.top[i].domNode.style.top = this.clientRect.top + 'px';

			dojo.style.setOuterWidth(kids.top[i].domNode, this.clientRect.right - this.clientRect.left);
			this.clientRect.top += dojo.style.getOuterHeight(kids.top[i].domNode);

			kids.top[i].onResized();
		}
	}

	this.layoutBottom = function(kids){

		for(var i=0; i<kids.bottom.length; i++){

			var h = dojo.style.getOuterHeight(kids.bottom[i].domNode);

			kids.bottom[i].domNode.style.left = this.clientRect.left + 'px';
			kids.bottom[i].domNode.style.top = (this.clientRect.bottom - h) + 'px';

			dojo.style.setOuterWidth(kids.bottom[i].domNode, this.clientRect.right - this.clientRect.left);
			this.clientRect.bottom -= h;

			kids.bottom[i].onResized();
		}
	}

	this.layoutLeft = function(kids){

		for(var i=0; i<kids.left.length; i++){

			kids.left[i].domNode.style.left = this.clientRect.left + 'px';
			kids.left[i].domNode.style.top = this.clientRect.top + 'px';

			dojo.style.setOuterHeight(kids.left[i].domNode, this.clientRect.bottom - this.clientRect.top);
			this.clientRect.left += dojo.style.getOuterWidth(kids.left[i].domNode);

			kids.left[i].onResized();
		}
	}

	this.layoutRight = function(kids){

		for(var i=0; i<kids.right.length; i++){

			var w = dojo.style.getOuterWidth(kids.right[i].domNode);

			kids.right[i].domNode.style.left = (this.clientRect.right - w) + 'px';
			kids.right[i].domNode.style.top = this.clientRect.top + 'px';

			dojo.style.setOuterHeight(kids.right[i].domNode, this.clientRect.bottom - this.clientRect.top);
			this.clientRect.right -= w;

			kids.right[i].onResized();
		}
	}

	this.layoutClient = function(kids){

		if (kids.client[1]){
			dojo.debug('We can only layout one client pane per parent pane!');
		}

		if (!kids.client[0]){
			return;
		}

		
		kids.client[0].domNode.style.left = this.clientRect.left + 'px';
		kids.client[0].domNode.style.top = this.clientRect.top + 'px';

		dojo.style.setOuterWidth(kids.client[0].domNode, this.clientRect.right - this.clientRect.left);
		dojo.style.setOuterHeight(kids.client[0].domNode, this.clientRect.bottom - this.clientRect.top);

		kids.client[0].onResized();
	}

	this.hasLayoutAlign = function(child){
		if (child.layoutAlign == 'left'){ return 1; }
		if (child.layoutAlign == 'right'){ return 1; }
		if (child.layoutAlign == 'top'){ return 1; }
		if (child.layoutAlign == 'bottom'){ return 1; }
		if (child.layoutAlign == 'client'){ return 1; }
		return 0;
	}

	this.onResized = function(){
		// override me!
	}
}

dojo.inherits(dojo.widget.HtmlLayoutPane, dojo.widget.HtmlWidget);

dojo.widget.tags.addParseTreeHandler("dojo:LayoutPane");
