dojo.provide("dijit.form.Checkbox");

dojo.require("dijit.base.FormElement");
dojo.require("dijit.base.TemplatedWidget");
dojo.require("dijit.util.sniff");
dojo.require("dijit.util.wai");

dojo.declare(
	"dijit.form.Checkbox",
	[dijit.base.FormElement, dijit.base.TemplatedWidget],
	{
		// summary:
		// 		Same as an HTML checkbox, but with fancy styling.
		//
		// description:
		// Implementation details
		//
		// pattern: MVC
		//   Control: User interacts with real html inputs
		//     Event listeners are added for input node events
		//     These handlers make sure to update the view based on input state
		//   View: The view is basically the the dijit (tundra) sprint image.
		//   Model: The dijit checked state is synched with the input node.
		//
		// There are two modes:
		//   1. Image not used or failed to load
		//   2. Image loaded and used.
		// In case 1, the regular html inputs are shown and used by the user.
		// In case 2, the regular html inputs are invisible but still used by
		// the user. They are turned quasi-invisible and overlay the dijit image.
		//
		// Layout
		//   Styling is controlled in 3 places: tundra, template, and 
		// programmatically in Checkbox.js. The latter is required 
		// because of two modes of dijit checkbox: image loaded, vs 
		// image not loaded. Also for accessibility it is important 
		// that dijit work with images off (a browser preference).
		//
		//	Order of images in the sprite (from L to R, checkbox and radio in same image):
		//		checkbox	normal 	 - checked
		//							 - unchecked
		//					disabled - checked
		//							 - unchecked
		//					hover 	 - checked
		//							 - unchecked
		//
		//		radio		normal 	 - checked
		//							 - unchecked
		//					disabled - checked
		//							 - unchecked
		//					hover 	 - checked
		//							 - unchecked

		templatePath: dojo.moduleUrl("dijit.form", "templates/Checkbox.html"),

		//	Value of "type" attribute for <input>
		_type: "checkbox",

		// checked: Boolean 
		// Corresponds to the native HTML <input> element's attribute. 
		// If true, checkbox is initially marked turned on; 
		// in markup, specified as "checked='checked'" or just "checked"
		checked: false, 

		// value: Value
		//	equivalent to value field on normal checkbox (if checked, the value is passed as
		//	the value when form is submitted)
		value: "on",
		
		postCreate: function(){
			// find the image to use, as notated in the CSS file, but use it as a foreground
			var bi = dojo.getComputedStyle(this.imageContainer).backgroundImage;
			var href = bi.charAt(4)=='"' ? bi.slice(5,-2) : bi.slice(4,-1);	// url(foo) --> foo, url("foo") --> foo
			this.imageContainer.style.backgroundImage = "none";
			var img = (this.imageNode = document.createElement("img"));
			var self=this;

			// inputNode.checked must be assigned before img.onload handler
			this.inputNode.checked=this.checked;
			// note: onImageLoad may get called as a side-effect of this assignment
			img.onload = function(){ self.onImageLoad(); }
			img.src = href;
			this._setDisabled(this.disabled);
		},

		onImageLoad: function(){
			this.imageLoaded = true;

			// set image container size to just show one sprite
			if(!this.width){
				this.width = 16;
			} // dojo.html.getPixelValue is not succeeding for all browsers
			if(!this.height){
				this.height = 16;
			}

			// Turn the input element invisible and make sure it overlays
			// the dojo image container.
			dojo.addClass(this.inputNode,"dijitCheckboxInputInvisible");
			dojo.addClass(this.imageContainer,"dijitCheckboxImageContainer");

			var imageContainerStyle = this.imageContainer.style;
			var inputStyle = this.inputNode.style;
			var domNodeStyle = this.domNode.style;
			 
			// Force size based on width and height.
			inputStyle.width = imageContainerStyle.width = this.width + "px";
			inputStyle.height = imageContainerStyle.height = this.height + "px";
			domNodeStyle.position = "relative";
			
			// carve some space in the flow for this dom node
			if(dojo.isSafari){
				// use this hack sparingly (see ticket:2942)
				domNodeStyle.fontFamily = "monospace";
				var spacer = document.createTextNode("\u00a0\u00a0");
				this.domNode.appendChild(spacer);
			}else{
				domNodeStyle.paddingRight = this.width + "px";
			}
			
			// User will always interact with input element
			this._connectEvents(this.inputNode);
			
			this.imageContainer.appendChild(this.imageNode);
			
			this._updateView();
		},
		
		_connectEvents: function(/*DomNode*/ node){
			this.connect(node, "onfocus", this.mouseOver);
			this.connect(node, "onblur", this.mouseOut);
			this.connect(node, "onmouseover", this.mouseOver);
			this.connect(node, "onmouseout", this.mouseOut);
			this.connect(node, "onclick", this._onClick);
			dijit._disableSelection(node);
		},

		_setDisabled: function(/*Boolean*/ disabled){
			// summary: set disabled state of widget.
			dijit.form.Checkbox.superclass._setDisabled.apply(this,arguments);
			this._updateView();
		},

		onChecked: function(/*Boolean*/ newCheckedState){
			// summary: callback when checked state is changed
		},
		
		setChecked: function(/*Boolean*/ check){
			// summary: set the checked state of the widget.
			if(check != this.inputNode.checked){
				this.inputNode.checked = check;
				this._updateView();
			}
		},
	
		getChecked: function(){
			// summary: get the checked state of the widget.
			return this.checked;
		},

		setValue: function(value){
			if(value == null){ value = ""; }
			this.inputNode.value = value;
			dijit.form.Checkbox.superclass.setValue.call(this,value);
		},

		onClick: function(/*Event*/ e){
			// summary: user overridable callback for click event handling 
		},
		
		_onClick: function(/*Event*/ e){
			/// summary: callback for a click event
			this._updateView();
			this.onClick(e);
		},

		mouseOver: function(/*Event*/ e){
			// summary: callback when user moves mouse over checkbox
			this.hover=true;
			this._updateView();
		},

		mouseOut: function(/*Event*/ e){
			// summary: callback when user moves mouse off of checkbox
			this.hover=false;
			this._updateView();
		},

		// offset from left of image
		_leftOffset: 0,
		
		_updateView: function(/*Widget?*/ awidget){
			var w = awidget || this;

			if(w.checked != w.inputNode.checked){
				w.checked = w.inputNode.checked;
				w.onChecked(w.checked);
			}

			// show the right sprite, depending on state of checkbox
			if(w.imageLoaded){
				var left = w._leftOffset + (w.checked ? 0 : w.width) +
					(w.disabled ? this.width*2 : (w.hover ? w.width*4 : 0));
				w.imageNode.style.marginLeft = -1*left + "px";
			}
			if(!awidget){
				this.updateContext();
			}
		},
		
		updateContext: function(){
			// summary: specialize this function to update related GUI
		}
	}
);

dojo.declare(
	"dijit.form.RadioButton",
	dijit.form.Checkbox,
	{
		// summary:
		// 		Same as an HTML radio, but with fancy styling.
		//
		// description:
		// Implementation details
		//
		// Specialization:
		// We keep track of dijit radio groups so that we can update the state
		// of all the siblings (the "context") in a group based on input 
		// events. We don't rely on browser radio grouping.
		//
		// At the time of implementation not all browsers fire the same events
		// when a different radio button in a group is checked (and the previous
		// unchecked). When the events do fire, e.g. a focus event on the newly
		// checked radio, the checked state of that "newly checked" radio is 
		// set to true in some browsers and false in others.
		// It is vital that the view of the resulting input states be correct
		// so that at the time of form submission the intended data is sent.
		
		_type: "radio",
		
		// This shared object keeps track of all widgets, grouped by name
		_groups: {},

		_register: function(){
			// summary: add this widget to _groups
			(this._groups[this.name] = this._groups[this.name] || []).push(this);
		},

		_deregister: function(){
			// summary: remove this widget from _groups
			dojo.forEach(this._groups[this.name], function(widget, i, arr){
				if(widget === this){
					arr.splice(i, 1);
					return;
				}
			}, this);
		},
		
		uninitialize: function(){
			this._deregister();
		},

		updateContext: function(){
			// summary: make sure the sibling radio views are correct
			dojo.forEach(this._groups[this.name], function(widget){
				if(widget != this){
					widget._updateView(widget);
				}
			}, this);
		},

		onImageLoad: function(){
			this._leftOffset = 96;	// this.imageNode.width/2;
			this._register();
			dijit.form.Checkbox.prototype.onImageLoad.call(this);
		}
	}
);
