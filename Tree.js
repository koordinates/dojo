dojo.provide("dijit.Tree");

dojo.require("dojo.fx");
dojo.require("dojo.DeferredList");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");
dojo.require("dijit._Contained");
dojo.require("dojo.cookie");

dojo.declare(
	"dijit._TreeNode",
	[dijit._Widget, dijit._Templated, dijit._Container, dijit._Contained],
{
	// summary:
	//		Single node within a tree.   This class is used internally
	//		by Tree and should not be accessed directly.
	// tags:
	//		private

	// item: dojo.data.Item
	//		the dojo.data entry this tree represents
	item: null,	

	// isTreeNode: [protected] Boolean
	//		Indicates that this is a TreeNode.   Used by `dijit.Tree` only,
	//		should not be accessed directly.
	isTreeNode: true,

	// label: String
	//		Text of this tree node
	label: "",

	// isExpandable: [private] Boolean
	//		This node has children, so show the expando node (+ sign)
	isExpandable: null,

	// isExpanded: [readonly] Boolean
	//		This node is currently expanded (ie, opened)
	isExpanded: false,

	// state: [private] String
	//		Dynamic loading-related stuff.
	//		When an empty folder node appears, it is "UNCHECKED" first,
	//		then after dojo.data query it becomes "LOADING" and, finally "LOADED"	
	state: "UNCHECKED",
	
	templateString: dojo.cache("dijit", "templates/TreeNode.html"),

	attributeMap: dojo.delegate(dijit._Widget.prototype.attributeMap, {
		label: {node: "labelNode", type: "innerHTML"},
		tooltip: {node: "rowNode", type: "attribute", attribute: "title"}
	}),

	postCreate: function(){
		// set expand icon for leaf
		this._setExpando();

		// set icon and label class based on item
		this._updateItemClasses(this.item);

		if(this.isExpandable){
			dijit.setWaiState(this.labelNode, "expanded", this.isExpanded);
		}
	},

	_setIndentAttr: function(indent){
		// summary:
		//		Tell this node how many levels it should be indented
		// description:
		//		0 for top level nodes, 1 for their children, 2 for their
		//		grandchildren, etc.
		this.indent = indent;

		// Math.max() is to prevent negative padding on hidden root node (when indent == -1)
		var pixels = (Math.max(indent, 0) * this.tree._nodePixelIndent) + "px";	

		dojo.style(this.domNode, "backgroundPosition",  pixels + " 0px");
		dojo.style(this.rowNode, dojo._isBodyLtr() ? "paddingLeft" : "paddingRight", pixels);
 
		dojo.forEach(this.getChildren(), function(child){
        	child.attr("indent", indent+1);
        });
	},

	markProcessing: function(){
		// summary:
		//		Visually denote that tree is loading data, etc.
		// tags:
		//		private
		this.state = "LOADING";
		this._setExpando(true);	
	},

	unmarkProcessing: function(){
		// summary:
		//		Clear markup from markProcessing() call
		// tags:
		//		private
		this._setExpando(false);	
	},

	_updateItemClasses: function(item){
		// summary:
		//		Set appropriate CSS classes for icon and label dom node
		//		(used to allow for item updates to change respective CSS)
		// tags:
		//		private
		var tree = this.tree, model = tree.model;
		if(tree._v10Compat && item === model.root){
			// For back-compat with 1.0, need to use null to specify root item (TODO: remove in 2.0)
			item = null;
		}
		this._applyClassAndStyle(item, "icon", "Icon");
		this._applyClassAndStyle(item, "label", "Label");
		this._applyClassAndStyle(item, "row", "Row");
	},
	
	_applyClassAndStyle: function(item, lower, upper) {
		// summary:
		//		Set the appropriate CSS classes and styles for labels, icons and rows.
		//
		// item:
		//		The data item.
		//
		// lower:
		//		The lower case attribute to use, e.g. 'icon', 'label' or 'row'.
		//
		// upper:
		//		The upper case attribute to use, e.g. 'Icon', 'Label' or 'Row'.
		//
		// tags:
		//		private
 
		var clsName = "_" + lower + "Class";
		var nodeName = lower + "Node";
 
		if(this[clsName]){
			dojo.removeClass(this[nodeName], this[clsName]);
 		}
		this[clsName] = this.tree["get" + upper + "Class"](item, this.isExpanded);
		if(this[clsName]){
			dojo.addClass(this[nodeName], this[clsName]);
 		}
		dojo.style(this[nodeName], this.tree["get" + upper + "Style"](item, this.isExpanded) || {});
 	},

	_updateLayout: function(){
		// summary:
		//		Set appropriate CSS classes for this.domNode
		// tags:
		//		private
		var parent = this.getParent();
		if(!parent || parent.rowNode.style.display == "none"){
			/* if we are hiding the root node then make every first level child look like a root node */
			dojo.addClass(this.domNode, "dijitTreeIsRoot");
		}else{
			dojo.toggleClass(this.domNode, "dijitTreeIsLast", !this.getNextSibling());
		}
	},

	_setExpando: function(/*Boolean*/ processing){
		// summary:
		//		Set the right image for the expando node
		// tags:
		//		private

		var styles = ["dijitTreeExpandoLoading", "dijitTreeExpandoOpened",
						"dijitTreeExpandoClosed", "dijitTreeExpandoLeaf"],
			_a11yStates = ["*","-","+","*"],
			idx = processing ? 0 : (this.isExpandable ?	(this.isExpanded ? 1 : 2) : 3);

		// apply the appropriate class to the expando node
		dojo.removeClass(this.expandoNode, styles);
		dojo.addClass(this.expandoNode, styles[idx]);

		// provide a non-image based indicator for images-off mode
		this.expandoNodeText.innerHTML = _a11yStates[idx];

	},	

	expand: function(){
		// summary:
		//		Show my children
		// returns:
		//		Deferred that fires when expansion is complete

		// If there's already an expand in progress or we are already expanded, just return
		if(this._expandDeferred){
			return this._expandDeferred;		// dojo.Deferred
		}

		// cancel in progress collapse operation
		this._wipeOut && this._wipeOut.stop();

		// All the state information for when a node is expanded, maybe this should be
		// set when the animation completes instead
		this.isExpanded = true;
		dijit.setWaiState(this.labelNode, "expanded", "true");
		dijit.setWaiRole(this.containerNode, "group");
		dojo.addClass(this.contentNode,'dijitTreeContentExpanded');
		this._setExpando();
		this._updateItemClasses(this.item);
		if(this == this.tree.rootNode){
			dijit.setWaiState(this.tree.domNode, "expanded", "true");
		}

		var def,
			wipeIn = dojo.fx.wipeIn({
				node: this.containerNode, duration: dijit.defaultDuration,
				onEnd: function(){
					def.callback(true);
				}
			});

		// Deferred that fires when expand is complete
		def = (this._expandDeferred = new dojo.Deferred(function(){
			// Canceller
			wipeIn.stop();
		}));

		wipeIn.play();
		
		return def;		// dojo.Deferred
	},

	collapse: function(){
		// summary:
		//		Collapse this node (if it's expanded)

		if(!this.isExpanded){ return; }

		// cancel in progress expand operation
		if(this._expandDeferred){
			this._expandDeferred.cancel();
			delete this._expandDeferred;
		}

		this.isExpanded = false;
		dijit.setWaiState(this.labelNode, "expanded", "false");
		if(this == this.tree.rootNode){
			dijit.setWaiState(this.tree.domNode, "expanded", "false");
		}
		dojo.removeClass(this.contentNode,'dijitTreeContentExpanded');
		this._setExpando();
		this._updateItemClasses(this.item);

		if(!this._wipeOut){
			this._wipeOut = dojo.fx.wipeOut({
				node: this.containerNode, duration: dijit.defaultDuration
			});
		}
		this._wipeOut.play();
	},

	// indent: Integer
	//		Levels from this node to the root node
	indent: 0,

	setChildItems: function(/* Object[] */ items){
		// summary:
		//		Sets the child items of this node, removing/adding nodes
		//		from current children to match specified items[] array.
		//		Also, if this.persist == true, expands any children that were previously
		// 		opened.
		// returns:
		//		Deferred object that fires after all previously opened children
		//		have been expanded again (or fires instantly if there are no such children).

		var tree = this.tree,
			model = tree.model,
			defs = [];	// list of deferreds that need to fire before I am complete
			

		// Orphan all my existing children.
		// If items contains some of the same items as before then we will reattach them.
		// Don't call this.removeChild() because that will collapse the tree etc.
		this.getChildren().forEach(function(child){
			dijit._Container.prototype.removeChild.call(this, child);
		}, this);

		this.state = "LOADED";

		if(items && items.length > 0){
			this.isExpandable = true;

			// Create _TreeNode widget for each specified tree node, unless one already
			// exists and isn't being used (presumably it's from a DnD move and was recently
			// released
			dojo.forEach(items, function(item){
				var id = model.getIdentity(item),
					existingNodes = tree._itemNodesMap[id],
					node;
				if(existingNodes){
					for(var i=0;i<existingNodes.length;i++){
						if(existingNodes[i] && !existingNodes[i].getParent()){
							node = existingNodes[i];
							node.attr('indent', this.indent+1);
							break;
						}
					}
				}
				if(!node){
					node = this.tree._createTreeNode({
							item: item,
							tree: tree,
							isExpandable: model.mayHaveChildren(item),
							label: tree.getLabel(item),
							tooltip: tree.getTooltip(item),
							indent: this.indent + 1
						});
					if(existingNodes){
						existingNodes.push(node);
					}else{
						tree._itemNodesMap[id] = [node];
					}
				}
				this.addChild(node);
				
				// If node was previously opened then open it again now (this may trigger
				// more data store accesses, recursively)
				if(this.tree.autoExpand || this.tree._state(item)){
					defs.push(tree._expandNode(node));
				}
			}, this);

			// note that updateLayout() needs to be called on each child after
			// _all_ the children exist
			dojo.forEach(this.getChildren(), function(child, idx){
				child._updateLayout();
			});
		}else{
			this.isExpandable=false;
		}

		if(this._setExpando){
			// change expando to/from dot or + icon, as appropriate
			this._setExpando(false);
		}

		// On initial tree show, make the selected TreeNode as either the root node of the tree,
		// or the first child, if the root node is hidden
		if(this == tree.rootNode){
			var fc = this.tree.showRoot ? this : this.getChildren()[0];
			if(fc){
				fc.setSelected(true);
				tree.lastFocused = fc;
			}else{
				// fallback: no nodes in tree so focus on Tree <div> itself
				tree.domNode.setAttribute("tabIndex", "0");
			}
		}

		return new dojo.DeferredList(defs);	// dojo.Deferred
	},

	removeChild: function(/* treeNode */ node){
		this.inherited(arguments);

		var children = this.getChildren();		
		if(children.length == 0){
			this.isExpandable = false;
			this.collapse();
		}

		dojo.forEach(children, function(child){
				child._updateLayout();
		});
	},

	makeExpandable: function(){
		//summary:
		//		if this node wasn't already showing the expando node,
		//		turn it into one and call _setExpando()

		// TODO: hmm this isn't called from anywhere, maybe should remove it for 2.0

		this.isExpandable = true;
		this._setExpando(false);
	},

	_onLabelFocus: function(evt){
		// summary:
		//		Called when this node is focused (possibly programatically)
		// tags:
		//		private
		dojo.addClass(this.labelNode, "dijitTreeLabelFocused");
		this.tree._onNodeFocus(this);
	},

	_onLabelBlur: function(evt){
		// summary:
		//		Called when focus was moved away from this node, either to
		//		another TreeNode or away from the Tree entirely.
		//		Note that we aren't using _onFocus/_onBlur builtin to dijit
		//		because _onBlur() isn't called when focus is moved to my child TreeNode.
		// tags:
		//		private
		dojo.removeClass(this.labelNode, "dijitTreeLabelFocused");
	},

	setSelected: function(/*Boolean*/ selected){
		// summary:
		//		A Tree has a (single) currently selected node.
		//		Mark that this node is/isn't that currently selected node.
		// description:
		//		In particular, setting a node as selected involves setting tabIndex 
		//		so that when user tabs to the tree, focus will go to that node (only).
		var labelNode = this.labelNode;
		labelNode.setAttribute("tabIndex", selected ? "0" : "-1");
		dijit.setWaiState(labelNode, "selected", selected);
		dojo.toggleClass(this.rowNode, "dijitTreeNodeSelected", selected);
	},

	_onClick: function(evt){
		// summary:
		//		Handler for onclick event on a node
		// tags:
		//		private
		this.tree._onClick(this, evt);
	},
	_onDblClick: function(evt){
		// summary:
		//		Handler for ondblclick event on a node
		// tags:
		//		private
		this.tree._onDblClick(this, evt);
	},

	_onMouseEnter: function(evt){
		// summary:
		//		Handler for onmouseenter event on a node
		// tags:
		//		private
		dojo.addClass(this.rowNode, "dijitTreeNodeHover");
		this.tree._onNodeMouseEnter(this, evt);
	},

	_onMouseLeave: function(evt){
		// summary:
		//		Handler for onmouseenter event on a node
		// tags:
		//		private
		dojo.removeClass(this.rowNode, "dijitTreeNodeHover");
		this.tree._onNodeMouseLeave(this, evt);
	}
});

dojo.declare(
	"dijit.Tree",
	[dijit._Widget, dijit._Templated],
{
	// summary:
	//		This widget displays hierarchical data from a store.

	// store: [deprecated] String||dojo.data.Store
	//		Deprecated.  Use "model" parameter instead.
	//		The store to get data to display in the tree.
	store: null,

	// model: dijit.Tree.model
	//		Interface to read tree data, get notifications of changes to tree data,
	//		and for handling drop operations (i.e drag and drop onto the tree)
	model: null,

	// query: [deprecated] anything
	//		Deprecated.  User should specify query to the model directly instead.
	//		Specifies datastore query to return the root item or top items for the tree.
	query: null,

	// label: [deprecated] String
	//		Deprecated.  Use dijit.tree.ForestStoreModel directly instead.
	//		Used in conjunction with query parameter.
	//		If a query is specified (rather than a root node id), and a label is also specified,
	//		then a fake root node is created and displayed, with this label.
	label: "",

	// showRoot: [const] Boolean
	//		Should the root node be displayed, or hidden?
	showRoot: true,

	// childrenAttr: [deprecated] String[]
	//		Deprecated.   This information should be specified in the model.
	//		One ore more attributes that holds children of a tree node
	childrenAttr: ["children"],

	// path: String[] or Item[]
	//		Full path from rootNode to selected node expressed as array of items or array of ids.
	path: [],

	// selectedItem: [readonly] Item
	//		The currently selected item in this tree.
	//		This property can only be set (via attr('selectedItem', ...)) when that item is already
	//		visible in the tree.   (I.e. the tree has already been expanded to show that node.)
	//		Should generally use `path` attribute to set the selected item instead.
	selectedItem: null,

	// openOnClick: Boolean
	//		If true, clicking a folder node's label will open it, rather than calling onClick()
	openOnClick: false,
	
	// openOnDblClick: Boolean
	//		If true, double-clicking a folder node's label will open it, rather than calling onDblClick()
	openOnDblClick: false,

	templateString: dojo.cache("dijit", "templates/Tree.html"),

	// persist: Boolean
	//		Enables/disables use of cookies for state saving.
	persist: true,
	
	// autoExpand: Boolean
	//		Fully expand the tree on load.   Overrides `persist`
	autoExpand: false,
	
	// dndController: [protected] String
	//		Class name to use as as the dnd controller.  Specifying this class enables DnD.
	//		Generally you should specify this as "dijit.tree.dndSource".
	dndController: null,

	// parameters to pull off of the tree and pass on to the dndController as its params
	dndParams: ["onDndDrop","itemCreator","onDndCancel","checkAcceptance", "checkItemAcceptance", "dragThreshold", "betweenThreshold"],

	//declare the above items so they can be pulled from the tree's markup

	// onDndDrop: [protected] Function
	//		Parameter to dndController, see `dijit.tree.dndSource.onDndDrop`.
	//		Generally this doesn't need to be set.
	onDndDrop: null,

	/*=====
	itemCreator: function(nodes, target, source){
		// summary:
		//		Returns objects passed to `Tree.model.newItem()` based on DnD nodes
		//		dropped onto the tree.   Developer must override this method to enable
		// 		dropping from external sources onto this Tree, unless the Tree.model's items
		//		happen to look like {id: 123, name: "Apple" } with no other attributes.
		// description:
		//		For each node in nodes[], which came from source, create a hash of name/value
		//		pairs to be passed to Tree.model.newItem().  Returns array of those hashes.
		// nodes: DomNode[]
		//		The DOMNodes dragged from the source container
		// target: DomNode
		//		The target TreeNode.rowNode
		// source: dojo.dnd.Source
		//		The source container the nodes were dragged from, perhaps another Tree or a plain dojo.dnd.Source
		// returns: Object[]
		//		Array of name/value hashes for each new item to be added to the Tree, like:
		// |	[
		// |		{ id: 123, label: "apple", foo: "bar" },
		// |		{ id: 456, label: "pear", zaz: "bam" }
		// |	]
		// tags:
		//		extension
		return [{}];
	},
	=====*/
	itemCreator: null,

	// onDndCancel: [protected] Function
	//		Parameter to dndController, see `dijit.tree.dndSource.onDndCancel`.
	//		Generally this doesn't need to be set.
	onDndCancel: null,

/*=====
	checkAcceptance: function(source, nodes){
		// summary:
		//		Checks if the Tree itself can accept nodes from this source
		// source: dijit.tree._dndSource
		//		The source which provides items
		// nodes: DOMNode[]
		//		Array of DOM nodes corresponding to nodes being dropped, dijitTreeRow nodes if
		//		source is a dijit.Tree.
		// tags:
		//		extension
		return true;	// Boolean
	},
=====*/
	checkAcceptance: null,

/*=====
	checkItemAcceptance: function(target, source, position){
		// summary:
		//		Stub function to be overridden if one wants to check for the ability to drop at the node/item level
		// description:
		//		In the base case, this is called to check if target can become a child of source.
		//		When betweenThreshold is set, position="before" or "after" means that we
		//		are asking if the source node can be dropped before/after the target node.
		// target: DOMNode
		//		The dijitTreeRoot DOM node inside of the TreeNode that we are dropping on to
		//		Use dijit.getEnclosingWidget(target) to get the TreeNode.
		// source: dijit.tree.dndSource
		//		The (set of) nodes we are dropping
		// position: String
		//		"over", "before", or "after"
		// tags:
		//		extension
		return true;	// Boolean
	},
=====*/
	checkItemAcceptance: null,
	
	// dragThreshold: Integer
	//		Number of pixels mouse moves before it's considered the start of a drag operation
	dragThreshold: 5,
	
	// betweenThreshold: Integer
	//		Set to a positive value to allow drag and drop "between" nodes.
	//
	//		If during DnD mouse is over a (target) node but less than betweenThreshold
	//		pixels from the bottom edge, dropping the the dragged node will make it
	//		the next sibling of the target node, rather than the child.
	//
	//		Similarly, if mouse is over a target node but less that betweenThreshold
	//		pixels from the top edge, dropping the dragged node will make it
	//		the target node's previous sibling rather than the target node's child.
	betweenThreshold: 0,

	// _nodePixelIndent: Integer
	//		Number of pixels to indent tree nodes (relative to parent node).
	//		Default is 19 but can be overridden by setting CSS class dijitTreeIndent
	//		and calling resize() or startup() on tree after it's in the DOM.
	_nodePixelIndent: 19,

	_publish: function(/*String*/ topicName, /*Object*/ message){
		// summary:
		//		Publish a message for this widget/topic
		dojo.publish(this.id, [dojo.mixin({tree: this, event: topicName}, message||{})]);
	},

	postMixInProperties: function(){
		this.tree = this;

		this._itemNodesMap={};

		if(!this.cookieName){
			this.cookieName = this.id + "SaveStateCookie";
		}

		this._loadDeferred = new dojo.Deferred();

		this.inherited(arguments);
	},

	postCreate: function(){
		this._initState();
		
		// Create glue between store and Tree, if not specified directly by user
		if(!this.model){
			this._store2model();
		}

		// monitor changes to items
		this.connect(this.model, "onChange", "_onItemChange");
		this.connect(this.model, "onChildrenChange", "_onItemChildrenChange");
		this.connect(this.model, "onDelete", "_onItemDelete");

		this._load();

		this.inherited(arguments);

		if(this.dndController){
			if(dojo.isString(this.dndController)){
				this.dndController = dojo.getObject(this.dndController);
			}	
			var params={};
			for (var i=0; i<this.dndParams.length;i++){
				if(this[this.dndParams[i]]){
					params[this.dndParams[i]] = this[this.dndParams[i]];
				}
			}
			this.dndController = new this.dndController(this, params);
		}
	},

	_store2model: function(){
		// summary:
		//		User specified a store&query rather than model, so create model from store/query
		this._v10Compat = true;
		dojo.deprecated("Tree: from version 2.0, should specify a model object rather than a store/query");

		var modelParams = {
			id: this.id + "_ForestStoreModel",
			store: this.store,
			query: this.query,
			childrenAttrs: this.childrenAttr
		};

		// Only override the model's mayHaveChildren() method if the user has specified an override
		if(this.params.mayHaveChildren){
			modelParams.mayHaveChildren = dojo.hitch(this, "mayHaveChildren");
		}
					
		if(this.params.getItemChildren){
			modelParams.getChildren = dojo.hitch(this, function(item, onComplete, onError){
				this.getItemChildren((this._v10Compat && item === this.model.root) ? null : item, onComplete, onError);
			});
		}
		this.model = new dijit.tree.ForestStoreModel(modelParams);
		
		// For backwards compatibility, the visibility of the root node is controlled by
		// whether or not the user has specified a label
		this.showRoot = Boolean(this.label);
	},

	onLoad: function(){
		// summary:
		//		Called when tree finishes loading and expanding.
		// description:
		//		If persist == true the loading may encompass many levels of fetches
		//		from the data store, each asynchronous.   Waits for all to finish.
		// tags:
		//		callback
	},

	_load: function(){
		// summary:
		//		Initial load of the tree.
		//		Load root node (possibly hidden) and it's children.
		this.model.getRoot(
			dojo.hitch(this, function(item){
				var rn = (this.rootNode = this.tree._createTreeNode({
					item: item,
					tree: this,
					isExpandable: true,
					label: this.label || this.getLabel(item),
					indent: this.showRoot ? 0 : -1
				}));
				if(!this.showRoot){
					rn.rowNode.style.display="none";
				}
				this.domNode.appendChild(rn.domNode);
				var identity = this.model.getIdentity(item);
				if(this._itemNodesMap[identity]){
					this._itemNodesMap[identity].push(rn);
				}else{
					this._itemNodesMap[identity] = [rn];
				}

				rn._updateLayout();		// sets "dijitTreeIsRoot" CSS classname

				// load top level children and then fire onLoad() event
				this._expandNode(rn).addCallback(dojo.hitch(this, function(){
					this._loadDeferred.callback(true);
					this.onLoad();
				}));
			}),
			function(err){
				console.error(this, ": error loading root: ", err);
			}
		);
	},

	getNodesByItem: function(/*dojo.data.Item or id*/ item){
		// summary:
		//		Returns all tree nodes that refer to an item
		// returns:
		//		Array of tree nodes that refer to passed item

		if(!item){ return []; }
		var identity = dojo.isString(item) ? item : this.model.getIdentity(item);
		// return a copy so widget don't get messed up by changes to returned array
		return [].concat(this._itemNodesMap[identity]);
	},

	_setSelectedItemAttr: function(/*dojo.data.Item or id*/ item){
		// summary:
		//		Select a tree node related to passed item.
		//		WARNING: if model use multi-parented items or desired tree node isn't already loaded
		//		behavior is not granted. Use 'path' attr instead for full support.
		var oldValue = this.attr("selectedItem");
		var identity = (!item || dojo.isString(item)) ? item : this.model.getIdentity(item);
		if(identity == oldValue ? this.model.getIdentity(oldValue) : null){ return; }
		var nodes = this._itemNodesMap[identity];
		if(nodes && nodes.length){
			//select the first item
			this.focusNode(nodes[0]);
		}else if(this.lastFocused){
			// Select none so deselect current
			this.lastFocused.setSelected(false);
			this.lastFocused = null;
		}
	},

	_getSelectedItemAttr: function(){
		// summary:
		//		Return item related to selected tree node.
		return this.lastFocused && this.lastFocused.item;
	},
	
	_setPathAttr: function(/*Item[] || String[]*/ path){
		// summary:
		//		Select the tree node identified by passed path.
		// path:
		//		Array of items or item id's

		if(!path || !path.length){ return; }

		// If this is called during initialization, defer running until Tree has finished loading
		this._loadDeferred.addCallback(dojo.hitch(this, function(){
			if(!this.rootNode){
				console.debug("!this.rootNode");
				return;
			}
			if(path[0] !== this.rootNode.item && (dojo.isString(path[0]) && path[0] != this.model.getIdentity(this.rootNode.item))){
				console.error(this, ":path[0] doesn't match this.rootNode.item.  Maybe you are using the wrong tree.");
				return;
			}
			path.shift();

			var node = this.rootNode;
			
			function advance(){
				// summary:
				// 		Called when "node" has completed loading and expanding.   Pop the next item from the path
				//		(which must be a child of "node") and advance to it, and then recurse.
				
				// Set item and identity to next item in path (node is pointing to the item that was popped
				// from the path _last_ time.
				var item = path.shift(),
					identity = dojo.isString(item) ? item : this.model.getIdentity(item);
				
				// Change "node" from previous item in path to the item we just popped from path
				dojo.some(this._itemNodesMap[identity], function(n){
					if(n.getParent() == node){
						node = n;
						return true;
					}
					return false;
				});
				
				if(path.length){
					// Need to do more expanding
					this._expandNode(node).addCallback(dojo.hitch(this, advance));
				}else{
					// Final destination node, select it
					if(this.lastFocused != node){
						this.focusNode(node);
					}
				}
			}

			this._expandNode(node).addCallback(dojo.hitch(this, advance));
		}));
	},

	_getPathAttr: function(){
		// summary:
		//		Return an array of items that is the path to selected tree node.
		if(!this.lastFocused){ return; }
		var res = [];
		var treeNode = this.lastFocused;
		while(treeNode && treeNode !== this.rootNode){
			res.unshift(treeNode.item);
			treeNode = treeNode.getParent();
		}
		res.unshift(this.rootNode.item);
		return res;
	},

	////////////// Data store related functions //////////////////////
	// These just get passed to the model; they are here for back-compat

	mayHaveChildren: function(/*dojo.data.Item*/ item){
		// summary:
		//		Deprecated.   This should be specified on the model itself.
		//
		//		Overridable function to tell if an item has or may have children.
		//		Controls whether or not +/- expando icon is shown.
		//		(For efficiency reasons we may not want to check if an element actually
		//		has children until user clicks the expando node)
		// tags:
		//		deprecated
	},

	getItemChildren: function(/*dojo.data.Item*/ parentItem, /*function(items)*/ onComplete){
		// summary:
		//		Deprecated.   This should be specified on the model itself.
		//
		// 		Overridable function that return array of child items of given parent item,
		//		or if parentItem==null then return top items in tree
		// tags:
		//		deprecated
	},

	///////////////////////////////////////////////////////
	// Functions for converting an item to a TreeNode
	getLabel: function(/*dojo.data.Item*/ item){
		// summary:
		//		Overridable function to get the label for a tree node (given the item)
		// tags:
		//		extension
		return this.model.getLabel(item);	// String
	},

	getIconClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS class name to display icon
		// tags:
		//		extension
		return (!item || this.model.mayHaveChildren(item)) ? (opened ? "dijitFolderOpened" : "dijitFolderClosed") : "dijitLeaf"
	},

	getLabelClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS class name to display label
		// tags:
		//		extension
	},
	
	getRowClass: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS class name to display row
		// tags:
		//		extension
	},
	
	getIconStyle: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS styles to display icon
		// returns:
		//		Object suitable for input to dojo.style() like {backgroundImage: "url(...)"}
		// tags:
		//		extension
	},

	getLabelStyle: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS styles to display label
		// returns:
		//		Object suitable for input to dojo.style() like {color: "red", background: "green"}
		// tags:
		//		extension
	},
	
	getRowStyle: function(/*dojo.data.Item*/ item, /*Boolean*/ opened){
		// summary:
		//		Overridable function to return CSS styles to display row
		// returns:
		//		Object suitable for input to dojo.style() like {background-color: "#bbb"}
		// tags:
		//		extension
	},

	getTooltip: function(/*dojo.data.Item*/ item){
		// summary:
		//		Overridable function to get the tooltip for a tree node (given the item)
		// tags:
		//		extension
		return "";	// String
	},

	/////////// Keyboard and Mouse handlers ////////////////////

	_onKeyPress: function(/*Event*/ e){
		// summary:
		//		Translates keypress events into commands for the controller
		if(e.altKey){ return; }
		var dk = dojo.keys;
		var treeNode = dijit.getEnclosingWidget(e.target);
		if(!treeNode){ return; }

		var key = e.charOrCode;
		if(typeof key == "string"){  // handle printables (letter navigation)
			// Check for key navigation.
			if(!e.altKey && !e.ctrlKey && !e.shiftKey && !e.metaKey){
				this._onLetterKeyNav( { node: treeNode, key: key.toLowerCase() } );
				dojo.stopEvent(e);
			}
		}else{  // handle non-printables (arrow keys)
			// clear record of recent printables (being saved for multi-char letter navigation),
			// because "a", down-arrow, "b" shouldn't search for "ab"
			if(this._curSearch){
				clearTimeout(this._curSearch.timer);
				delete this._curSearch;
			}

			var map = this._keyHandlerMap;
			if(!map){
				// setup table mapping keys to events
				map = {};
				map[dk.ENTER]="_onEnterKey";
				map[this.isLeftToRight() ? dk.LEFT_ARROW : dk.RIGHT_ARROW]="_onLeftArrow";
				map[this.isLeftToRight() ? dk.RIGHT_ARROW : dk.LEFT_ARROW]="_onRightArrow";
				map[dk.UP_ARROW]="_onUpArrow";
				map[dk.DOWN_ARROW]="_onDownArrow";
				map[dk.HOME]="_onHomeKey";
				map[dk.END]="_onEndKey";
				this._keyHandlerMap = map;
			}
			if(this._keyHandlerMap[key]){
				this[this._keyHandlerMap[key]]( { node: treeNode, item: treeNode.item, evt: e } );	
				dojo.stopEvent(e);
			}
		}
	},

	_onEnterKey: function(/*Object*/ message, /*Event*/ evt){
		this._publish("execute", { item: message.item, node: message.node } );
		this.onClick(message.item, message.node, evt);
	},

	_onDownArrow: function(/*Object*/ message){
		// summary: down arrow pressed; get next visible node, set focus there
		var node = this._getNextNode(message.node);
		if(node && node.isTreeNode){
			this.focusNode(node);
		}	
	},

	_onUpArrow: function(/*Object*/ message){
		// summary:
		//		Up arrow pressed; move to previous visible node

		var node = message.node;

		// if younger siblings		
		var previousSibling = node.getPreviousSibling();
		if(previousSibling){
			node = previousSibling;
			// if the previous node is expanded, dive in deep
			while(node.isExpandable && node.isExpanded && node.hasChildren()){
				// move to the last child
				var children = node.getChildren();
				node = children[children.length-1];
			}
		}else{
			// if this is the first child, return the parent
			// unless the parent is the root of a tree with a hidden root
			var parent = node.getParent();
			if(!(!this.showRoot && parent === this.rootNode)){
				node = parent;
			}
		}

		if(node && node.isTreeNode){
			this.focusNode(node);
		}
	},

	_onRightArrow: function(/*Object*/ message){
		// summary:
		//		Right arrow pressed; go to child node
		var node = message.node;

		// if not expanded, expand, else move to 1st child
		if(node.isExpandable && !node.isExpanded){
			this._expandNode(node);
		}else if(node.hasChildren()){
			node = node.getChildren()[0];
			if(node && node.isTreeNode){
				this.focusNode(node);
			}
		}
	},

	_onLeftArrow: function(/*Object*/ message){
		// summary:
		//		Left arrow pressed.
		//		If not collapsed, collapse, else move to parent.

		var node = message.node;

		if(node.isExpandable && node.isExpanded){
			this._collapseNode(node);
		}else{
			var parent = node.getParent();
			if(parent && parent.isTreeNode && !(!this.showRoot && parent === this.rootNode)){
				this.focusNode(parent);
			}
		}
	},

	_onHomeKey: function(){
		// summary:
		//		Home key pressed; get first visible node, and set focus there
		var node = this._getRootOrFirstNode();
		if(node){
			this.focusNode(node);
		}
	},

	_onEndKey: function(/*Object*/ message){
		// summary:
		//		End key pressed; go to last visible node.

		var node = this.rootNode;
		while(node.isExpanded){
			var c = node.getChildren();
			node = c[c.length - 1];
		}

		if(node && node.isTreeNode){
			this.focusNode(node);
		}
	},

	// multiCharSearchDuration: Number
	//		If multiple characters are typed where each keystroke happens within
	//		multiCharSearchDuration of the previous keystroke,
	//		search for nodes matching all the keystrokes.
	//
	//		For example, typing "ab" will search for entries starting with
	//		"ab" unless the delay between "a" and "b" is greater than multiCharSearchDuration.
	multiCharSearchDuration: 250,

	_onLetterKeyNav: function(message){
		// summary:
		//		Called when user presses a prinatable key; search for node starting with recently typed letters.
		// message: Object
		//		Like { node: TreeNode, key: 'a' } where key is the key the user pressed.

		// Branch depending on whether this key starts a new search, or modifies an existing search
		var cs = this._curSearch;
		if(cs){
			// We are continuing a search.  Ex: user has pressed 'a', and now has pressed
			// 'b', so we want to search for nodes starting w/"ab".
			cs.pattern = cs.pattern + message.key;
			clearTimeout(cs.timer);
		}else{
			// We are starting a new search
			cs = this._curSearch = {
					pattern: message.key,
					startNode: message.node
			};
		}

		// set/reset timer to forget recent keystrokes
		var self = this;
		cs.timer = setTimeout(function(){
			delete self._curSearch;
		}, this.multiCharSearchDuration);

		// Navigate to TreeNode matching keystrokes [entered so far].
		var node = cs.startNode;
		do{
			node = this._getNextNode(node);
			//check for last node, jump to first node if necessary
			if(!node){
				node = this._getRootOrFirstNode();
			}
		}while(node !== cs.startNode && (node.label.toLowerCase().substr(0, cs.pattern.length) != cs.pattern));
		if(node && node.isTreeNode){
			// no need to set focus if back where we started
			if(node !== cs.startNode){
				this.focusNode(node);
			}
		}
	},

	_onClick: function(/*TreeNode*/ nodeWidget, /*Event*/ e){
		// summary:
		//		Translates click events into commands for the controller to process

		var domElement = e.target;

		if( (this.openOnClick && nodeWidget.isExpandable) ||
			(domElement == nodeWidget.expandoNode || domElement == nodeWidget.expandoNodeText) ){
			// expando node was clicked, or label of a folder node was clicked; open it
			if(nodeWidget.isExpandable){
				this._onExpandoClick({node:nodeWidget});
			}
		}else{
			this._publish("execute", { item: nodeWidget.item, node: nodeWidget, evt: e } );
			this.onClick(nodeWidget.item, nodeWidget, e);
			this.focusNode(nodeWidget);
		}
		dojo.stopEvent(e);
	},
	_onDblClick: function(/*TreeNode*/ nodeWidget, /*Event*/ e){
		// summary:
		//		Translates double-click events into commands for the controller to process

		var domElement = e.target;

		if( (this.openOnDblClick && nodeWidget.isExpandable) ||
			(domElement == nodeWidget.expandoNode || domElement == nodeWidget.expandoNodeText) ){
			// expando node was clicked, or label of a folder node was clicked; open it
			if(nodeWidget.isExpandable){
				this._onExpandoClick({node:nodeWidget});
			}
		}else{
			this._publish("execute", { item: nodeWidget.item, node: nodeWidget, evt: e } );
			this.onDblClick(nodeWidget.item, nodeWidget, e);
			this.focusNode(nodeWidget);
		}
		dojo.stopEvent(e);
	},

	_onExpandoClick: function(/*Object*/ message){
		// summary:
		//		User clicked the +/- icon; expand or collapse my children.
		var node = message.node;
		
		// If we are collapsing, we might be hiding the currently focused node.
		// Also, clicking the expando node might have erased focus from the current node.
		// For simplicity's sake just focus on the node with the expando.
		this.focusNode(node);

		if(node.isExpanded){
			this._collapseNode(node);
		}else{
			this._expandNode(node);
		}
	},

	onClick: function(/* dojo.data */ item, /*TreeNode*/ node, /*Event*/ evt){
		// summary:
		//		Callback when a tree node is clicked
		// tags:
		//		callback
	},
	onDblClick: function(/* dojo.data */ item, /*TreeNode*/ node, /*Event*/ evt){
		// summary:
		//		Callback when a tree node is double-clicked
		// tags:
		//		callback
	},
	onOpen: function(/* dojo.data */ item, /*TreeNode*/ node){
		// summary:
		//		Callback when a node is opened
		// tags:
		//		callback
	},
	onClose: function(/* dojo.data */ item, /*TreeNode*/ node){
		// summary:
		//		Callback when a node is closed
		// tags:
		//		callback
	},

	_getNextNode: function(node){
		// summary:
		//		Get next visible node

		if(node.isExpandable && node.isExpanded && node.hasChildren()){
			// if this is an expanded node, get the first child
			return node.getChildren()[0];		// _TreeNode	
		}else{
			// find a parent node with a sibling
			while(node && node.isTreeNode){
				var returnNode = node.getNextSibling();
				if(returnNode){
					return returnNode;		// _TreeNode
				}
				node = node.getParent();
			}
			return null;
		}
	},

	_getRootOrFirstNode: function(){
		// summary:
		//		Get first visible node
		return this.showRoot ? this.rootNode : this.rootNode.getChildren()[0];
	},

	_collapseNode: function(/*_TreeNode*/ node){
		// summary:
		//		Called when the user has requested to collapse the node

		if(node._expandNodeDeferred){
			delete node._expandNodeDeferred;
		}

		if(node.isExpandable){
			if(node.state == "LOADING"){
				// ignore clicks while we are in the process of loading data
				return;
			}

			node.collapse();
			this.onClose(node.item, node);

			if(node.item){
				this._state(node.item,false);
				this._saveState();
			}
		}
	},

	_expandNode: function(/*_TreeNode*/ node, /*Boolean?*/ recursive){
		// summary:
		//		Called when the user has requested to expand the node
		// recursive:
		//		Internal flag used when _expandNode() calls itself, don't set.
		// returns:
		//		Deferred that fires when the node is loaded and opened and (if persist=true) all it's descendants
		//		that were previously opened too

		if(node._expandNodeDeferred && !recursive){
			// there's already an expand in progress (or completed), so just return
			return node._expandNodeDeferred;	// dojo.Deferred
		}

		var model = this.model,
			item = node.item,
			_this = this;

		switch(node.state){
			case "UNCHECKED":
				// need to load all the children, and then expand
				node.markProcessing();
				
				// Setup deferred to signal when the load and expand are finished.
				// Save that deferred in this._expandDeferred as a flag that operation is in progress.
				var def = (node._expandNodeDeferred = new dojo.Deferred());

				// Get the children 
				model.getChildren(
					item,
					function(items){
						node.unmarkProcessing();

						// Display the children and also start expanding any children that were previously expanded
						// (if this.persist == true).   The returned Deferred will fire when those expansions finish.  
						var scid = node.setChildItems(items);

						// Call _expandNode() again but this time it will just to do the animation (default branch).
						// The returned Deferred will fire when the animation completes.
						// TODO: seems like I can avoid recursion and just use a deferred to sequence the events?
						var ed = _this._expandNode(node, true);

						// After the above two tasks (setChildItems() and recursive _expandNode()) finish,
						// signal that I am done.
						scid.addCallback(function(){
							ed.addCallback(function(){
								def.callback();	
							})
						});
					},
					function(err){
						console.error(_this, ": error loading root children: ", err);
					}
				);
				break;

			default:	// "LOADED"
				// data is already loaded; just expand node
				def = (node._expandNodeDeferred = node.expand());

				this.onOpen(node.item, node);

				if(item){
					this._state(item, true);
					this._saveState();
				}
		}

		return def;	// dojo.Deferred
	},

	////////////////// Miscellaneous functions ////////////////

	focusNode: function(/* _tree.Node */ node){
		// summary:
		//		Focus on the specified node (which must be visible)
		// tags:
		//		protected

		// set focus so that the label will be voiced using screen readers
		dijit.focus(node.labelNode);
	},

	_onNodeFocus: function(/*dijit._Widget*/ node){
		// summary:
		//		Called when a TreeNode gets focus, either by user clicking
		//		it, or programatically by arrow key handling code.
		// description:
		//		It marks that the current node is the selected one, and the previously
		//		selected node no longer is.

		if (node){
			if(node != this.lastFocused && this.lastFocused){
				// mark that the previously selected node is no longer the selected one
				this.lastFocused.setSelected(false);
			}

			// mark that the new node is the currently selected one
			node.setSelected(true);
			this.lastFocused = node;
		}
	},

	_onNodeMouseEnter: function(/*dijit._Widget*/ node){
		// summary:
		//		Called when mouse is over a node (onmouseenter event)
	},

	_onNodeMouseLeave: function(/*dijit._Widget*/ node){
		// summary:
		//		Called when mouse is over a node (onmouseenter event)
	},

	//////////////// Events from the model //////////////////////////
	
	_onItemChange: function(/*Item*/ item){
		// summary:
		//		Processes notification of a change to an item's scalar values like label
		var model = this.model,
			identity = model.getIdentity(item),
			nodes = this._itemNodesMap[identity];

		if(nodes){
			var self = this;
			dojo.forEach(nodes,function(node){
				node.attr({
					label: self.getLabel(item),
					tooltip: self.getTooltip(item)
				});
				node._updateItemClasses(item);
			});
		}
	},

	_onItemChildrenChange: function(/*dojo.data.Item*/ parent, /*dojo.data.Item[]*/ newChildrenList){
		// summary:
		//		Processes notification of a change to an item's children
		var model = this.model,
			identity = model.getIdentity(parent),
			parentNodes = this._itemNodesMap[identity];

		if(parentNodes){
			dojo.forEach(parentNodes,function(parentNode){
				parentNode.setChildItems(newChildrenList);
			});
		}
	},

	_onItemDelete: function(/*Item*/ item){
		// summary:
		//		Processes notification of a deletion of an item
		var model = this.model,
			identity = model.getIdentity(item),
			nodes = this._itemNodesMap[identity];

		if(nodes){
			dojo.forEach(nodes,function(node){
				var parent = node.getParent();
				if(parent){
					// if node has not already been orphaned from a _onSetItem(parent, "children", ..) call...
					parent.removeChild(node);
				}
				node.destroyRecursive();
			});
			delete this._itemNodesMap[identity];
		}
	},

	/////////////// Miscellaneous funcs
	
	_initState: function(){
		// summary:
		//		Load in which nodes should be opened automatically
		if(this.persist){
			var cookie = dojo.cookie(this.cookieName);
			this._openedItemIds = {};
			if(cookie){
				dojo.forEach(cookie.split(','), function(item){
					this._openedItemIds[item] = true;
				}, this);
			}
		}
	},
	_state: function(item,expanded){
		// summary:
		//		Query or set expanded state for an item,
		if(!this.persist){
			return false;
		}
		var id=this.model.getIdentity(item);
		if(arguments.length===1){
			return this._openedItemIds[id];
		}
		if(expanded){
			this._openedItemIds[id] = true;
		}else{
			delete this._openedItemIds[id];
		}
	},
	_saveState: function(){
		// summary:
		//		Create and save a cookie with the currently expanded nodes identifiers
		if(!this.persist){
			return;
		}
		var ary = [];
		for(var id in this._openedItemIds){
			ary.push(id);
		}
		dojo.cookie(this.cookieName, ary.join(","), {expires:365});
	},

	destroy: function(){
		if(this._curSearch){
			clearTimeout(this._curSearch.timer);
			delete this._curSearch;
		}
		if(this.rootNode){
			this.rootNode.destroyRecursive();
		}
		if(this.dndController && !dojo.isString(this.dndController)){
			this.dndController.destroy();
		}
		this.rootNode = null;
		this.inherited(arguments);
	},
	
	destroyRecursive: function(){
		// A tree is treated as a leaf, not as a node with children (like a grid),
		// but defining destroyRecursive for back-compat.
		this.destroy();
	},

	resize: function(changeSize){
		if(changeSize){
			dojo.marginBox(this.domNode, changeSize);
			dojo.style(this.domNode, "overflow", "auto");	// for scrollbars
		}

		// The only JS sizing involved w/tree is the indentation, which is specified
		// in CSS and read in through this dummy indentDetector node (tree must be
		// visible and attached to the DOM to read this)
		this._nodePixelIndent = dojo.marginBox(this.tree.indentDetector).w;
		
		if(this.tree.rootNode){
			// If tree has already loaded, then reset indent for all the nodes
			this.tree.rootNode.attr('indent', this.showRoot ? 0 : -1);
		}
	},

	_createTreeNode: function(/*Object*/ args){
		// summary:
		//		creates a TreeNode
		// description:
		//		Developers can override this method to define their own TreeNode class;
		//		However it will probably be removed in a future release in favor of a way
		//		of just specifying a widget for the label, rather than one that contains
		//		the children too.
		return new dijit._TreeNode(args);
	}
});

// For back-compat.  TODO: remove in 2.0
dojo.require("dijit.tree.TreeStoreModel");
dojo.require("dijit.tree.ForestStoreModel");
