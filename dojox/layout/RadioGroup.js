dojo.provide("dojox.layout.RadioGroup");
dojo.experimental("dojox.layout.RadioGroup");
//
//	dojox.layout.RadioGroup - an experimental (probably poorly named) Layout widget extending StackContainer
//	that accepts ContentPanes as children, and applies aesthetically pleasing responsive transition animations
//	attached to :hover of the Buttons created.
//
//	FIXME: take the Buttons out of the root template, and allow layoutAlign or similar attrib to use a different
//	template, or build the template dynamically? 
//
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");
dojo.require("dijit.layout.StackContainer");
dojo.require("dojo.fx.easing"); 

dojo.declare("dojox.layout.RadioGroup",
	[dijit.layout.StackContainer,dijit._Templated],
	{
	// summary: A Container that turns its Layout Children into a single Pane and transitions between states
	//	onHover of the button
	//

	// duration: Integer
	//	used for Fade and Slide RadioGroup's, the duration to run the transition animation. does not affect anything
	//	in default RadioGroup
	duration: 750,

	// hasButtons: Boolean
	//	toggles internal button making on or off
	hasButtons: false,

	// buttonClass: String
	//		The full declared className of the Button widget to use for hasButtons
	buttonClass: "dojox.layout._RadioButton",
	
	// templateString: String
	//	the template for our container
	templateString: '<div class="dojoxRadioGroup">' +
			' 	<div dojoAttachPoint="buttonHolder" style="display:none;">' +
			'		<table class="dojoxRadioButtons"><tbody><tr class="dojoxRadioButtonRow" dojoAttachPoint="buttonNode"></tr></tbody></table>' +
			'	</div>' +
			'	<div class="dojoxRadioView" dojoAttachPoint="containerNode"></div>' +
			'</div>',

	startup: function(){
		// summary: scan the container for children, and make "tab buttons" for them
		this.inherited(arguments);
		this._children = this.getChildren();
		this._buttons = this._children.length;
		this._size = dojo.coords(this.containerNode);
		if(this.hasButtons){
			dojo.style(this.buttonHolder,"display","block");
		}
	},

	_setupChild: function(/* dijit._Widget */child){
		// summary: Creates a hover button for a child node of the RadioGroup
		if(this.hasButtons){
			
			dojo.style(child.domNode,"position","absolute");
			
			var tmp = this.buttonNode.appendChild(dojo.create('td'));
			var n = dojo.create("div", null, tmp),
				_Button = dojo.getObject(this.buttonClass),
				tmpw = new _Button({
					label: child.title,
					page: child
				}, n)
			;
			
			dojo.mixin(child, { _radioButton: tmpw });
			tmpw.startup();
		}
		child.domNode.style.display = "none";
	},
	
	removeChild: function(child){
		if(this.hasButtons && child._radioButton){
			child._radioButton.destroy();
			delete child._radioButton;
		}
		this.inherited(arguments);
	},
	
	// FIXME: shouldn't have to rewriting these, need to take styling out of _showChild and _hideChild
	//		and use classes on the domNode in _transition or something similar (in StackContainer)
	_transition: function(/*Widget*/newWidget, /*Widget*/oldWidget){
		// summary: called when StackContainer receives a selectChild call, used to transition the panes.
		this._showChild(newWidget);
		if(oldWidget){
			this._hideChild(oldWidget);
		}
		// Size the new widget, in case this is the first time it's being shown,
		// or I have been resized since the last time it was shown.
		// page must be visible for resizing to work
		if(this.doLayout && newWidget.resize){
			newWidget.resize(this._containerContentBox || this._contentBox);
		}
	},

	_showChild: function(/*Widget*/ page){
		// summary: show the selected child widget
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length-1]);
		page.selected = true;

		page.domNode.style.display="";

		if(page._onShow){
			page._onShow(); // trigger load in ContentPane
		}else if(page.onShow){
			page.onShow();
		}
	},

	_hideChild: function(/*Widget*/ page){
		// summary: hide the specified child widget
		page.selected = false;
		page.domNode.style.display="none";
		if(page.onHide){
			page.onHide();
		}
	}

});

dojo.declare("dojox.layout.RadioGroupFade",
	dojox.layout.RadioGroup,
	{
	// summary: An extension on a stock RadioGroup, that fades the panes.

	_hideChild: function(page){
		// summary: hide the specified child widget
		dojo.fadeOut({
			node:page.domNode,
			duration:this.duration,
			onEnd: dojo.hitch(this,"inherited", arguments)
		}).play();
	},

	_showChild: function(page){
		// summary: show the specified child widget
		this.inherited(arguments);
		dojo.style(page.domNode, "opacity", 0);
		dojo.fadeIn({
			node:page.domNode,
			duration:this.duration
		}).play();
	}
});

dojo.declare("dojox.layout.RadioGroupSlide",
	dojox.layout.RadioGroup,
	{
	// summary: A Sliding Radio Group
	// description: 
	//		An extension on a stock RadioGroup widget, sliding the pane
	//		into view from being hidden. The entry direction is randomized 
	//		on each view
	//		

	// easing: Function
	//	A hook to override the default easing of the pane slides.
	easing: "dojo.fx.easing.backOut",

	// zTop: Integer
	//		A z-index to apply to the incoming pane
	zTop: 99,
	
	constructor: function(){
		if(dojo.isString(this.easing)){
			this.easing = dojo.getObject(this.easing);
		}
	},
	
	_positionChild: function(page){
		// summary: set the child out of view immediately after being hidden
		
		if(!this._size){ return; } // FIXME: is there a real "size" floating around always?
		
		// there should be a contest: obfuscate this function as best you can. 
		var rA = true, rB = true;
		switch(page.slideFrom){
			case "bottom" : rB = !rB; break;
			case "right" : 	rA = !rA; rB = !rB; break;
			case "top" : 	break;
			case "left" : 	rA = !rA; break;
			default:
				rA = Math.round(Math.random());
				rB = Math.round(Math.random());
				break;
		}
		var prop = rA ? "top" : "left",
			val = (rB ? "-" : "") + (this._size[rA ? "h" : "w" ] + 20) + "px";	
			
		dojo.style(page.domNode, prop, val);

	},

	_showChild: function(page){
		// summary: Slide in the selected child widget
		
		var children = this.getChildren();
		page.isFirstChild = (page == children[0]);
		page.isLastChild = (page == children[children.length-1]);
		page.selected = true;

		dojo.style(page.domNode,{
			zIndex: this.zTop, display:"" 
		});

		if(this._anim && this._anim.status()=="playing"){
			this._anim.gotoPercent(100,true);
		}
		
		this._anim = dojo.animateProperty({
			node:page.domNode,
			properties: {
				left: 0,
				top: 0
			},
			duration: this.duration,
			easing: this.easing,
			onEnd: dojo.hitch(page, function(){
				if(this.onShow){ this.onShow(); }
				if(this._onShow){ this._onShow(); }
			}),
			beforeBegin: dojo.hitch(this, "_positionChild", page)
		});
		this._anim.play();
	},

	_hideChild: function(page){
		// summary: reset the position of the hidden pane out of sight

		page.selected = false;
		page.domNode.style.zIndex = this.zTop - 1;
		if(page.onHide){
			page.onHide();
		}

	}
	
});

dojo.declare("dojox.layout._RadioButton",
	[dijit._Widget,dijit._Templated,dijit._Contained],
	{
	// summary: The Buttons for a RadioGroup
	//
	// description: A private widget used to manipulate the StackContainer (RadioGroup*). Don't create directly. 
	//	
	
	// label: String
	//	the Text Label of the button
	label: "",

	// domNode to tell parent to select
	page: null,

	templateString: '<div dojoAttachPoint="focusNode" class="dojoxRadioButton"><span dojoAttachPoint="titleNode" class="dojoxRadioButtonLabel">${label}</span></div>',
	
	startup: function(){
		// summary: start listening to mouseOver
		this.connect(this.domNode, "onmouseenter", "_onMouse");
	},
	
	_onMouse: function(/* Event */e){
		// summary: set the selected child on hover, and set our hover state class
		this.getParent().selectChild(this.page);
		this._clearSelected();
		dojo.addClass(this.domNode,"dojoxRadioButtonSelected");

	},

	_clearSelected: function(){
		// summary: remove hover state class from sibling Buttons. This is easier (and more reliable)
		//	than setting up an additional connection to onMouseOut
		
		// FIXME: this relies on the template being [div][span]node[/span][/div]
		dojo.query(".dojoxRadioButtonSelected", this.domNode.parentNode.parentNode)
			.removeClass("dojoxRadioButtonSelected")
		;
	}
	
});

dojo.extend(dijit._Widget,{
	// slideFrom: String
	//		A parameter needed by RadioGroupSlide only. An optional paramter to force
	//		the ContentPane to slide in from a set direction. Defaults
	//		to "random", or specify one of "top", "left", "right", "bottom"
	//		to slideFrom top, left, right, or bottom.
	slideFrom: "random"	
});
