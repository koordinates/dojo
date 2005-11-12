dojo.provide("dojo.widget.LayoutPane");
dojo.provide("dojo.widget.HtmlLayoutPane");

//
// this widget provides Delphi-style panel layout semantics
// this is a good place to stash layout logic, then derive components from it
//
// TODO: allow more edge priority orders (e.g. t,r,l,b)
// TODO: allow percentage sizing stuff
//

dojo.require("dojo.widget.*");
dojo.require("dojo.event.*");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.HtmlContainer");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.string");


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

	cssPath: dojo.uri.dojoUri("src/widget/templates/HtmlLayoutPane.css"),

	// If this pane's content is external then set the url here	
	url: "inline",
	extractContent: true,
	parseContent: true,
	
	// To generate pane content from a java function
	handler: "none",

	minWidth: 0,
	minHeight: 0,

	fillInTemplate: function(){
		this.filterAllowed('layoutAlign',         ['none', 'left', 'top', 'right', 'bottom', 'client']);
		this.filterAllowed('layoutChildPriority', ['left-right', 'top-bottom']);

		// Need to include CSS manually because there is no template file/string
		dojo.style.insertCssFile(this.cssPath, null, true);

		this.domNode.style.position = 'relative';
		dojo.html.addClass(this.domNode, "dojoLayoutPane");
		dojo.html.addClass(this.domNode, "dojoAlign" + dojo.string.capitalize(this.layoutAlign));		
	},

	postCreate: function(args, fragment, parentComp){

		for(var i=0; i<this.children.length; i++){
			if (this.hasLayoutAlign(this.children[i])){
				this.children[i].domNode.style.position = 'absolute';
				this.children[i].isChild = true;	
			}
		}

		if ( this.handler != "none" ){
			this.setHandler(this.handler);
		}
		if ( dojo.lang.isFunction(this.handler)) {
			this.runHandler();
		} else if ( this.url != "inline" ) {
			this.downloadExternalContent(this.url, true);
		}
		this.resizeSoon();
	},

	// Reset the (external defined) content of this pane
	setUrl: function(url) {
		this.url = url;
		this.downloadExternalContent(url, true);
	},

	downloadExternalContent: function(url, useCache) {
		var node = this.domNode;
		node.innerHTML = "Loading...";

		var extract = this.extractContent;
		var parse = this.parseContent;
		var self = this;

		dojo.io.bind({
			url: url,
			useCache: useCache,
			mimetype: "text/html",
			handler: function(type, data, e) {
				if(type == "load") {
					if(extract) {
						var matches = data.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
						if(matches) { data = matches[1]; }
					}
					node.innerHTML = data;
					this.isLoaded = true;
					if(parse) {
						var parser = new dojo.xml.Parse();
						var frag = parser.parseElement(node, null, true);
						dojo.widget.getParser().createComponents(frag);
					}
					self.onResized();
				} else {
					node.innerHTML = "Error loading '" + url + "' (" + e.status + " " + e.statusText + ")";
				}
			}
		});
	},

	// Generate pane content from given java function
	setHandler: function(handler) {
		var fcn = dojo.lang.isFunction(handler) ? handler : window[handler];
		if(!dojo.lang.isFunction(fcn)) {
			throw new Error("Unable to set handler, '" + handler + "' not a function.");
			return;
		}
		this.handler = function() {
			return fcn.apply(this, arguments);
		}
	},

	runHandler: function() {
		if(dojo.lang.isFunction(this.handler)) {
			this.handler(this, this.domNode);
			return false;
		}
		return true;
		/*
		// in case we want to honor the return value?
		var ret = true;
		if(dojo.lang.isFunction(this.handler) {
			var val = this.handler(this, panel);
			if(!dojo.lang.isUndefined(val)) {
				ret = val;
			}
		}
		return ret;
		*/
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
		// Put every child in the same position.  (If there is more than one
		// child; caller should set all but one to "display: none"
		for(var i=0; i<kids.client.length; i++){

			this.positionChild(kids.client[i], this.clientRect.left, this.clientRect.top);
			
			dojo.style.setOuterWidth(kids.client[i].domNode, this.clientRect.right - this.clientRect.left);		
			dojo.style.setOuterHeight(kids.client[i].domNode, this.clientRect.bottom - this.clientRect.top);

		}

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

		this.resizeSoon();
	},

	removePane: function(pane){

		var idx = dojo.lang.find(this.children, pane);
		if ( idx != -1 ) {
			this.children.splice(idx, 1);
		}
		
		dojo.dom.removeNode(pane.domNode);

		this.resizeSoon();
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
	},

	resizeTo: function(w, h){

		w = Math.max(w, this.getMinWidth());
		h = Math.max(h, this.getMinHeight());

		dojo.style.setOuterWidth(this.domNode, w);
		dojo.style.setOuterHeight(this.domNode, h);
		this.onResized();
	},
	
	show: function(){
		// On IE, if this node was created while display=="none" then it
		// didn't get laid out correctly; fix that here.
		if ( this.domNode.style.display=="none" ) {
			this.domNode.style.display="";
			this.onResized();
			this.domNode.style.display="none";
		}
		dojo.widget.HtmlLayoutPane.superclass.show.call(this);
	},

	getMinWidth: function(){

		//
		// we need to first get the cumulative width
		//

		var w = this.minWidth;

		if ((this.layoutAlign == 'left') || (this.layoutAlign == 'right')){

			w = dojo.style.getOuterWidth(this.domNode);
		}

		for(var i=0; i<this.children.length; i++){
			var ch = this.children[i];
			var a = ch.layoutAlign;

			if ((a == 'left') || (a == 'right') || (a == 'client')){

				if (dojo.lang.isFunction(ch.getMinWidth)){
					w += ch.getMinWidth();
				}
			}
		}

		//
		// but then we need to check to see if the top/bottom kids are larger
		//

		for(var i=0; i<this.children.length; i++){
			var ch = this.children[i];
			var a = ch.layoutAlign;

			if ((a == 'top') || (a == 'bottom')){

				if (dojo.lang.isFunction(ch.getMinWidth)){
					w = Math.max(w, ch.getMinWidth());
				}
			}
		}

		return w;
	},

	getMinHeight: function(){

		//
		// we need to first get the cumulative height
		//

		var h = this.minHeight;

		if ((this.layoutAlign == 'top') || (this.layoutAlign == 'bottom')){

			h = dojo.style.getOuterHeight(this.domNode);
		}

		for(var i=0; i<this.children.length; i++){
			var ch = this.children[i];
			var a = ch.layoutAlign;

			if ((a == 'top') || (a == 'bottom') || (a == 'client')){

				if (dojo.lang.isFunction(ch.getMinHeight)){
					h += ch.getMinHeight();
				}
			}
		}

		//
		// but then we need to check to see if the left/right kids are larger
		//

		for(var i=0; i<this.children.length; i++){
			var ch = this.children[i];
			var a = ch.layoutAlign;

			if ((a == 'left') || (a == 'right')){

				if (dojo.lang.isFunction(ch.getMinHeight)){
					h = Math.max(h, ch.getMinHeight());
				}
			}
		}

		return h;
	}
});

dojo.widget.tags.addParseTreeHandler("dojo:LayoutPane");
