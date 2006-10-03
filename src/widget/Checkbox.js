dojo.provide("dojo.widget.Checkbox");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.html.style");
dojo.require("dojo.html.selection");

// summary
//	Same as an HTML checkbox, but with fancy styling
dojo.widget.defineWidget(
	"dojo.widget.Checkbox",
	dojo.widget.HtmlWidget,
	{
		templatePath: dojo.uri.dojoUri('src/widget/templates/Checkbox.html'),
		templateCssPath: dojo.uri.dojoUri('src/widget/templates/Checkbox.css'),

		// Boolean
		//	if true, clicking will not change the state of the checkbox.
		//	in markup, this is specified as "disabled='disabled'", or just "disabled", 
		disabled: "enabled",
		
		// String
		//	name used when submitting form; same as "name" attribute or plain HTML elements
		name: "",

		// String
		//	id attached to the checkbox, used when submitting form
		id: "",

		// Boolean
		//	if true, checkbox is initially marked turned on;
		//	in markup, specified as "checked='checked'" or just "checked"
		checked: "",
		
		// Integer
		//	order fields are traversed when user hits the tab key
		tabIndex: "",

		postMixInProperties: function(){
			dojo.widget.Checkbox.superclass.postMixInProperties.apply(this, arguments);
			// set the variables referenced by the template
			// valid HTML 4.01 and XHTML use disabled="disabled" - convert to boolean
			//NOTE: this doesn't catch disabled with no value if FF
			this.disabled = (this.disabled == "disabled" || this.disabled == true);
			// valid HTML 4.01 and XHTML require checked="checked"
			// convert to boolean NOTE: this doesn't catch checked with no value in FF
			this.checked = (this.checked == "checked" || this.checked == true);

			// output valid checked and disabled attributes
			this.disabledStr = this.disabled ? "disabled=\"disabled\"" : "";
			this.checkedStr = this.checked ? "checked=\"checked\"" : "";

			// set tabIndex="0" because if tabIndex=="" user won't be able to tab to the field


			if(!this.disabled && this.tabIndex==""){ this.tabIndex="0"; }
		},

		postCreate: function(){
			// find any associated label and create a labelled-by relationship
			// assumes <label for="inputId">label text </label> rather than
			// <label><input type="xyzzy">label text</label>
			var notcon = true;
			this.id = this.id !="" ? this.id : this.widgetId;
			if(this.id != ""){
				var labels = document.getElementsByTagName("label");
				if (labels != null && labels.length > 0){
					for(var i=0; i<labels.length; i++){
						if (labels[i].htmlFor == this.id){
							labels[i].id = (labels[i].htmlFor + "label");
							this._connectEvents(labels[i]);
							dojo.widget.wai.setAttr(this.domNode, "waiState", "labelledby", labels[i].id);
							break;
						}
					}
				}
			}
			this._connectEvents(this.domNode);
		},

		_connectEvents: function(/*DomNode*/ node){
			dojo.event.connect(node, "onmouseover", this, "mouseOver");
			dojo.event.connect(node, "onmouseout", this, "mouseOut");
			dojo.event.connect(node, "onkey", this, "onKey");
			dojo.event.connect(node, "onclick", this, "_onClick");
			dojo.html.disableSelection(node);
		},

		fillInTemplate: function(){
			this._setInfo();
		},

		_onClick: function(/*Event*/ e){
			if(this.disabled == false){
				this.checked = !this.checked;
				this._setInfo();
			}
			e.preventDefault();
			e.stopPropagation();
			this.onClick();
		},

		onClick: function(){
			// summary: user overridable callback function for checkbox being clicked
		},

		onKey: function(/*Event*/ e){
			// summary: callback when user hits a key
			var k = dojo.event.browser.keys;
			if(e.key == " "){
	 			this._onClick(e);
	 		}
		},

		mouseOver: function(/*Event*/ e){
			// summary: callback when user moves mouse over checkbox
			this._hover(e, true);
		},

		mouseOut: function(/*Event*/ e){
			// summary: callback when user moves mouse off of checkbox
			this._hover(e, false);
		},

		_hover: function(/*Event*/ e, /*Boolean*/ isOver){
			if (this.disabled == false){
				var state = this.checked ? "On" : "Off";
				var style = "dojoHtmlCheckbox" + state + "Hover";
				if (isOver){
					dojo.html.addClass(this.imageNode, style);
				}else{
					dojo.html.removeClass(this.imageNode,style);
				}
			}
		},

		_setInfo: function(){
			// summary: set CSS class string according to checked/unchecked and disabled/enabled state
			var state = "dojoHtmlCheckbox" + (this.disabled ? "Disabled" : "") + (this.checked ? "On" : "Off");
			dojo.html.setClass(this.imageNode, "dojoHtmlCheckbox " + state);
			this.inputNode.checked = this.checked;
			dojo.widget.wai.setAttr(this.domNode, "waiState", "checked", this.checked);
		}
	}
);

// summary
//	variation on Checkbox widget to be display on monitors in high-contrast mode (that don't display CSS background images)
dojo.widget.defineWidget(
	"dojo.widget.a11y.Checkbox",
	dojo.widget.Checkbox,
	{
		templatePath: dojo.uri.dojoUri('src/widget/templates/CheckboxA11y.html'),

		postCreate: function(args, frag){
			// nothing to do but don't want Checkbox version to run
		},

		fillInTemplate: function(){
		},

		_onClick: function(){
			this.onClick();
		}
	}
);