dojo.provide("dojo.widget.TreeNode");
dojo.provide("dojo.widget.HtmlTreeNode");

dojo.require("dojo.event.*");
dojo.require("dojo.fx.html");
dojo.require("dojo.widget.Tree");
dojo.require("dojo.widget.HtmlWidget");


// define the widget class
dojo.widget.HtmlTreeNode = function() {
	dojo.widget.HtmlWidget.call(this);

	this.widgetType = "TreeNode";
	this.templatePath = dojo.uri.dojoUri("src/widget/templates/TreeNode.html");
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/TreeNode.css");
	this.isContainer = true;

	// the last node and with no children
	this.lastNodeLeafImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/leaf-l.gif";
	// not the last node and with no children
	this.notLastNodeLeafImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/leaf-t.gif";
	// the last node and with children
	this.lastNodeParentImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/plus-l.gif";
	// not the last node and with children
	this.notLastNodeParentImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/plus-t.gif";

	this.lastNodeParentToggleImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/minus-l.gif";
	this.notLastNodeParentToggleImgSrc = djConfig.baseRelativePath + "src/widget/templates/images/minus-t.gif";

	this.childIcon = null;
	this.childIconSrc = '';

	this.id = null;
	this.title = "";
	// the DOM node that holds the title and open / close controls
	this.nodeTitle = null;
	// the DOM text node with the title in it
	this.titleText = null;
	// the node which controls opening and closing the children (only exists when children are added)
	this.toggleControl = null;
	// the node which holds the toggle image.
	this.toggleImage = null;
	// the toggle strategy object which will toggle a parent node open and closed
	this.toggle = new dojo.widget.Tree.DefaultToggle();
	// the outer tree containing this node
	this.tree = null;
	// flag to hold whether this is the last node in the branch.
	this.isLastNode = true;
	this.isExpanded = false;
	this.isParent = false;

	this.initialize = function(args, frag){
		if (!this.id) {
			this.id = this.title;
		}

		this.toggleImage.src = this.lastNodeLeafImgSrc;
		this.toggleImage.alt = "";

		if (this.childIconSrc){
			this.childIcon.src = this.childIconSrc;
			this.childIcon.alt = "";
		}else{
			this.childIcon.style.display = 'none';
		}
	}

	var oldAddChild = this.addChild;

	this.addChild = function(widget, overrideContainerNode, pos, ref, insertIndex) {

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

		return oldAddChild.call(this, widget, overrideContainerNode, pos, ref, insertIndex);
	}

	this.removeChild = function(widget){

		var ret = dojo.widget.HtmlWidget.removeChild.call(this);

		this.isParent = (this.children && (this.children.length > 0)) ? true : false;

		return ret;
	}



	this.fillInTemplate = function (){
		this.titleText.appendChild(document.createTextNode(this.title));
//		dojo.event.connect(this.nodeTitle, "onmouseover", this, "onMouseOver");
//		dojo.event.connect(this.nodeTitle, "onmouseout", this, "onMouseOut");
//		dojo.event.connect(this.nodeTitle, "onmousedown", this, "onMouseDown");
//		dojo.event.connect(this.nodeTitle, "onmouseup", this, "onMouseUp");
		dojo.event.connect(this.titleText, "onclick", this, "onClick");
		dojo.event.connect(this.childIcon, "onclick", this, "onClick");
	}

	this.setNotLastNode = function (){
		this.isLastNode = false;
		this.updateToggleImage();
	}

	this.toggleOpened = function(e){
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
	}

	this.getToggle = function (){
		if (this.parent && this.parent.getToggle) {
			return this.parent.getToggle();
		}
		return this.toggle;
	}

	this.onMouseOver = function (e){
	}

	this.onMouseOut = function (e){
	}

	this.onClick = function (e){
		this.onSelect(this, e);
	}

	this.onMouseDown = function (e){
	}

	this.onMouseUp = function (e){
	}

	this.onSelect = function (item, e){
		dojo.html.addClass(this.titleText, "TreeNodeSelected");
		dojo.html.addClass(this.childIcon, "TreeNodeSelected");
	}

	this.onTreeNodeSelected = function (item, e){
		if (this.id != item.id) {
			dojo.html.removeClass(this.titleText, "TreeNodeSelected");
			dojo.html.removeClass(this.childIcon, "TreeNodeSelected");
		}
	}

	this.onExpand = function (item, e){
		this.updateToggleImage();
	}

	this.onCollapse = function (item, e){
		this.updateToggleImage();
	}

	this.applyTheme = function(theme){

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
	}

	this.updateToggleImage = function(){

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
}

// complete the inheritance process
dojo.inherits(dojo.widget.HtmlTreeNode, dojo.widget.HtmlWidget);

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:TreeNode");

