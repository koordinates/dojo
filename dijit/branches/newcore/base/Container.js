dojo.provide("dijit.base.Container");

dojo.require("dijit.util.manager");
		
dojo.declare("dijit.base.Contained", //FIXME: typo for Container?? 
	null,
	{
		// summary
		//		Mixin for widgets that are children of a container widget

//FIXME: docs should be explicit that methods deal in widgets, not nodes
		getParent: function(){
			// summary:
			//		returns parent widget
			for(var p=this.domNode.parentNode; p; p=p.parentNode){
				var widgetId = p.widgetId;
				if(widgetId){
					return dijit.byId(widgetId);
				}
			}
		},
		
		getSiblings: function(){
			// summary: gets an array of all children of our parent, including "this"
			var parent = this.getParent();
			if(!parent){ return[this]; }
			return parent.getChildren(); // Array
		},

		getPreviousSibling: function(){
			// summary:
			//		returns null if this is the first child of the parent,
			//		otherwise returns the next sibling to the "left".

			var node = this.domNode;
			do {
				node = node.previousSibling;
			} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);
			if(!node){ return null; } // null
			var id = node.widgetId;
			return dijit.byId(id);
		},
	 
		getNextSibling: function(){
			// summary:
			//		returns null if this is the last child of the parent,
			//		otherwise returns the next sibling to the "right".

			var node = this.domNode;
			do {
				node = node.nextSibling;
			} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);
			if(!node){ return null; } // null
			var id = node.widgetId;
			return dijit.byId(id);
		}
	}
);

dojo.declare("dijit.base.Container", 
	null,
	{
		// summary
		//		Mixin for widgets that contain a list of children like SplitContainer

		isContainer: true,

		addChild: function(/*Widget*/ widget, /*int?*/ insertIndex){
			// summary:
			//		Process the given child widget, inserting it's dom node as
			//		a child of our dom node

			if(typeof insertIndex == "undefined"){
				insertIndex = this.children.length;
			}
			var containerNode = this.containerNode || this.domNode;
			if(containerNode === widget){
				return false;  // throw instead?
			}
			var node = widget.domNode;
			var parent = node.parentNode;
			var siblingNodes = containerNode.childNodes;

			// if there aren't any kids yet, just add it to the beginning
			if(!siblingNodes.length || siblingNodes.length == insertIndex){
				containerNode.appendChild(node);
			}else if(!insertIndex){
				parent.insertBefore(node, containerNode.firstChild);
			}else{
				// otherwise we need to walk the childNodes and find our spot
				return parent.insertBefore(node, siblingNodes[insertIndex]); // boolean
			}
//FIXME: does this function have to return a boolean?  only for recursive check?  Should that throw instead?
			return true; // boolean
		},

		removeChild: function(/*Widget*/ widget){
			// summary: 
			//		removes the passed widget instance from this widget but does
			//		not destroy it
//PORT leak?
			var node = widget.domNode;
			node.parentNode.removeChild(node);
		},

		getChildren: function(){
			// summary:
			//		returns array of children widgets

			var nextElement = function(node){
				do {
					node = node.nextSibling;
				} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);
				return node;
			};

			var res = [];
			var cn = this.containerNode || this.domNode;
			for(var childNode=cn.firstChild; childNode; childNode=dijit.base._nextElement(childNode)){
				res.push(dijit.byId(childNode.widgetId));
			}
			return res;
		}
	}
);
