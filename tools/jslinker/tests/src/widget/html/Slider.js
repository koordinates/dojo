/**
 * Slider Widget.
 * 
 * The slider widget comes in three forms:
 *  1. Base Slider widget which supports movement in x and y dimensions
 *  2. Vertical Slider (SliderVertical) widget which supports movement
 *     only in the y dimension.
 *  3. Horizontal Slider (SliderHorizontal) widget which supports movement
 *     only in the x dimension.
 *
 * The key objects in the widget are:
 *  - a container div which displays a bar in the background (Slider object)
 *  - a handle inside the container div, which represents the value
 *    (sliderHandle DOM node)
 *  - the object which moves the handle (handleMove is of type 
 *    SliderDragMoveSource)
 *
 * The values for the slider are calculated by grouping pixels together, 
 * based on the number of values to be represented by the slider.
 * The number of pixels in a group is called the _valueSize
 *  e.g. if slider is 150 pixels long, and is representing the values
 *       0,1,...10 then pixels are grouped into lots of 15 (_valueSize), where:
 *         value 0 maps to pixels  0 -  7
 *               1                 8 - 22
 *               2                23 - 37 etc.
 * The accuracy of the slider is limited to the number of pixels
 * (i.e tiles > pixels will result in the slider not being able to
 *  represent some values).
 *
 * Technical Notes:
 *  - 3 widgets exist because the framework caches the template in
 *    dojo.widget.fillFromTemplateCache (which ignores the changed URI)
 *
 * Todo:
 *  - Issues with dragging handle when page has been scrolled
 *  - 
 *
 * References (aka sources of inspiration):
 *  - http://dojotoolkit.org/docs/fast_widget_authoring.html
 *  - http://dojotoolkit.org/docs/dojo_event_system.html
 * 
 * @author Marcel Linnenfelser (m.linnen@synflag.de)
 * @author Mathew Pole (mathew.pole@ebor.com)
 *
 * $Id: $
 */

// tell the package system what functionality is provided in this module (file)
// (note that the package system works on modules, not the classes)
dojo.provide("dojo.widget.html.Slider");

// load dependencies
dojo.require("dojo.event.*");
dojo.require("dojo.dnd.*");
// dojo.dnd.* doesn't include this package, because it's not in __package__.js
dojo.require("dojo.dnd.HtmlDragMove");
dojo.require("dojo.widget.*");
dojo.require("dojo.style");


/**
 * Define the two dimensional slider widget class.
 */
dojo.widget.defineWidget (
	"dojo.widget.html.Slider",
	dojo.widget.HtmlWidget,
	{
		// useful properties (specified as attributes in the html tag)
		// minimum value to be represented by slider in the horizontal direction
		minimumX: 0,
		// minimum value to be represented by slider in the vertical direction
		minimumY: 0,
		// maximum value to be represented by slider in the horizontal direction
		maximumX: 10,
		// maximum value to be represented by slider in the vertical direction
		maximumY: 10,
		// can values be changed on the x (horizontal) axis?
		// number of values to be represented by slider in the horizontal direction
		// =0 means no snapping
		snapValuesX: 0,
		// number of values to be represented by slider in the vertical direction
		// =0 means no snapping
		snapValuesY: 0,
		// should the handle snap to the grid or remain where it was dragged to?
		// FIXME: snapToGrid=false is logically in conflict with setting snapValuesX and snapValuesY
		_snapToGrid: true,
		// can values be changed on the x (horizontal) axis?
		isEnableX: true,
		// can values be changed on the y (vertical) axis?
		isEnableY: true,
		// value size (pixels) in the x dimension
		_valueSizeX: 0.0,
		// value size (pixels) in the y dimension
		_valueSizeY: 0.0,
		// constrained slider size (pixels) in the x dimension
		_constraintWidth: 0,
		// constrained slider size (pixels) in the y dimension
		_constraintHeight: 0,
		// initial value in the x dimension
		initialValueX: 0,
		// initial value in the y dimension
		initialValueY: 0,

		// do we allow the user to click on the slider to set the position?
		// (note: dojo's infrastructor will convert attribute to a boolean)
		clickSelect: true,
		// should the value change while you are dragging, or just after drag finishes?
		activeDrag: false,

		templateCssPath: dojo.uri.dojoUri ("src/widget/templates/HtmlSlider.css"),
		templatePath: dojo.uri.dojoUri ("src/widget/templates/HtmlSlider.html"),

		// our DOM nodes
		sliderHandle: null,

		// private attributes
		// This is set to true when a drag is started, so that it is not confused
		// with a click
		isDragInProgress: false,


		// This function is called when the template is loaded
		fillInTemplate: function (args, frag) 
		{
			// dojo.debug ("fillInTemplate - className = " + this.domNode.className);

			// setup drag-n-drop for the sliderHandle
			this.handleMove = new dojo.widget.html.SliderDragMoveSource (this.sliderHandle);
			this.handleMove.setParent (this);

			dojo.event.connect(this.handleMove, "onDragMove", this, "onDragMove");
			dojo.event.connect(this.handleMove, "onDragEnd", this, "onDragEnd");
			dojo.event.connect(this.handleMove, "onClick", this, "onClick");

			// keep the slider handle inside it's parent container
			this.handleMove.constrainToContainer = true;
		
			if (this.clickSelect) {
				dojo.event.connect (this.domNode, "onclick", this, "onClick");
			} 

			if (this.isEnableX) {
				this.setValueX (!isNaN(this.initialValueX) ? this.initialValueX : (!isNaN(this.minimumX) ? this.minimumX : 0));
			}
			if (this.isEnableY) {
				this.setValueY (!isNaN(this.initialValueY) ? this.initialValueY : (!isNaN(this.minimumY) ? this.minimumY : 0));
			}
		},

		// Move the handle (in the x dimension) to the specified value
		setValueX: function (value) {
			if (0.0 == this._valueSizeX) {
				if (this.handleMove.calc_valueSizeX () == false) {
					setTimeout(dojo.lang.hitch(this,function(){this.setValueX(value);}), 100);
					return;
				}
			}
			if (isNaN(value)) {
				value = 0;
			}
			if (value > this.maximumX) {
				value = this.maximumX;
			}
			else if (value < this.minimumX) {
				value = this.minimumX;
			}
			//dojo.debug ("value = " + value, ", _valueSizeX = " + this._valueSizeX);
			// 2 Math.round's needed to snap the value to the closest allowable position
			this.handleMove.domNode.style.left = Math.round ( Math.round ((value-this.minimumX) / (this.maximumX-this.minimumX) * (this.snapValuesX-1)) * this._valueSizeX) + "px";
		},


		// Get the number of the value that matches the position of the handle
		getValueX: function () {
			var pixelPercent = dojo.style.getPixelValue (this.handleMove.domNode, "left") / this._constraintWidth;
			return Math.round (pixelPercent * (this.snapValuesX-1)) * ((this.maximumX-this.minimumX) / (this.snapValuesX-1)) + this.minimumX;
		},


		// set the slider to a particular value
		setValueY: function (value) {
			if (0.0 == this._valueSizeY) {
				if (this.handleMove.calc_valueSizeY () == false) {
					setTimeout(dojo.lang.hitch(this,function(){this.setValueY(value);}), 100);
					return;
				}
			}
			if (isNaN(value)) {
				value = 0;
			}
			if (value > this.maximumY) {
				value = this.maximumY;
			}
			else if (value < this.minimumY) {
				value = this.minimumY;
			}
			// 2 Math.round's needed to snap the value to the closest allowable position
			this.handleMove.domNode.style.top = Math.round ( Math.round ((value-this.minimumY) / (this.maximumY-this.minimumY) * (this.snapValuesY-1)) * this._valueSizeY) + "px";
		},


		// Get the number of the value that the matches the position of the handle
		getValueY: function () {
			var pixelPercent = dojo.style.getPixelValue (this.handleMove.domNode, "top") / this._constraintHeight;
			return Math.round (pixelPercent * (this.snapValuesY-1)) * ((this.maximumY-this.minimumY) / (this.snapValuesY-1)) + this.minimumY;
		},


		// set the position of the handle
		onClick: function (e) {
			//dojo.debug ("Slider#setPosition - e.clientX = " + e.clientX
			//            + ", e.clientY = " + e.clientY);
			if (this.isDragInProgress) {
				return;
			}

			var offset = dojo.html.getScrollOffset();
			var parent = dojo.style.getAbsolutePosition(this.domNode, true);
			
			if (this.isEnableX) {
				var x = offset.x + e.clientX - parent.x - (dojo.style.getContentWidth(this.handleMove.domNode) >> 1);
				if (x > this._constraintWidth) {
					x = this._constraintWidth;
				}
				this.handleMove.domNode.style.left = x + "px";
			}
			if (this.isEnableY) {
				var y = offset.y + e.clientY - parent.y - (dojo.style.getContentHeight(this.handleMove.domNode) >> 1);
				if (y > this._constraintHeight) {
					y = this._constraintHeight;
				}
				this.handleMove.domNode.style.top = y + "px";
			}
			this.coercePosition();
		},

		notifyListeners: function() {
			this.onValueChanged(this.getValueX(), this.getValueY());
		},

		// snap value
		coercePosition : function() {
			this.setValueX(this.getValueX());
			this.setValueY(this.getValueY());
			this.notifyListeners();
		},


		onDragEnd: function(){
			this.coercePosition();
		},
	
		onDragMove: function(){
			if(this.activeDrag){
				this.notifyListeners();
			}
		},
	
		onValueChanged: function(x, y){
		}
	}
);


/* ------------------------------------------------------------------------- */


/**
 * Define the horizontal slider widget class.
 */
dojo.widget.defineWidget (
	"dojo.widget.html.SliderHorizontal",
	dojo.widget.html.Slider,
	{
		widgetType: "SliderHorizontal",

		isEnableX: true,
		isEnableY: false,
		initialValue: "",
		snapValues: "",
		minimum: "",
		maximum: "",

		templatePath: dojo.uri.dojoUri ("src/widget/templates/HtmlSliderHorizontal.html"),

		postMixInProperties: function(){
			if (!isNaN(parseFloat(this.initialValue))) {
				this.initialValueX = parseFloat(this.initialValue);
			}
			if (!isNaN(parseFloat(this.minimum))) {
				this.minimumX = parseFloat(this.minimum);
			}
			if (!isNaN(parseFloat(this.maximum))) {
				this.maximumX = parseFloat(this.maximum);
			}
			if (!isNaN(parseInt(this.snapValues))) {
				this.snapValuesX = parseInt(this.snapValues);
			}
		},

		notifyListeners: function() {
			this.onValueChanged(this.getValueX());
		},

		// wrapper for getValueX
		getValue: function () {
			return this.getValueX ();
		},

		// wrapper for setValueX
		setValue: function (value) {
			this.setValueX (value);
			this.notifyListeners();
		},

		// snap value
		coercePosition: function() {
			this.setValue(this.getValue());
		},

		onValueChanged: function(value){
		}
	}
);


/* ------------------------------------------------------------------------- */


/**
 * Define the vertical slider widget class.
 */
dojo.widget.defineWidget (
	"dojo.widget.html.SliderVertical",
	dojo.widget.html.Slider,
	{
		widgetType: "SliderVertical",

		isEnableX: false,
		isEnableY: true,
		initialValue: "",
		snapValues: "",
		minimum: "",
		maximum: "",

		templatePath: dojo.uri.dojoUri ("src/widget/templates/HtmlSliderVertical.html"),

		postMixInProperties: function(){
			if (!isNaN(parseFloat(this.initialValue))) {
				this.initialValueY = parseFloat(this.initialValue);
			}
			if (!isNaN(parseFloat(this.minimum))) {
				this.minimumY = parseFloat(this.minimum);
			}
			if (!isNaN(parseFloat(this.maximum))) {
				this.maximumY = parseFloat(this.maximum);
			}
			if (!isNaN(parseInt(this.snapValues))) {
				this.snapValuesY = parseInt(this.snapValues);
			}
		},

		notifyListeners: function() {
			this.onValueChanged(this.getValueY());
		},

		// wrapper for getValueY
		getValue: function () {
			return this.getValueY ();
		},

		// wrapper for setValueY
		setValue: function (value) {
			this.setValueY (value);
			this.notifyListeners();
		},

		// snap value
		coercePosition: function() {
			this.setValue(this.getValue());
		},

		onValueChanged: function(value){
		}
	}
);


/* ------------------------------------------------------------------------- */


/**
 * This class extends the HtmlDragMoveSource class to provide
 * features for the slider handle.
 */
dojo.declare (
	"dojo.widget.html.SliderDragMoveSource",
	dojo.dnd.HtmlDragMoveSource,
{
	slider: null,


	/** Setup the handle for drag
	 *  Extends dojo.dnd.HtmlDragMoveSource by creating a SliderDragMoveSource */
	onDragStart: function (e) {
		this.slider.isDragInProgress = true;
		this.constrainToContainer = true;

		var dragObj = this.createDragMoveObject ();
		var constraints = null;


		dojo.event.connect (dragObj, "onDragMove", this, "onDragMove");

		return dragObj;
	},

	onDragEnd: function (e) {
		this.slider.isDragInProgress = false;
	},

	onDragMove: function (e) {
		// placeholder to enable event connection
	},

	createDragMoveObject: function () {
		//dojo.debug ("SliderDragMoveSource#createDragMoveObject - " + this.slider);
		var dragObj = new dojo.widget.html.SliderDragMoveObject (this.dragObject, this.type);
		dragObj.slider = this.slider;

		// this code copied from dojo.dnd.HtmlDragSource#onDragStart
		if (this.dragClass) { 
			dragObj.dragClass = this.dragClass; 
		}
		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer || this.domNode.parentNode);
		}
		return dragObj;
	},


	setParent: function (slider) {
		this.slider = slider;
	},

	
	_getConstraints: function () {
		var dragObj = this.createDragMoveObject ();
		dragObj.containingBlockPosition = dragObj.domNode.offsetParent ? 
		dojo.style.getAbsolutePosition(dragObj.domNode.offsetParent) : {x:0, y:0};
		return dragObj.getConstraints ();
	},


	calc_valueSizeX: function () {
		var constraints = this._getConstraints ();
		this.slider._constraintWidth = constraints.maxX - constraints.minX;
		if (this.slider._constraintWidth <= 0) { return false; }
		if (this.slider.snapValuesX == 0) {
			this.slider.snapValuesX = this.slider._constraintWidth + 1;
		}
		this.slider._valueSizeX = this.slider._constraintWidth / (this.slider.snapValuesX - 1);
		return true;
	},

	
	calc_valueSizeY: function () {
		var constraints = this._getConstraints ();
		this.slider._constraintHeight = constraints.maxY - constraints.minY;
		if (this.slider._constraintHeight <= 0) { return false; }
		if (this.slider.snapValuesY == 0) {
			this.slider.snapValuesY = this.slider._constraintHeight + 1;
		}
		this.slider._valueSizeY = this.slider._constraintHeight / (this.slider.snapValuesY - 1);
		return true;
	}
});


/* ------------------------------------------------------------------------- */


/**
 * This class extends the HtmlDragMoveObject class to provide
 * features for the slider handle.
 */
dojo.declare (
	"dojo.widget.html.SliderDragMoveObject",
	dojo.dnd.HtmlDragMoveObject,
{
	// reference to dojo.widget.html.Slider
	slider: null,

	/** Moves the node to follow the mouse.
	 *  Extends functon HtmlDragObject by adding functionality to snap handle
	 *  to a discrete value */
	onDragMove: function (e) {
		this.updateDragOffset ();

		var x = this.dragOffset.x + e.pageX;
		var y = this.dragOffset.y + e.pageY;

		if (this.constrainToContainer) {
			if (x < this.constraints.minX) { x = this.constraints.minX; }
			if (y < this.constraints.minY) { y = this.constraints.minY; }
			if (x > this.constraints.maxX) { x = this.constraints.maxX; }
			if (y > this.constraints.maxY) { y = this.constraints.maxY; }
		}

		if (this.slider.isEnableX) {
			var selectedValue = 0;
			if (x > 0) {
				selectedValue = Math.round (x / this.slider._valueSizeX);
			}
			// dojo.debug ("x = " + x + ", valueSize = " + valueSize 
			//             + ", selectedValue = " + selectedValue);
			x = Math.round (selectedValue * this.slider._valueSizeX);
		}

		if (this.slider.isEnableY) {
			var selectedValue = 0;
			if (y > 0) {
				selectedValue = Math.round (y / this.slider._valueSizeY);
			}
			y = Math.round (selectedValue * this.slider._valueSizeY);
		}

		this.setAbsolutePosition (x, y);
	}
});
