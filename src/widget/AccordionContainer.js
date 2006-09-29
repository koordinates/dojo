/**
 * Holds a set of panes where every pane's title is visible, but only one pane's content is visible at a time.
 *
 * Front view (3 panes, pane #2 open)
 * ------------------------
 * |:::Pane#1 title:::    |
 * |:::Pane#2 title:::    |
 * |                      |
 * |    pane#2 contents   |
 * |                      |
 * |:::Pane#3 title:::    |
 * ------------------------
 *
 * Side view (showing implementation):
 *
 *         viewport    pane#3     pane#2     pane#1
 *            =                                
 *            |                                =
 *            |                      =         |
 * front      |                      |         |
 *            |                      |         =
 *            |                      =
 *            |          =
 *            =          |
 *                       |
 *                       =
 *
 * Panes are stacked by z-index like a stack of cards, so they can be slid correctly.
 * The panes on the bottom extend past the bottom of the viewport.
 *
 * TODO: this class should extend PageContainer
 */

dojo.provide("dojo.widget.AccordionContainer");

dojo.require("dojo.widget.*");
dojo.require("dojo.html.*");
dojo.require("dojo.lfx.html");
dojo.require("dojo.widget.AccordionPane");
dojo.require("dojo.widget.PageContainer");

dojo.widget.defineWidget(
	"dojo.widget.AccordionContainer",
	dojo.widget.HtmlWidget,
	{
		isContainer: true,
		labelNodeClass: "label",
		containerNodeClass: "accBody",

		// Integer
		//	Amount of time (in ms) it takes to slide panes
		duration: 250,

		fillInTemplate: function(){
			with(this.domNode.style){
				// position must be either relative or absolute
				if(position!="absolute"){
					position="relative";
				}
				overflow="hidden";
			}
		},

		addChild: function(widget, overrideContainerNode, pos, ref, insertIndex){
			var child = this._addChild(widget);
			this._setSizes();
			return child;
		},
		
		_addChild: function(/*Widget*/ widget){
			// summary
			//	Internal call to add child, used during postCreate() and by the real addChild() call
			if(widget.open){
				dojo.deprecated("open parameter deprecated, use 'selected=true' instead will be removed in ", "0.5");
				dojo.debug(widget.widgetId + ": open == " + widget.open);
				widget.selected=true;
			}
			if (widget.widgetType != "AccordionPane") {
				var wrapper=dojo.widget.createWidget("AccordionPane",{label: widget.label, selected: widget.selected, labelNodeClass: this.labelNodeClass, containerNodeClass: this.containerNodeClass, allowCollapse: this.allowCollapse });
				wrapper.addChild(widget);
				this.addWidgetAsDirectChild(wrapper);
				this.registerChild(wrapper, this.children.length);
				return wrapper;
			} else {
				dojo.html.addClass(widget.containerNode, this.containerNodeClass);
				dojo.html.addClass(widget.labelNode, this.labelNodeClass);
				this.addWidgetAsDirectChild(widget);
				this.registerChild(widget, this.children.length);	
				return widget;
			}
		},
	
		postCreate: function() {
			var tmpChildren = this.children;
			this.children=[];
			dojo.html.removeChildren(this.domNode);
			dojo.lang.forEach(tmpChildren, dojo.lang.hitch(this,"_addChild"));
			this._setSizes();
		},
	
		removeChild: function(widget) {
			dojo.widget.AccordionContainer.superclass.removeChild.call(this, widget);
			this._setSizes();
		},
		
		onResized: function(){
			this._setSizes();
		},

		_setSizes: function() {
			// summary
			//	Move panes to right position based on current open node.

			// get cumulative height of all the title bars, and figure out which pane is open
			var totalCollapsedHeight = 0;
			var openIdx = 0;
			dojo.lang.forEach(this.children, function(child, idx){
				totalCollapsedHeight += child.getLabelHeight();
				if(child.selected){ openIdx=idx; }
			});

			// size and position each pane
			var mySize=dojo.html.getContentBox(this.domNode);
			var y = 0;
			dojo.lang.forEach(this.children, function(child, idx){
				var childCollapsedHeight = child.getLabelHeight();
				child.resizeTo(mySize.width, mySize.height-totalCollapsedHeight+childCollapsedHeight);
				child.domNode.style.zIndex=idx+1;
				child.domNode.style.position="absolute";
				child.domNode.style.top = y+"px";
				y += (idx==openIdx) ? dojo.html.getBorderBox(child.domNode).height : childCollapsedHeight;
			});
		},

		selectChild: function(/*Widget*/ page){
			// summary
			//	close the current page and select a new one
			dojo.lang.forEach(this.children, function(child){child.setSelected(child==page);});

			// slide each pane that needs to be moved
			var y = 0;
			var anims = [];
			dojo.lang.forEach(this.children, function(child, idx){
				if(child.domNode.style.top != (y+"px")){
					anims.push(dojo.lfx.html.slideTo(child.domNode, {top: y, left: 0}, this.duration));
				}
				y += child.selected ? dojo.html.getBorderBox(child.domNode).height : child.getLabelHeight();
			});
			dojo.lfx.combine(anims).play();
		}
	}
);

// These arguments can be specified for the children of an AccordionContainer
// Since any widget can be specified as a child, mix them
// into the base widget class.  (This is a hack, but it's effective.)
dojo.lang.extend(dojo.widget.Widget, {
	// String
	//	is this the selected child?
	//	DEPRECATED: will be removed in 0.5.  Used "selected" attribute instead.
	open: false
});
