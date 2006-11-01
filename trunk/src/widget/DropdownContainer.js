dojo.provide("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.PopupContainer");
dojo.require("dojo.event.*");
dojo.require("dojo.html.layout");
dojo.require("dojo.html.display");
dojo.require("dojo.html.iframe");
dojo.require("dojo.html.util");

// summary:
//		provides an input box and a button for a dropdown.
//		In subclass, the dropdown can be specified.
dojo.widget.defineWidget(
	"dojo.widget.DropdownContainer",
	dojo.widget.HtmlWidget,
	{
		// String: width of the input box
		inputWidth: "7em",

		// String: id of this widget
		id: "",

		// String: id of the input box
		inputId: "",

		// String: name of the input box
		inputName: "",

		// dojo.uri.Uri: icon for the dropdown button
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/combo_box_arrow.png"),

		// dojo.uri.Uri: alt text for the dropdown button icon
		iconAlt: "",

		// String: toggle property of the dropdown
		containerToggle: "plain",

		// Integer: toggle duration property of the dropdown
		containerToggleDuration: 150,

		templateString: '<span style="white-space:nowrap"><input type="hidden" name="" value="" dojoAttachPoint="valueNode" /><input name="" type="text" value="" style="vertical-align:middle;" dojoAttachPoint="inputNode" autocomplete="off" /> <img src="${this.iconURL}" alt="${this.iconAlt}" dojoAttachEvent="onclick:onIconClick" dojoAttachPoint="buttonNode" style="vertical-align:middle; cursor:pointer; cursor:hand" /></span>',
		templateCssPath: "",
		isContainer: true,

		attachTemplateNodes: function(){
			// summary: use attachTemplateNodes to specify containerNode, as fillInTemplate is too late for this
			dojo.widget.DropdownContainer.superclass.attachTemplateNodes.apply(this, arguments);
			this.popup = dojo.widget.createWidget("PopupContainer", {toggle: this.containerToggle, toggleDuration: this.containerToggleDuration});
			this.containerNode = this.popup.domNode;
		},

		fillInTemplate: function(){
			this.domNode.appendChild(this.popup.domNode);
			if(this.id) { this.domNode.id = this.id; }
			if(this.inputId){ this.inputNode.id = this.inputId; }
			if(this.inputName){ this.inputNode.name = this.inputName; }
			this.inputNode.style.width = this.inputWidth;
			this.inputNode.disabled = this.disabled;

			dojo.event.connect(this.inputNode, "onchange", this, "onInputChange");
		},

		onIconClick: function(/*Event*/ evt){
			if(this.disabled) return;
			if(!this.popup.isShowingNow){
				this.popup.open(this.inputNode, this, this.buttonNode);
			}else{
				this.popup.close();
			}
		},

		hideContainer: function(){
			// summary: hide the dropdown
			if(this.popup.isShowingNow){
				this.popup.close();
			}
		},

		onInputChange: function(){
			// summary: signal for changes in the input box
		},
		
		enable: function() {
			// summary: enable this widget to accept user input
			this.inputNode.disabled = false;
			dojo.widget.DropdownContainer.superclass.enable.apply(this, arguments);
		},
		
		disable: function() {
			// summary: lock this widget so that the user can't change the value
			this.inputNode.disabled = true;
			dojo.widget.DropdownContainer.superclass.disable.apply(this, arguments);
		}
	}
);
