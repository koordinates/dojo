dojo.provide("dojo.widget.FloatingPane");
dojo.provide("dojo.widget.HtmlFloatingPane");

//
// this widget provides a window-like floating pane
//

dojo.require("dojo.widget.*");
dojo.require("dojo.html");
dojo.require("dojo.style");
dojo.require("dojo.dom");
dojo.require("dojo.widget.HtmlLayoutPane");

dojo.widget.HtmlFloatingPane = function(){
	dojo.widget.HtmlLayoutPane.call(this);
}

dojo.inherits(dojo.widget.HtmlFloatingPane, dojo.widget.HtmlLayoutPane);

dojo.lang.extend(dojo.widget.HtmlFloatingPane, {
	widgetType: "FloatingPane",

	isContainer: true,
	containerNode: null,
	domNode: null,
	clientPane: null,
	dragBar: null,
	dragOrigin: null,
	posOrigin: null,
	title: 'Untitled',
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/HtmlFloatingPane.css"),


	fillInTemplate: function(){

		if (this.templateCssPath) {
			dojo.style.insertCssFile(this.templateCssPath, null, true);
		}

		//this.domNode.style.position = 'absolute';
		dojo.html.addClass(this.domNode, 'dojoFloatingPane');

		// this is our client area

		var elm = document.createElement('div');
		dojo.dom.moveChildren(this.domNode, elm, 0);
		dojo.html.addClass(elm, 'dojoFloatingPaneClient');
		this.clientPane = this.createPane(elm, 'client');


		// this is our chrome

		var elm = document.createElement('div');
		elm.appendChild(document.createTextNode(this.title));
		dojo.html.addClass(elm, 'dojoFloatingPaneDragbar');
		this.dragBar = this.createPane(elm, 'top');

		dojo.html.disableSelection(this.dragBar.domNode);
		dojo.event.connect(this.dragBar.domNode, 'onmousedown', this, 'onDragStart');

		this.layoutSoon();
	},

	postCreate: function(args, fragment, parentComp){

		// attach our children

		for(var i=0; i<this.children.length; i++){
		//	this.domNode.appendChild(this.children[i].domNode);
		}
	},

	createPane: function(node, align){

		var pane = dojo.widget.fromScript("LayoutPane", { layoutAlign: align }, node);

		this.addPane(pane);

		return pane;
	},

	onDragStart: function(e){

		this.dragOrigin = {'x': e.pageX, 'y': e.pageY};
		this.posOrigin = {'x': dojo.style.getNumericStyle(this.domNode, 'left'), 'y': dojo.style.getNumericStyle(this.domNode, 'top')};

		//dojo.debugStruct(e);

		dojo.event.connect(window, 'onmousemove', this, 'onDragMove');
		dojo.event.connect(window, 'onmouseup', this, 'onDragEnd');
	},

	onDragMove: function(e){

		var dx = e.pageX - this.dragOrigin.x;
		var dy = e.pageY - this.dragOrigin.y;

		this.domNode.style.left = (this.posOrigin.x + dx) + 'px';
		this.domNode.style.top  = (this.posOrigin.y + dy) + 'px';

		//dojo.debug('drag '+dx+','+dy);
	},

	onDragEnd: function(e){

		dojo.event.disconnect(window, 'onmousemove', this, 'onDragMove');
		dojo.event.disconnect(window, 'onmouseup', this, 'onDragEnd');
	},
	
});

dojo.widget.tags.addParseTreeHandler("dojo:FloatingPane");
