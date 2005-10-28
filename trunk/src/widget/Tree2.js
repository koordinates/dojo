dojo.provide("dojo.widget.Tree2");
dojo.provide("dojo.widget.HtmlTree2");
dojo.provide("dojo.widget.Tree2Node");
dojo.provide("dojo.widget.HtmlTree2Node");

dojo.require("dojo.event.*");
dojo.require("dojo.widget.HtmlWidget");


dojo.widget.HtmlTree2 = function() {
	dojo.widget.HtmlWidget.call(this);

	this.widgetType = "Tree2";
	this.isContainer = true;
	this.templateCssPath = dojo.uri.dojoUri("src/widget/templates/Tree2.css");
	this.templateString = '<div></div>';

	this.treeNode = null;
	this.selectedNode = null;
	this.maxDepth = 10; // if you have a deep tree, bump this up. but not too high, or ff makes tables width for no reason


	//
	// these icons control the grid and expando buttons for the whole tree
	//

	this.blankIconSrc = dojo.uri.dojoUri("src/widget/templates/images/treenode_blank.gif");

	this.gridIconSrcT = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_t.gif"); // for non-last child grid
	this.gridIconSrcL = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_l.gif"); // for last child grid
	this.gridIconSrcV = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_v.gif"); // vertical line
	this.gridIconSrcP = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_p.gif"); // for under parent item child icons
	this.gridIconSrcC = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_c.gif"); // for under child item child icons
	this.gridIconSrcX = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_x.gif"); // grid for sole root item
	this.gridIconSrcY = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_y.gif"); // grid for last rrot item
	this.gridIconSrcZ = dojo.uri.dojoUri("src/widget/templates/images/treenode_grid_z.gif"); // for under root parent item child icon

	this.expandIconSrcPlus  = dojo.uri.dojoUri("src/widget/templates/images/treenode_expand_plus.gif");
	this.expandIconSrcMinus = dojo.uri.dojoUri("src/widget/templates/images/treenode_expand_minus.gif");

	this.iconWidth = 18;
	this.iconHeight = 18;


	//
	// tree options
	//

	this.showGrid = true;
	this.showRootGrid = true;


	this.postCreate = function(){

		this.buildTree();
	}

	this.buildTree = function(){

		this.treeNode = document.createElement('table');
		//this.treeNode.border = '1';
		this.treeNode.cellPadding = '0';
		this.treeNode.cellSpacing = '0';

		dojo.html.disableSelection(this.treeNode);

		this.domNode.style.display = 'none';
		this.domNode.parentNode.replaceChild(this.treeNode, this.domNode);

		for(var i=0; i<this.children.length; i++){

			this.children[i].isFirstNode = (i == 0) ? true : false;
			this.children[i].isLastNode = (i == this.children.length-1) ? true : false;

			this.children[i].buildNode(this, 0);
		}


		//
		// when we don't show root toggles, we need to auto-expand root nodes
		//

		if (!this.showRootGrid){
			for(var i=0; i<this.children.length; i++){
				this.children[i].expand();
			}
		}

	}
}


dojo.widget.HtmlTree2Node = function() {
	dojo.widget.HtmlWidget.call(this);

	this.widgetType = "Tree2Node";
	this.isContainer = true;
	this.messWithMyChildren = true;

	this.childIconSrc = dojo.uri.dojoUri("src/widget/templates/images/treenode_node.gif");

	this.childIcon = null;
	this.underChildIcon = null;

	this.expandIcon = null;
	this.underExpandIcon = null;

	this.title = "";

	this.labelNode	= null; // the item label
	this.imgs	= null; // an array of icons imgs
	this.imgDivs	= null; // an array of icons divs
	this.rowNode	= null; // the tr

	this.tree = null;
	this.parentNode = null;
	this.depth = 0;

	this.isFirstNode = false;
	this.isLastNode = false;
	this.isExpanded = false;
	this.isParent = false;

	this.buildNode = function(tree, depth){

		this.tree = tree;
		this.depth = depth;

		this.rowNode = document.createElement('tr');
		this.rowNode.vAlign = 'middle';

		//
		// add the tree icons
		//

		this.imgs = [];
		this.imgDivs = [];

		for(var i=0; i<this.depth; i++){

			var cell = document.createElement('td');
			var img = document.createElement('img');
			var div = document.createElement('div');

			div.style.position = 'relative';
			div.style.left = '0';
			div.style.top = '0';
			div.style.width = this.tree.iconWidth + 'px';
			div.style.height = this.tree.iconHeight + 'px';

			img.src = this.tree.blankIconSrc;

			div.appendChild(img);
			cell.appendChild(div);
			this.rowNode.appendChild(cell);

			this.imgs.push(img);
			this.imgDivs.push(div);
		}


		//
		// add the final tree icon
		//

		var icon_pair = this.createIconPair(this.rowNode);

		this.underExpandIcon = icon_pair[0];
		this.expandIcon = icon_pair[1];

		this.imgs.push(this.underExpandIcon);

		dojo.event.connect(this.expandIcon, 'onclick', this, 'onTreeClick');


		//
		// add the child icon
		//

		var icon_pair = this.createIconPair(this.rowNode);

		this.underChildIcon = icon_pair[0];
		this.childIcon = icon_pair[1];

		this.imgs.push(this.underChildIcon);


		//
		// add the cell label
		//

		var cell = document.createElement('td');
		cell.colSpan = this.tree.maxDepth-this.depth;
		cell.style.font = '5px sans-serif';

		this.labelNode = document.createElement('span');
		this.labelNode.appendChild(document.createTextNode(this.title));
		cell.appendChild(this.labelNode);

		this.rowNode.appendChild(cell);

		dojo.html.addClass(this.labelNode, 'dojoTree2NodeLabel');

		this.tree.treeNode.appendChild(this.rowNode);

		dojo.event.connect(this.childIcon, 'onclick', this, 'onIconClick');
		dojo.event.connect(this.labelNode, 'onclick', this, 'onLabelClick');


		//
		// create the child rows
		//

		for(var i=0; i<this.children.length; i++){

			this.children[i].isFirstNode = (i == 0) ? true : false;
			this.children[i].isLastNode = (i == this.children.length-1) ? true : false;
			this.children[i].parentNode = this;
			this.children[i].buildNode(this.tree, this.depth+1);
		}

		this.isParent = (this.children.length > 0) ? true : false;

		this.collapse();
	}


	this.createIconPair = function(tr_node){

		var cell = document.createElement('td');
		var div  = document.createElement('div');
		var img1 = document.createElement('img');
		var img2 = document.createElement('img');

		cell.appendChild(div);
		div.appendChild(img1);
		div.appendChild(img2);

		div.style.position = 'relative';
		div.style.left = '0';
		div.style.top = '0';
		div.style.width = this.tree.iconWidth + 'px';
		div.style.height = this.tree.iconHeight + 'px';

		img1.style.position = 'absolute';
		img1.style.left = '0';
		img1.style.top = '0';
		img1.style.zIndex = 1;

		img2.style.position = 'absolute';
		img2.style.left = '0';
		img2.style.top = '0';
		img2.style.zIndex = 2;

		tr_node.appendChild(cell);

		this.imgDivs.push(div);

		return [img1, img2];
	}


	this.onTreeClick = function(e){

		if (this.isExpanded){
			this.collapse();
		}else{
			this.expand();
		}
	}

	this.onIconClick = function(){

		this.onLabelClick();
	}

	this.onLabelClick = function(){

		if (this.tree.selectedNode == this){

			//this.editInline();
			dojo.debug('TODO: start inline edit here!');
			return;
		}

		if (this.tree.selectedNode){ this.tree.selectedNode.deselect(); }

		this.tree.selectedNode = this;
		this.tree.selectedNode.select();
	}

	this.select = function(){

		dojo.html.addClass(this.labelNode, 'dojoTree2NodeLabelSelected');
	}

	this.deselect = function(){

		dojo.html.removeClass(this.labelNode, 'dojoTree2NodeLabelSelected');
	}

	this.updateIcons = function(){

		this.imgDivs[0].style.display = this.tree.showRootGrid ? 'block' : 'none';


		//
		// set the expand icon
		//

		if (this.isParent){
			this.expandIcon.src = this.isExpanded ? this.tree.expandIconSrcMinus : this.tree.expandIconSrcPlus;
		}else{
			this.expandIcon.src = this.tree.blankIconSrc;
		}


		//
		// set the grid under the expand icon
		//

		if (this.tree.showGrid){
			if (this.depth){

				this.underExpandIcon.src = this.isLastNode ? this.tree.gridIconSrcL : this.tree.gridIconSrcT;
			}else{
				if (this.isFirstNode){
					this.underExpandIcon.src = this.isLastNode ? this.tree.gridIconSrcX : this.tree.gridIconSrcY;
				}else{
					this.underExpandIcon.src = this.isLastNode ? this.tree.gridIconSrcL : this.tree.gridIconSrcT;
				}
			}
		}else{
			this.underExpandIcon.src = this.tree.blankIconSrc;
		}


		//
		// set the child icon
		//

		this.childIcon.src = this.childIconSrc;


		//
		// set the grid under the child icon
		//

		if ((this.depth || this.tree.showRootGrid) && this.tree.showGrid){

			this.underChildIcon.src = (this.isParent && this.isExpanded) ? this.tree.gridIconSrcP : this.tree.gridIconSrcC;
		}else{
			if (this.tree.showGrid && !this.tree.showRootGrid){

				this.underChildIcon.src = (this.isParent && this.isExpanded) ? this.tree.gridIconSrcZ : this.tree.blankIconSrc;
			}else{
				this.underChildIcon.src = this.tree.blankIconSrc;
			}
		}


		//
		// set the vertical grid icons
		//

		var parent = this.parentNode;

		for(var i=0; i<this.depth; i++){

			var idx = this.imgs.length-(3+i);

			var img = this.imgs[idx];

			img.src = (this.tree.showGrid && !parent.isLastNode) ? this.tree.gridIconSrcV : this.tree.blankIconSrc;

			parent = parent.parentNode;
		}

	}

	this.expand = function(){
		this.showChildren();
		this.isExpanded = true;
		this.updateIcons();
	}

	this.collapse = function(){
		this.hideChildren();
		this.isExpanded = false;
		this.updateIcons();
	}

	this.hideNode = function(){
		this.hideChildren();
		this.rowNode.style.display = 'none';
	}

	this.showNode = function(){
		if (this.isExpanded){ this.showChildren(); }
		this.rowNode.style.display = document.all ? 'block' : 'table-row';
	}

	this.hideChildren = function(){

		for(var i=0; i<this.children.length; i++){

			this.children[i].hideNode();
		}
	}

	this.showChildren = function(){

		for(var i=0; i<this.children.length; i++){

			this.children[i].showNode();
		}
	}}

// complete the inheritance process
dojo.inherits(dojo.widget.HtmlTree2, dojo.widget.HtmlWidget);
dojo.inherits(dojo.widget.HtmlTree2Node, dojo.widget.HtmlWidget);

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:Tree2");
dojo.widget.tags.addParseTreeHandler("dojo:Tree2Node");

