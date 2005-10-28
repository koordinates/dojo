dojo.provide("dojo.widget.TreeNode");
dojo.provide("dojo.widget.HtmlTreeNode");

dojo.require("dojo.event.*");
dojo.require("dojo.fx.html");
dojo.require("dojo.widget.Tree");
dojo.require("dojo.widget.HtmlContainer");


dojo.widget.HtmlTreeNode = function(){
	dojo.widget.HtmlTreeNode.superclass.constructor.call(this);
}
dojo.inherits(dojo.widget.HtmlTreeNode, dojo.widget.HtmlContainer);

dojo.lang.extend(dojo.widget.HtmlTreeNode, {
	widgetType: "TreeNode",
	templatePath: dojo.uri.dojoUri("src/widget/templates/TreeNode.html"),
	templateCssPath: dojo.uri.dojoUri("src/widget/templates/TreeNode.css"),

	snarfChildDomOutput: true,

	// the last node and with no children
	lastNodeLeafImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/leaf-l.gif",
	// not the last node and with no children
	notLastNodeLeafImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/leaf-t.gif",
	// the last node and with children
	lastNodeParentImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/plus-l.gif",
	// not the last node and with children
	notLastNodeParentImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/plus-t.gif",

	lastNodeParentToggleImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/minus-l.gif",
	notLastNodeParentToggleImgSrc: djConfig.baseRelativePath + "src/widget/templates/images/minus-t.gif",

	childIcon: null,
	childIconSrc: '',

	id: null,
	title: "",
	// the DOM node that holds the title and open / close controls
	nodeTitle: null,
	// the DOM text node with the title in it
	titleText: null,
	// the node which controls opening and closing the children (only exists when children are added)
	toggleControl: null,
	// the node which holds the toggle image.
	toggleImage: null,
	// the toggle strategy object which will toggle a parent node open and closed
	toggle: new dojo.widget.Tree.DefaultToggle(),
	// the outer tree containing this node
	tree: null,
	// flag to hold whether this is the last node in the branch.
	isLastNode: true,
	isExpanded: false,
	isParent: false,

	initialize: function(args, frag){
		if (!this.id) {
			this.id = this.title;
		}

		this.toggleImage.src = this.lastNodeLeafImgSrc;
		this.toggleImage.alt = "";

		if (this.childIconSrc){
			this.childIcon.src = this.childIconSrc;
			this.childIcon.alt = "";
		}else{
			if ( this.childIcon ) {
				this.childIcon.style.display = 'none';
			}
		}
	},

	addWidgetAsDirectChild: function(widget, overrideContainerNode, pos, ref, insertIndex) {

		this.isParent = 1;

		if (this.children && (this.children.length == 0)) {

			this.containerNode = document.createElement("div");
			this.domNode.appendChild(this.containerNode);
			this.containerNode.className = "TreeNodeBody";

			if(this.isLastNode){
				this.toggleImage.src = this.lastNodeParentImgSrc;
			}else{
				this.toggleImage.src = this.notLastNodeParentImgSrc;
			}

			dojo.event.connect(this.toggleImage, "onclick", this, "toggleOpened");

		}else if (this.children && (this.children.length > 0)){

			this.children[this.children.length - 1].setNotLastNode();
		}

		// Call the superclass
		return dojo.widget.HtmlTreeNode.superclass.addWidgetAsDirectChild.call(this, widget, overrideContainerNode, pos, ref, insertIndex);
		this.registerChild(widget);
	},

	removeChild: function(widget){

		var ret = dojo.widget.HtmlWidget.removeChild.call(this);

		this.isParent = (this.children && (this.children.length > 0)) ? true : false;

		return ret;
	},

	fillInTemplate: function (){
		this.titleText.appendChild(document.createTextNode(this.title));
//		dojo.event.connect(this.nodeTitle, "onmouseover", this, "onMouseOver");
//		dojo.event.connect(this.nodeTitle, "onmouseout", this, "onMouseOut");
//		dojo.event.connect(this.nodeTitle, "onmousedown", this, "onMouseDown");
//		dojo.event.connect(this.nodeTitle, "onmouseup", this, "onMouseUp");
		dojo.event.connect(this.titleText, "onclick", this, "onClick");
		if ( this.childIcon )
			dojo.event.connect(this.childIcon, "onclick", this, "onClick");
	},

	setNotLastNode: function (){
		this.isLastNode = false;
		this.updateToggleImage();
	},

	toggleOpened: function(e){
		if (this.containerNode){
			aToggle = this.getToggle();
			if (this.containerNode.style.display == "none" || this.containerNode.style.display == ""){
				aToggle.show(this.containerNode);
				this.isExpanded = true;
				this.onExpand(this, e);
			}else{
				aToggle.hide(this.containerNode);
				this.isExpanded = false;
				this.onCollapse(this, e);
			}
		}
	},

	getToggle: function (){
		if (this.parent && this.parent.getToggle) {
			return this.parent.getToggle();
		}
		return this.toggle;
	},

	onMouseOver: function (e){
	},

	onMouseOut: function (e){
	},

	onClick: function (e){
		this.onSelect(this, e);
	},

	onMouseDown: function (e){
	},

	onMouseUp: function (e){
	},

	onSelect: function (item, e){
		dojo.html.addClass(this.titleText, "TreeNodeSelected");
		dojo.html.addClass(this.childIcon, "TreeNodeSelected");
	},

	onTreeNodeSelected: function (item, e){
		if (this.id != item.id) {
			dojo.html.removeClass(this.titleText, "TreeNodeSelected");
			dojo.html.removeClass(this.childIcon, "TreeNodeSelected");
		}
	},

	onExpand: function (item, e){
		this.updateToggleImage();
	},

	onCollapse: function (item, e){
		this.updateToggleImage();
	},

	applyTheme: function(theme){

		// CAL: this is a hack right now
		// i'd like to have all the 'style' stuff maybe in one assoc-array
		// that we can assign to and have the node update correctly
		//
		// in general, you want all the nodes in a tree to behave the same
		// (except probably child icons since those will vary with item)
		// and the best way to do it is to apply a style to the tree
		//
		// the tree can then apply that style to each node

		this.lastNodeLeafImgSrc			= theme.iconLeaf;
		this.notLastNodeLeafImgSrc		= theme.iconLeafLast;
		this.lastNodeParentImgSrc		= theme.iconClose;
		this.notLastNodeParentImgSrc		= theme.iconCloseLast;
		this.lastNodeParentToggleImgSrc		= theme.iconOpen;
		this.notLastNodeParentToggleImgSrc	= theme.iconOpenLast;

		this.updateToggleImage();
	},

	updateToggleImage: function(){

		if (this.isParent){

			if (this.isExpanded){

				this.toggleImage.src = this.isLastNode ? this.lastNodeParentToggleImgSrc : this.notLastNodeParentToggleImgSrc;
			}else{
				this.toggleImage.src = this.isLastNode ? this.lastNodeParentImgSrc : this.notLastNodeParentImgSrc;
			}

		}else{
			this.toggleImage.src = this.isLastNode ? this.lastNodeLeafImgSrc : this.notLastNodeLeafImgSrc;
		}

	}
});

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:TreeNode");

