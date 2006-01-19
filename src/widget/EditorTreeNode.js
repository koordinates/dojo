dojo.provide("dojo.widget.EditorTreeNode");

dojo.require("dojo.event.*");
dojo.require("dojo.dnd.*");
dojo.require("dojo.fx.html");
dojo.require("dojo.io.*");
dojo.require("dojo.widget.Container");
dojo.require("dojo.widget.Tree");

// make it a tag
dojo.widget.tags.addParseTreeHandler("dojo:EditorTreeNode");


dojo.widget.EditorTreeNode = function() {
	dojo.widget.HtmlWidget.call(this);
}

dojo.inherits(dojo.widget.EditorTreeNode, dojo.widget.HtmlWidget);

dojo.lang.extend(dojo.widget.EditorTreeNode, {
	widgetType: "EditorTreeNode",

	loadStates: {
		UNCHECKED: 1,
    		LOADING: 2,
    		LOADED: 3
	},


	isContainer: true,

	domNode: null,
	containerNode: null,

	templateString: '<div class="dojoTreeNode"><div style="display:none" dojoAttachPoint="containerNode"></div></div>',

	//childIconSrc: null,
	childIconSrc: null,
	childIconFolderSrc: dojo.uri.dojoUri("src/widget/templates/images/EditorTree/closed.gif").toString(), // for under root parent item child icon,
	childIconDocumentSrc: dojo.uri.dojoUri("src/widget/templates/images/EditorTree/document.gif").toString(), // for under root parent item child icon,

	childIcon: null,
	isTreeNode: true,

	afterLabelNode: null, // node to the left of labelNode

	// an icon left from childIcon: imgs[-2].
	// if +/- for folders, blank for leaves
	expandIcon: null,

	title: "",
	isFolder: false,

	labelNode: null, // the item label
	titleNode: null, // the item title
	imgs: null, // an array of icons imgs
	rowNode: null, // the tr

	tree: null,

	depth: 0,

	isFirstNode: false,
	isLastNode: false,
	isExpanded: false,

	state: null,  // after creation will change to loadStates: "loaded/loading/unchecked"
	domNodeInitialized: false,  // domnode is initialized with icons etc

	initialize: function(args, frag){
		this.state = this.loadStates.UNCHECKED;

		if (args['isFolder'] == "true" || args['isfolder'] == "true" ) { // IE || FF
			this.isFolder = true;
		}

		//this.domNode.treeNode = this; // domNode knows about its treeNode owner. E.g for DnD
	},

	/**
	 * Change visible node depth by appending/prepending with blankImgs
	 * @param depthDiff Integer positive => move right, negative => move left
	*/
	adjustDepth: function(depthDiff) {

		for(var i=0; i<this.children.length; i++) {
			this.children[i].adjustDepth(depthDiff);
		}

		this.depth += depthDiff;

		if (depthDiff>0) {
			for(var i=0; i<depthDiff; i++) {
				var img = this.tree.makeBlankImg();
				this.imgs.unshift(img);
				//dojo.debugShallow(this.domNode);
				this.domNode.insertBefore(this.imgs[0], this.domNode.firstChild);

			}
		}
		if (depthDiff<0) {
			for(var i=0; i<-depthDiff;i++) {
				this.imgs.shift();
				this.domNode.removeChild(this.domNode.firstChild);
			}
		}

	},


	markLoading: function() {
		this.expandIcon.src = this.tree.expandIconSrcLoading;


	},


	setFolder: function() {
		dojo.event.connect(this.expandIcon, 'onclick', this, 'onTreeClick');
		this.isFolder = true;
	},


	buildNode: function(tree, depth){

		this.tree = tree;
		this.depth = depth;


		//
		// add the tree icons
		//

		this.imgs = [];

		for(var i=0; i<this.depth+1; i++){

			var img = this.tree.makeBlankImg();

			this.domNode.insertBefore(img, this.containerNode);

			this.imgs.push(img);
		}


		this.expandIcon = this.imgs[this.imgs.length-1];


		//
		// add the cell label
		//


		this.labelNode = document.createElement('span');
		this.labelNode.treeNode = this.widgetId; // link label node w/ real treeNode object(w/ self)
		dojo.html.addClass(this.labelNode, 'dojoTreeNodeLabel');

		// add child icon to label
		this.childIcon = this.tree.makeBlankImg();
		//this.childIcon.treeNode = this.widgetId;

		// add to images before the title
		this.imgs.push(this.childIcon);

		this.labelNode.appendChild(this.childIcon);

		// add title to label
		this.titleNode = document.createElement('span');
		//this.titleNode.treeNode = this.widgetId;

		var textNode = document.createTextNode(this.title);
		this.titleNode.appendChild(textNode);
		dojo.html.addClass(this.titleNode, 'dojoTreeNodeLabelTitle');


		this.labelNode.appendChild(this.titleNode);

		this.domNode.insertBefore(this.labelNode, this.containerNode);

		this.afterLabelNode = document.createElement('span');
		this.domNode.insertBefore(this.afterLabelNode, this.containerNode);


		// node with children(from source html) becomes folder on build stage.
		if (this.children.length || this.isFolder) {
			this.setFolder();
		}

		dojo.event.connect(this.childIcon, 'onclick', this, 'onIconClick');
		dojo.event.connect(this.titleNode, 'onclick', this, 'onTitleClick');


		//
		// create the child rows
		//


		for(var i=0; i<this.children.length; i++){

			this.children[i].isFirstNode = (i == 0) ? true : false;
			this.children[i].isLastNode = (i == this.children.length-1) ? true : false;
			this.children[i].parent = this;

			var node = this.children[i].buildNode(this.tree, this.depth+1);

			this.containerNode.appendChild(node);
		}


		if (this.children.length) {
			this.state = this.loadStates.LOADED;
		}

		if (this.isExpanded) {
			this.expand();
		}
		else {
			this.updateIcons();
		}

		this.domNodeInitialized = true;

		dojo.event.topic.publish(this.tree.eventNames.nodeCreate, { source: this } );

		return this.domNode;
	},

	onTreeClick: function(e){
		dojo.event.topic.publish(this.tree.eventNames.treeClick, { source: this, event: e });
	},

	onIconClick: function(e){
		dojo.event.topic.publish(this.tree.eventNames.iconClick, { source: this, event: e });
	},

	onTitleClick: function(e){
		dojo.event.topic.publish(this.tree.eventNames.titleClick, { source: this, event: e });
	},

	markSelected: function() {
		dojo.html.addClass(this.titleNode, 'dojoTreeNodeLabelSelected');
	},


	unMarkSelected: function() {
		//dojo.debug('unmark')
		dojo.html.removeClass(this.titleNode, 'dojoTreeNodeLabelSelected');
	},

	updateIcons: function(){

		//dojo.debug("Update icons for "+this.title)
		//dojo.debug(this.isFolder)

		this.imgs[0].style.display = this.tree.showRootGrid ? 'inline' : 'none';


		//
		// set the expand icon
		//

		if (this.isFolder){
			this.expandIcon.src = this.isExpanded ? this.tree.expandIconSrcMinus : this.tree.expandIconSrcPlus;
		}else{
			this.expandIcon.src = this.tree.blankIconSrc;
		}

		//
		// set the child icon
		//
		this.buildChildIcon();


		//
		// set the grid under the expand icon
		//

		if (this.tree.showGrid){
			if (this.depth){
				this.setGridImage(-2, this.isLastNode ? this.tree.gridIconSrcL : this.tree.gridIconSrcT);
			}else{
				if (this.isFirstNode){
					this.setGridImage(-2, this.isLastNode ? this.tree.gridIconSrcX : this.tree.gridIconSrcY);
				}else{
					this.setGridImage(-2, this.isLastNode ? this.tree.gridIconSrcL : this.tree.gridIconSrcT);
				}
			}
		}else{
			this.setGridImage(-2, this.tree.blankIconSrc);
		}



		//
		// set the grid under the child icon
		//

		if ((this.depth || this.tree.showRootGrid) && this.tree.showGrid){
			this.setGridImage(-1, (this.children.length && this.isExpanded) ? this.tree.gridIconSrcP : this.tree.gridIconSrcC);
		}else{
			if (this.tree.showGrid && !this.tree.showRootGrid){
				this.setGridImage(-1, (this.children.length && this.isExpanded) ? this.tree.gridIconSrcZ : this.tree.blankIconSrc);
			}else{
				this.setGridImage(-1, this.tree.blankIconSrc);
			}
		}


		//
		// set the vertical grid icons
		//

		var parent = this.parent;

		for(var i=0; i<this.depth; i++){

			var idx = this.imgs.length-(3+i);

			this.setGridImage(
				idx,
				(this.tree.showGrid && !parent.isLastNode) ? this.tree.gridIconSrcV : this.tree.blankIconSrc
			);

			parent = parent.parent;
		}
	},

	buildChildIcon: function() {
		/* no child icon */
		if (this.childIconSrc == "none") {
			this.childIcon.style.display = 'none';
			return;
		}

		/* assign default icon if not set */
		if (!this.childIconSrc) {
			if (this.isFolder){
				this.childIconSrc = this.childIconFolderSrc;
			}
			else {
				this.childIconSrc = this.childIconDocumentSrc;
			}
		}

		this.childIcon.style.display = 'inline';
		this.childIcon.src = this.childIconSrc;
	},

	setGridImage: function(idx, src){

		if (idx < 0){
			idx = this.imgs.length + idx;
		}

		//if (idx >= this.imgs.length-2) return;
		this.imgs[idx].style.backgroundImage = 'url(' + src + ')';
	},


	updateIconTree: function(){
		this.tree.updateIconTree.call(this);
	},



	expand: function(){

		if (this.children.length) {
			this.showChildren();
		}

		this.isExpanded = true;

		this.updateIcons();
	},

	collapse: function(){
		this.hideChildren();
		this.isExpanded = false;
		this.updateIcons();
	},

	hideChildren: function(){
		this.tree.toggler.hide(this.containerNode);
	},

	showChildren: function(){
		this.tree.toggler.show(this.containerNode);
	},


	addChild: function(){
		return this.tree.addChild.apply(this, arguments);
	},

	removeChild: function(){
		return this.tree.removeChild.apply(this, arguments);
	},


	/* Edit current node : change properties and update contents */
	edit: function(props) {
		dojo.lang.mixin(this, props);
		if (props.title) {
			var textNode = document.createTextNode(this.title);
			this.titleNode.replaceChild(textNode, this.titleNode.firstChild)
		}

		if (props.childIconSrc) {
			this.childIcon.src = this.childIconSrc;
		}
	},

	toString: function() {
		return "["+this.widgetType+" Tree:"+this.tree+" ID:"+this.widgetId+"]";
	}

});




