dojo.provide("dojox.layout.BorderContainer");

dojo.require("dijit.layout._LayoutWidget");

dojo.experimental("dojox.layout.BorderContainer");

dojo.declare(
	"dojox.layout.BorderContainer",
//	[dijit._Widget, dijit._Container, dijit._Contained],
	dijit.layout._LayoutWidget,
{
	// summary
	//	Provides layout in 5 regions, a center and borders along its 4 sides.
	//
	// details
	//	A BorderContainer is a box with a specified size (like style="width: 500px; height: 500px;"),
	//	that contains children widgets marked with "position" of "top", "bottom", "leading", "trailing", "center".
	//  Children will be laid out inside the edges of the box with the remaining space left for the center.
	//  Optional splitters may be specified on the edge widgets to make them resizable by the user.
	//  The outer size must be specified on the BorderContainer node.  Width must be specified for the sides
	//  and height for the top and bottom.
	//  "left" and "right" may be used interchangably for "leading" and "trailing" except that those terms do
	//  not reflect the fact that they will be reversed in right-to-left environments.
	//
	// usage
	//	<style>
	//		html, body{ height: 100%; width: 100%; }
	//	</style>
	//	<div dojoType="BorderContainer" style="width: 100%; height: 100%">
	//		<div dojoType="ContentPane" position="top">header text</div>
	//		<div dojoType="ContentPane" position="right" style="width: 200px;">table of contents</div>
	//		<div dojoType="ContentPane" position="center">client area</div>
	//	</div>

	// priority: String
	//  choose which panels get priority in the layout: "headline" where the top and bottom extend the full width
	//  of the container, or "sidebar" where the left and right sides extend from top to bottom.
	priority: "headline",

//TODO: activeSizing, persist for splitters?

	postCreate: function(){
		this.inherited("postCreate", arguments);

		this.domNode.style.position = "relative";
		dojo.addClass(this.domNode, "dijitBorderContainer");
	},

	layout: function(){
		this._layoutChildren(this.domNode, this._contentBox, this.getChildren());
	},

	addChild: function(/*Widget*/ child, /*Integer?*/ insertIndex){
		dijit._Container.prototype.addChild.apply(this, arguments);
		if(this._started){
			this._layoutChildren(this.domNode, this._contentBox, this.getChildren());
		}
	},

	removeChild: function(/*Widget*/ widget){
		dijit._Container.prototype.removeChild.apply(this, arguments);
		if(this._started){
			this._layoutChildren(this.domNode, this._contentBox, this.getChildren());
		}
	},

	_layoutChildren: function(/*DomNode*/ container, /*Object*/ dim, /*Object[]*/ children){
		/**
		 * summary
		 *		Layout a bunch of child dom nodes within a parent dom node
		 * container:
		 *		parent node
		 * dim:
		 *		{l, t, w, h} object specifying dimensions of container into which to place children
		 * children:
		 *		an array like [ {domNode: foo, position: "bottom" }, {domNode: bar, position: "client"} ]
		 */

//TODO: what is dim and why doesn't it look right?
		// copy dim because we are going to modify it
//		dim = dojo.mixin({}, dim);
if(!this._init){
		this._splitters = {};
		//FIXME: do this once? somewhere else?
		dojo.forEach(this.getChildren(), function(child){
			var position = child.position;
			if(position){
				child.domNode.style.position = "absolute";

				if(position == "leading"){ position = "left"; }
				if(position == "trailing"){ position = "right"; }
				if(!dojo._isBodyLtr()){
					if(position == "left"){
						position = "right";
					}else if(position == "right"){
						position = "left";
					}
				}
				this["_"+position] = child.domNode;

				if(child.splitter){
					var splitter = new dojox.layout._Splitter({ container: this, childNode: child.domNode, position: position });
					this._splitters[position] = splitter.domNode;
					dojo.place(splitter.domNode, child.domNode, "after");
				}
			}
		}, this);
this._init = true;
}

		var sidebarLayout = (this.priority == "sidebar");
		var topHeight = 0, bottomHeight = 0, leftWidth = 0, rightWidth = 0;
		var topStyle = {}, leftStyle = {}, rightStyle = {}, bottomStyle = {},
			centerStyle = (this._center && this._center.style) || {};

		if(this._top){
			topStyle = this._top.style;
			topHeight = dojo.coords(this._top).h;
		}
		if(this._left){
			leftStyle = this._left.style;
			leftWidth = dojo.coords(this._left).w;
		}
		if(this._right){
			rightStyle = this._right.style;
			rightWidth = dojo.coords(this._right).w;
		}
		if(this._bottom){
			bottomStyle = this._bottom.style;
			bottomHeight = dojo.coords(this._bottom).h;
		}

		var topSplitter = this._splitters.top;
		if(topSplitter){
			topSplitter.style.top = topHeight + "px";
			topSplitter.style.left = (sidebarLayout ? leftWidth : "0") + "px";
			topSplitter.style.right = (sidebarLayout ? rightWidth : "0") + "px";
		}

		var bottomSplitter = this._splitters.bottom;
		if(bottomSplitter){
			bottomSplitter.style.bottom = bottomHeight + "px";
			bottomSplitter.style.left = (sidebarLayout ? leftWidth : "0") + "px";
			bottomSplitter.style.right = (sidebarLayout ? rightWidth : "0") + "px";
		}

		var leftSplitter = this._splitters.left;
		if(leftSplitter){
			leftSplitter.style.left = leftWidth + "px";
			leftSplitter.style.top = (sidebarLayout ? "0" : topHeight) + "px";
			leftSplitter.style.bottom = (sidebarLayout ? "0" : bottomHeight) + "px";
		}

		var rightSplitter = this._splitters.right;
		if(rightSplitter){
			rightSplitter.style.right = rightWidth + "px";
			rightSplitter.style.top = (sidebarLayout ? "0" : topHeight) + "px";
			rightSplitter.style.bottom = (sidebarLayout ? "0" : bottomHeight) + "px";
		}

		centerStyle.top = topHeight + (topSplitter ? dojo.coords(topSplitter).h : 0) + "px";
		centerStyle.left = leftWidth + (leftSplitter ? dojo.coords(leftSplitter).w : 0) + "px";
		centerStyle.right =  rightWidth + (rightSplitter ? dojo.coords(rightSplitter).w : 0) + "px";
		centerStyle.bottom = bottomHeight + (bottomSplitter ? dojo.coords(bottomSplitter).h : 0) + "px";

		leftStyle.top = rightStyle.top = sidebarLayout ? "0px" : centerStyle.top;
		leftStyle.left = rightStyle.right = "0px";
		leftStyle.bottom = rightStyle.bottom = sidebarLayout ? "0px" : centerStyle.bottom;

		topStyle.top = "0px";
		bottomStyle.bottom = "0px";
		if(sidebarLayout){
			topStyle.left = bottomStyle.left = leftWidth + (leftSplitter && !dojo._isBodyLtr() ? dojo.coords(leftSplitter).w : 0) + "px";
			topStyle.right = bottomStyle.right = rightWidth + (rightSplitter && dojo._isBodyLtr() ? dojo.coords(rightSplitter).w : 0) + "px";
		}else{
			topStyle.left = topStyle.right = "0px";
			bottomStyle.left = bottomStyle.right = "0px";
		}

		if(dojo.isIE){
			this.domNode._top = this._top;
			this.domNode._bottom = this._bottom;
			var containerHeight = "dojo.style("+this.id+",'height')";
			var middleHeight = containerHeight;
			if(this._top){ middleHeight += "-dojo.style("+this.id+"._top,'height')"; }
			if(this._bottom){ middleHeight += "-dojo.style("+this.id+"._bottom, 'height')"; }
			if(this._center){ centerStyle.setExpression("height", middleHeight); }
//What I'd think would work
//			leftStyle.setExpression("height", sidebarLayout ? containerHeight : middleHeight);
//			rightStyle.setExpression("height", sidebarLayout ? containerHeight : middleHeight);
//What actually works
			if(this._left){ leftStyle.setExpression("height", sidebarLayout ? this.id+".offsetHeight" : middleHeight + "+" + this.id+".offsetHeight-"+containerHeight); }
			if(this._right){ rightStyle.setExpression("height", sidebarLayout ? this.id+".offsetHeight" : middleHeight + "+" + this.id+".offsetHeight-"+containerHeight); }

			if(dojo.isIE < 7){
				this.domNode._left = this._left;
				this.domNode._right = this._right;
				var containerWidth = "dojo.style("+this.id+",'width')";
				var middleWidth = containerWidth;
				if(this._left){ middleWidth += "-dojo.style("+this.id+"._left,'width')"; }
				if(this._right){ middleWidth += "-dojo.style("+this.id+"._right, 'width')"; }
				if(this._center){ centerStyle.setExpression("width", middleWidth); }
				if(this._top){ topStyle.setExpression("width", sidebarLayout ? middleWidth + "+" + this.id+".offsetWidth-"+containerWidth : this.id+".offsetWidth"); }
				if(this._bottom){ bottomStyle.setExpression("width", sidebarLayout ? middleWidth + "+" + this.id+".offsetWidth-"+containerWidth : this.id+".offsetWidth"); }
			}
		}

		dojo.forEach(this.getChildren(), function(child){ child.resize && child.resize(); });
	},

	resize: function(args){
		this.layout();
	}
});

// This argument can be specified for the children of a BorderContainer.
// Since any widget can be specified as a LayoutContainer child, mix it
// into the base widget class.  (This is a hack, but it's effective.)
dojo.extend(dijit._Widget, {
	// position: String
	//		"top", "bottom", "leading", "trailing", "left", "right", "center".
	//		See the BorderContainer description for details on this parameter.
	position: 'none',

	// splitter: Boolean
	splitter: false
});

dojo.require("dijit._Templated");

dojo.declare("dojox.layout._Splitter", [ dijit._Widget, dijit._Templated ],
{
	// thickness: Number
	thickness: 10,

	container: null,
	childNode: null,
	position: null,

	// live: Boolean
	//		If true, the child's size changes as you drag the bar;
	//		otherwise, the size doesn't change until you drop the bar (by mouse-up)
	live: true,

	// summary: A draggable spacer between two items in a BorderContainer
	templateString: '<div class="dijitSplitter" dojoAttachEvent="onkeypress:_onKeyPress,onmousedown:_startDrag" style="position: absolute; z-index: 9999" tabIndex="0"></div>',

	postCreate: function(){
		this.inherited("postCreate", arguments);
		this.horizontal = /top|bottom/.test(this.position);
		dojo.addClass(this.domNode, "dijitSplitter" + this.horizontal ? "Horizontal" : "Vertical");		
		this.domNode.style[this.horizontal ? "height" : "width"] = this.thickness + "px";
	},

	_startDrag: function(e){
		dojo.addClass(this.domNode, "dijitSplitterActive");
		this._resize = this.live;
		var horizontal = this.horizontal;
		this._pageStart = horizontal ? e.pageY : e.pageX;
		this._childStart = dojo.coords(this.childNode)[ horizontal ? 'h' : 'w' ];
		var axis = horizontal ? 'y' : 'x';
		this._splitterStart = dojo.coords(this.domNode)[axis] - dojo.coords(this.container.domNode)[axis];
		this._handlers = [
				dojo.connect(dojo.doc, "onmousemove", this, "_drag"),
				dojo.connect(dojo.doc, "onmouseup", this, "_stopDrag")
			];
		dojo.stopEvent(e);
	},

	_drag: function(e){
		var delta = (this.horizontal ? e.pageY : e.pageX) - this._pageStart;
		if(this._resize){
			this._move(delta, this._childStart);
		}else{
			var splitterCoord = delta + this._splitterStart;
			this.domNode.style[ this.horizontal ? "top" : "left" ] = splitterCoord + "px"; //FIXME: this ends up off by a few pixels for right/bottom
		}
	},

	_stopDrag: function(e){
		dojo.removeClass(this.domNode, "dijitSplitterActive");
		this._drag(e);
		this._resize = true;
		this._drag(e);
		dojo.forEach(this._handlers, dojo.disconnect);
		delete this._handlers;
	},

	_onKeyPress: function(/*Event*/ e){
		// should we apply typematic to this?
		this._resize = true;
		var horizontal = this.horizontal;
		var tick = 1;
		switch(e.keyCode){
			case horizontal ? dojo.keys.UP_ARROW : dojo.keys.LEFT_ARROW:
				tick *= -1;
				break;
			case horizontal ? dojo.keys.DOWN_ARROW : dojo.keys.RIGHT_ARROW:
				break;
			default:
//				this.inherited("_onKeyPress", arguments);
				return;
		}
		this._move(tick, dojo.coords(this.childNode)[ horizontal ? 'h' : 'w' ]);
		dojo.stopEvent(e);
	},

	_move: function(/*Number*/delta, oldChildSize){
		var factor = /top|left/.test(this.position) ? 1 : -1;
		var childStart = oldChildSize;
		var childSize = factor * delta + childStart;
		this.childNode.style[ this.horizontal ? "height" : "width" ] = childSize + "px";
		this.container.layout();
	},

	destroy: function(){
		this.inherited("destroy", arguments);
		this._stopDrag();
		delete this.childNode;
		delete this.container;
	}
});
