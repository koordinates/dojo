dojo.provide("dojox.widget.FisheyeList");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Container");

dojo.declare("dojox.widget.FisheyeList",
	[dijit._Widget, dijit._Templated, dijit._Container],
	function(){
	//
	// TODO
	// fix really long labels in vertical mode
	//
	//
	// summary
	//	Menu similar to the fish eye menu on the Mac OS
	// usage
	//	<div dojoType="FisheyeList"
	//	itemWidth="40" itemHeight="40"
	//	itemMaxWidth="150" itemMaxHeight="150"
	//	orientation="horizontal"
	//	effectUnits="2"
	//	itemPadding="10"
	//	attachEdge="center"
	//	labelEdge="bottom">
	//
	//		<div dojoType="FisheyeListItem"
	//			id="item1"
	//			onclick="alert('click on' + this.label + '(from widget id ' + this.widgetId + ')!');"
	//			label="Item 1"
	//			iconsrc="images/fisheye_1.png">
	//		</div>
	//		...
	//	</div>
	//
		 
	this.pos = {'x': -1, 'y': -1};	// current cursor position, relative to the grid

	// for conservative trigger mode, when triggered, timerScale is gradually increased from 0 to 1
	this.timerScale = 1.0;
	
},{

	EDGE: {
		CENTER: 0,
		LEFT: 1,
		RIGHT: 2,
		TOP: 3,
		BOTTOM: 4
	},

	templateString: '<div class="dojoHtmlFisheyeListBar"></div>',

	snarfChildDomOutput: true,
	
	// itemWidth: Integer
	//	width of menu item (in pixels) in it's dormant state (when the mouse is far away)
	itemWidth: 40,
	
	// itemHeight: Integer
	//	height of menu item (in pixels) in it's dormant state (when the mouse is far away)
	itemHeight: 40,
	
	// itemMaxWidth: Integer
	//	width of menu item (in pixels) in it's fully enlarged state (when the mouse is directly over it)
	itemMaxWidth: 150,
	
	// itemMaxHeight: Integer
	//	height of menu item (in pixels) in it's fully enlarged state (when the mouse is directly over it)
	itemMaxHeight: 150,

	imgNode: null,
	
	// orientation: String
	//	orientation of the menu, either "horizontal" or "vertical"
	orientation: 'horizontal',
	
	// conservativeTrigger: Boolean
	//	if true, don't start enlarging menu items until mouse is over an image;
	//	if false, start enlarging menu items as the mouse moves near them.
	conservativeTrigger: false,
	
	// effectUnits: Number
	//	controls how much reaction the menu makes, relative to the distance of the mouse from the menu
	effectUnits: 2,
		
	// itemPadding: Integer
	//	padding (in pixels) betweeen each menu item
	itemPadding: 10,
	
	// attachEdge: String
	//	controls the border that the menu items don't expand past;
	//	for example, if set to "top", then the menu items will drop downwards as they expand.
	// values
	//	"center", "left", "right", "top", "bottom".
	attachEdge: 'center',

	// labelEdge: String
	//	controls were the labels show up in relation to the menu item icons
	// values
	//	"center", "left", "right", "top", "bottom".
	labelEdge: 'bottom',

	postCreate: function(){
		dojo.setSelectable(this.domNode, false);

		this.isHorizontal = (this.orientation == 'horizontal');
		this.selectedNode = -1;

		this.isOver = false;
		this.hitX1 = -1;
		this.hitY1 = -1;
		this.hitX2 = -1;
		this.hitY2 = -1;

		//
		// only some edges make sense...
		//
		this.anchorEdge = this._toEdge(this.attachEdge, this.EDGE.CENTER);
		this.labelEdge  = this._toEdge(this.labelEdge,  this.EDGE.TOP);

		if ( this.isHorizontal && (this.anchorEdge == this.EDGE.LEFT  )){ this.anchorEdge = this.EDGE.CENTER; }
		if ( this.isHorizontal && (this.anchorEdge == this.EDGE.RIGHT )){ this.anchorEdge = this.EDGE.CENTER; }
		if (!this.isHorizontal && (this.anchorEdge == this.EDGE.TOP   )){ this.anchorEdge = this.EDGE.CENTER; }
		if (!this.isHorizontal && (this.anchorEdge == this.EDGE.BOTTOM)){ this.anchorEdge = this.EDGE.CENTER; }

		if (this.labelEdge == this.EDGE.CENTER){ this.labelEdge = this.EDGE.TOP; }
		if ( this.isHorizontal && (this.labelEdge == this.EDGE.LEFT  )){ this.labelEdge = this.EDGE.TOP; }
		if ( this.isHorizontal && (this.labelEdge == this.EDGE.RIGHT )){ this.labelEdge = this.EDGE.TOP; }
		if (!this.isHorizontal && (this.labelEdge == this.EDGE.TOP   )){ this.labelEdge = this.EDGE.LEFT; }
		if (!this.isHorizontal && (this.labelEdge == this.EDGE.BOTTOM)){ this.labelEdge = this.EDGE.LEFT; }

		//
		// figure out the proximity size
		//
		this.proximityLeft   = this.itemWidth  * (this.effectUnits - 0.5);
		this.proximityRight  = this.itemWidth  * (this.effectUnits - 0.5);
		this.proximityTop    = this.itemHeight * (this.effectUnits - 0.5);
		this.proximityBottom = this.itemHeight * (this.effectUnits - 0.5);
	
		if(this.anchorEdge == this.EDGE.LEFT){
			this.proximityLeft = 0;
		}
		if(this.anchorEdge == this.EDGE.RIGHT){
			this.proximityRight = 0;
		}
		if(this.anchorEdge == this.EDGE.TOP){
			this.proximityTop = 0;
		}
		if(this.anchorEdge == this.EDGE.BOTTOM){
			this.proximityBottom = 0;
		}
		if(this.anchorEdge == this.EDGE.CENTER){
			this.proximityLeft   /= 2;
			this.proximityRight  /= 2;
			this.proximityTop    /= 2;
			this.proximityBottom /= 2;
		}
	},
	
	startup: function(){
		// summary: create our connections and setup our FisheyeList
		this.children = this.getChildren();
		//original postCreate() --tk
		this._initializePositioning();
	
		//
		// in liberal trigger mode, activate menu whenever mouse is close
		//
		if(!this.conservativeTrigger){
			this._onMouseMoveHandle = dojo.connect(document.documentElement, "onmousemove", this, "_onMouseMove");
		}
			
		// Deactivate the menu if mouse is moved off screen (doesn't work for FF?)
		this._onMouseOutHandle = dojo.connect(document.documentElement, "onmouseout", this, "_onBodyOut");
		this._addChildHandle = dojo.connect(this, "addChild", this, "_initializePositioning");
	},
	
	_initializePositioning: function(){
		this.itemCount = this.children.length;
	
		this.barWidth  = (this.isHorizontal ? this.itemCount : 1) * this.itemWidth;
		this.barHeight = (this.isHorizontal ? 1 : this.itemCount) * this.itemHeight;
	
		this.totalWidth  = this.proximityLeft + this.proximityRight  + this.barWidth;
		this.totalHeight = this.proximityTop  + this.proximityBottom + this.barHeight;
	
		//
		// calculate effect ranges for each item
		//

		for(var i=0; i<this.children.length; i++){

			this.children[i].posX = this.itemWidth  * (this.isHorizontal ? i : 0);
			this.children[i].posY = this.itemHeight * (this.isHorizontal ? 0 : i);

			this.children[i].cenX = this.children[i].posX + (this.itemWidth  / 2);
			this.children[i].cenY = this.children[i].posY + (this.itemHeight / 2);

			var isz = this.isHorizontal ? this.itemWidth : this.itemHeight;
			var r = this.effectUnits * isz;
			var c = this.isHorizontal ? this.children[i].cenX : this.children[i].cenY;
			var lhs = this.isHorizontal ? this.proximityLeft : this.proximityTop;
			var rhs = this.isHorizontal ? this.proximityRight : this.proximityBottom;
			var siz = this.isHorizontal ? this.barWidth : this.barHeight;

			var range_lhs = r;
			var range_rhs = r;

			if(range_lhs > c+lhs){ range_lhs = c+lhs; }
			if(range_rhs > (siz-c+rhs)){ range_rhs = siz-c+rhs; }

			this.children[i].effectRangeLeft = range_lhs / isz;
			this.children[i].effectRangeRght = range_rhs / isz;

			//dojo.debug('effect range for '+i+' is '+range_lhs+'/'+range_rhs);
		}

		//
		// create the bar
		//
		this.domNode.style.width = this.barWidth + 'px';
		this.domNode.style.height = this.barHeight + 'px';

		//
		// position the items
		//
		for(var i=0; i<this.children.length; i++){
			var itm = this.children[i];
			var elm = itm.domNode;
			elm.style.left   = itm.posX + 'px';
			elm.style.top    = itm.posY + 'px';
			elm.style.width  = this.itemWidth + 'px';
			elm.style.height = this.itemHeight + 'px';
			
			itm.imgNode.style.left = this.itemPadding+'%';
			itm.imgNode.style.top = this.itemPadding+'%';
			itm.imgNode.style.width = (100 - 2 * this.itemPadding) + '%';
			itm.imgNode.style.height = (100 - 2 * this.itemPadding) + '%';
		}

		//
		// calc the grid
		//
		this._calcHitGrid();
	},

	_overElement: function(/* HTMLElement */element, /* DOMEvent */e){
		//	summary
		//	Returns whether the mouse is over the passed element.
		//	Element must be display:block (ie, not a <span>)
		element = dojo.byId(element);
		var mouse = {x: e.pageX, y: e.pageY};
		var bb = dojo._getBorderBox(element);
		var absolute = dojo.coords(element, true);
		var top = absolute.y;
		var bottom = top + bb.h;
		var left = absolute.x;
		var right = left + bb.w;

		return (mouse.x >= left
			&& mouse.x <= right
			&& mouse.y >= top
			&& mouse.y <= bottom
		);	//	boolean
	},

	_onBodyOut: function(/*Event*/ e){
		// clicking over an object inside of body causes this event to fire; ignore that case
		if( this._overElement(dojo.body(), e) ){
			return;
		}
		this._setDormant(e);
	},

	_setDormant: function(/*Event*/ e){
		// summary: called when mouse moves out of menu's range

		if(!this.isOver){ return; }	// already dormant?
		this.isOver = false;

		if(this.conservativeTrigger){
			// user can't re-trigger the menu expansion
			// until he mouses over a icon again
			dojo.disconnect(this._onMouseMoveHandle);
		}
		this._onGridMouseMove(-1, -1);
	},

	_setActive: function(/*Event*/ e){
		// summary: called when mouse is moved into menu's range

		if(this.isOver){ return; }	// already activated?
		this.isOver = true;

		if (this.conservativeTrigger) {
			// switch event handlers so that we handle mouse events from anywhere near
			// the menu
			this._onMouseMoveHandle = dojo.connect(document.documentElement, "onmousemove", this, "_onMouseMove");

			this.timerScale=0.0;

			// call mouse handler to do some initial necessary calculations/positioning
			this._onMouseMove(e);

			// slowly expand the icon size so it isn't jumpy
			this._expandSlowly();
		}
	},

	_onMouseMove: function(/*Event*/ e){
		// summary: called when mouse is moved
		if((e.pageX >= this.hitX1) && (e.pageX <= this.hitX2) &&
			(e.pageY >= this.hitY1) && (e.pageY <= this.hitY2)){
			if(!this.isOver){
				this._setActive(e);
			}
			this._onGridMouseMove(e.pageX-this.hitX1, e.pageY-this.hitY1);
		}else{
			if(this.isOver){
				this._setDormant(e);
			}
		}
	},

	onResized: function(){
		this._calcHitGrid();
	},

	_onGridMouseMove: function(x, y){
		// summary: called when mouse is moved in the vicinity of the menu
		this.pos = {x:x, y:y};
		this._paint();
	},

	_paint: function(){
		var x=this.pos.x;
		var y=this.pos.y;

		if(this.itemCount <= 0){ return; }

		//
		// figure out our main index
		//
		var pos = this.isHorizontal ? x : y;
		var prx = this.isHorizontal ? this.proximityLeft : this.proximityTop;
		var siz = this.isHorizontal ? this.itemWidth : this.itemHeight;
		var sim = this.isHorizontal ? 
			(1.0-this.timerScale)*this.itemWidth + this.timerScale*this.itemMaxWidth :
			(1.0-this.timerScale)*this.itemHeight + this.timerScale*this.itemMaxHeight ;

		var cen = ((pos - prx) / siz) - 0.5;
		var max_off_cen = (sim / siz) - 0.5;

		if(max_off_cen > this.effectUnits){ max_off_cen = this.effectUnits; }

		//
		// figure out our off-axis weighting
		//
		var off_weight = 0;

		if(this.anchorEdge == this.EDGE.BOTTOM){
			var cen2 = (y - this.proximityTop) / this.itemHeight;
			off_weight = (cen2 > 0.5) ? 1 : y / (this.proximityTop + (this.itemHeight / 2));
		}
		if(this.anchorEdge == this.EDGE.TOP){
			var cen2 = (y - this.proximityTop) / this.itemHeight;
			off_weight = (cen2 < 0.5) ? 1 : (this.totalHeight - y) / (this.proximityBottom + (this.itemHeight / 2));
		}
		if(this.anchorEdge == this.EDGE.RIGHT){
			var cen2 = (x - this.proximityLeft) / this.itemWidth;
			off_weight = (cen2 > 0.5) ? 1 : x / (this.proximityLeft + (this.itemWidth / 2));
		}
		if(this.anchorEdge == this.EDGE.LEFT){
			var cen2 = (x - this.proximityLeft) / this.itemWidth;
			off_weight = (cen2 < 0.5) ? 1 : (this.totalWidth - x) / (this.proximityRight + (this.itemWidth / 2));
		}
		if (this.anchorEdge == this.EDGE.CENTER){
			if(this.isHorizontal){
				off_weight = y / (this.totalHeight);
			}else{
				off_weight = x / (this.totalWidth);
			}

			if(off_weight > 0.5){
				off_weight = 1 - off_weight;
			}

			off_weight *= 2;
		}

		//
		// set the sizes
		//
		for(var i=0; i<this.itemCount; i++){
			var weight = this._weighAt(cen, i);
			if(weight < 0){weight = 0;}
			this._setItemSize(i, weight * off_weight);
		}

		//
		// set the positions
		//

		var main_p = Math.round(cen);
		var offset = 0;

		if(cen < 0){
			main_p = 0;

		}else if(cen > this.itemCount - 1){

			main_p = this.itemCount -1;

		}else{

			offset = (cen - main_p) * ((this.isHorizontal ? this.itemWidth : this.itemHeight) - this.children[main_p].sizeMain);
		}

		this._positionElementsFrom(main_p, offset);
	},

	_weighAt: function(/*Integer*/ cen, /*Integer*/ i){
		var dist = Math.abs(cen - i);
		var limit = ((cen - i) > 0) ? this.children[i].effectRangeRght : this.children[i].effectRangeLeft;
		return (dist > limit) ? 0 : (1 - dist / limit); // Integer
	},

	_setItemSize: function(p, scale){
		scale *= this.timerScale;
		var w = Math.round(this.itemWidth  + ((this.itemMaxWidth  - this.itemWidth ) * scale));
		var h = Math.round(this.itemHeight + ((this.itemMaxHeight - this.itemHeight) * scale));

		if(this.isHorizontal){

			this.children[p].sizeW = w;
			this.children[p].sizeH = h;

			this.children[p].sizeMain = w;
			this.children[p].sizeOff  = h;

			var y = 0;
			if(this.anchorEdge == this.EDGE.TOP){
				y = (this.children[p].cenY - (this.itemHeight / 2));
			}else if(this.anchorEdge == this.EDGE.BOTTOM){
				y = (this.children[p].cenY - (h - (this.itemHeight / 2)));
			}else{
				y = (this.children[p].cenY - (h / 2));
			}

			this.children[p].usualX = Math.round(this.children[p].cenX - (w / 2));
			this.children[p].domNode.style.top  = y + 'px';
			this.children[p].domNode.style.left  = this.children[p].usualX + 'px';

		}else{

			this.children[p].sizeW = w;
			this.children[p].sizeH = h;

			this.children[p].sizeOff  = w;
			this.children[p].sizeMain = h;

			var x = 0;
			if(this.anchorEdge == this.EDGE.LEFT){
				x = this.children[p].cenX - (this.itemWidth / 2);
			}else if (this.anchorEdge == this.EDGE.RIGHT){
				x = this.children[p].cenX - (w - (this.itemWidth / 2));
			}else{
				x = this.children[p].cenX - (w / 2);
			}

			this.children[p].domNode.style.left = x + 'px';
			this.children[p].usualY = Math.round(this.children[p].cenY - (h / 2));

			this.children[p].domNode.style.top  = this.children[p].usualY + 'px';
		}

		this.children[p].domNode.style.width  = w + 'px';
		this.children[p].domNode.style.height = h + 'px';

		if(this.children[p].svgNode){
			this.children[p].svgNode.setSize(w, h);
		}
	},

	_positionElementsFrom: function(p, offset){
		var pos = 0;

		if(this.isHorizontal){
			pos = Math.round(this.children[p].usualX + offset);
			this.children[p].domNode.style.left = pos + 'px';
		}else{
			pos = Math.round(this.children[p].usualY + offset);
			this.children[p].domNode.style.top = pos + 'px';
		}
		this._positionLabel(this.children[p]);

		// position before
		var bpos = pos;
		for(var i=p-1; i>=0; i--){
			bpos -= this.children[i].sizeMain;

			if (this.isHorizontal){
				this.children[i].domNode.style.left = bpos + 'px';
			}else{
				this.children[i].domNode.style.top = bpos + 'px';
			}
			this._positionLabel(this.children[i]);
		}

		// position after
		var apos = pos;
		for(var i=p+1; i<this.itemCount; i++){
			apos += this.children[i-1].sizeMain;
			if(this.isHorizontal){
				this.children[i].domNode.style.left = apos + 'px';
			}else{
				this.children[i].domNode.style.top = apos + 'px';
			}
			this._positionLabel(this.children[i]);
		}

	},

	_positionLabel: function(itm){
		var x = 0;
		var y = 0;
		
		var mb = dojo.marginBox(itm.lblNode);

		if(this.labelEdge == this.EDGE.TOP){
			x = Math.round((itm.sizeW / 2) - (mb.w / 2));
			y = -mb.h;
		}

		if(this.labelEdge == this.EDGE.BOTTOM){
			x = Math.round((itm.sizeW / 2) - (mb.w / 2));
			y = itm.sizeH;
		}

		if(this.labelEdge == this.EDGE.LEFT){
			x = -mb.w;
			y = Math.round((itm.sizeH / 2) - (mb.h / 2));
		}

		if(this.labelEdge == this.EDGE.RIGHT){
			x = itm.sizeW;
			y = Math.round((itm.sizeH / 2) - (mb.h / 2));
		}

		itm.lblNode.style.left = x + 'px';
		itm.lblNode.style.top  = y + 'px';
	},

	_calcHitGrid: function(){

		var pos = dojo.coords(this.domNode, true);

		this.hitX1 = pos.x - this.proximityLeft;
		this.hitY1 = pos.y - this.proximityTop;
		this.hitX2 = this.hitX1 + this.totalWidth;
		this.hitY2 = this.hitY1 + this.totalHeight;

	},

	_toEdge: function(inp, def){
		return this.EDGE[inp.toUpperCase()] || def;
	},

	_expandSlowly: function(){
		// summary: slowly expand the image to user specified max size
		if(!this.isOver){ return; }
		this.timerScale += 0.2;
		this._paint();
		if(this.timerScale<1.0){
			setTimeout(dojo.hitch(this, "_expandSlowly"), 10);
		}
	},

	destroyRecursive: function(){
		// need to disconnect when we destroy
		dojo.disconnect(this._onMouseOutHandle);
		dojo.disconnect(this._onMouseMoveHandle);
		dojo.disconnect(this._addChildHandle);
		dojox.widget.FisheyeList.superclass.destroyRecursive.call(this);
	}
});

dojo.declare("dojox.widget.FisheyeListItem",
	[dijit._Widget, dijit._Templated, dijit._Contained],
	null,
	{

	/*
	 * summary
	 *	Menu item inside of a FisheyeList.
	 *	See FisheyeList documentation for details on usage.
	 */

	// iconSrc: String
	//	pathname to image file (jpg, gif, png, etc.) of icon for this menu item
	iconSrc: "",

	// label: String
	//	label to print next to the icon, when it is moused-over
	label: "",

	// id: String
	//	will be set to the id of the orginal div element
	id: "",

	_blankImgPath: dojo.moduleUrl("dojox.widget", "FisheyeList/blank.gif"),

	templateString:
		'<div class="dojoHtmlFisheyeListItem">' +
		'  <img class="dojoHtmlFisheyeListItemImage" dojoAttachPoint="imgNode" dojoAttachEvent="onmouseover:onMouseOver,onmouseout:onMouseOut,onclick:onClick">' +
		'  <div class="dojoHtmlFisheyeListItemLabel" dojoAttachPoint="lblNode"></div>' +
		'</div>',

	_isNode: function(/* object */wh){
		//	summary:
		//		checks to see if wh is actually a node.
		if(typeof Element == "function") {
			try {
				return wh instanceof Element;	//	boolean
			} catch(e) {}
		}else{
			// best-guess
			return wh && !isNaN(wh.nodeType);	//	boolean
		}
	},

	_hasParent: function(/*Node*/node){
		//	summary:
		//		returns whether or not node is a child of another node.
		return Boolean(node && node.parentNode && this._isNode(node.parentNode));	//	boolean
	},

	postCreate: function() {

		// set image
		if((this.iconSrc.toLowerCase().substring(this.iconSrc.length-4)==".png")&&(dojo.isIE)&&(dojo.isIE<7)){
			/* we set the id of the new fisheyeListItem to the id of the div defined in the HTML */
			if(this._hasParent(this.imgNode) && this.id != ""){
				var parent = this.imgNode.parentNode;
				parent.setAttribute("id", this.id);
			}
			this.imgNode.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this.iconSrc+"', sizingMethod='scale')";
			this.imgNode.src = this._blankImgPath.toString();
		}else{
			if(this._hasParent(this.imgNode) && this.id != ""){
				var parent = this.imgNode.parentNode;
				parent.setAttribute("id", this.id);
			}
			this.imgNode.src = this.iconSrc;
		}

		// Label
		if (this.lblNode){
			this.lblNode.appendChild(document.createTextNode(this.label));
		}
		dojo.setSelectable(this.domNode, false);
		this.startup();
	},

	startup: function(){
		this.parent = this.getParent();
	},
	
	onMouseOver: function(/*Event*/ e){
		// summary: callback when user moves mouse over this menu item
		// in conservative mode, don't activate the menu until user mouses over an icon
		if(!this.parent.isOver){
			this.parent._setActive(e);
		}
		if(this.label != "" ){
			dojo.addClass(this.lblNode, "selected");
			this.parent._positionLabel(this);
		}
	},
	
	onMouseOut: function(/*Event*/ e){
		// summary: callback when user moves mouse off of this menu item
		dojo.removeClass(this.lblNode, "selected");
	},

	onClick: function(/*Event*/ e){
		// summary: user overridable callback when user clicks this menu item
	}
});
