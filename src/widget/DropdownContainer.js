dojo.provide("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.widget.Menu2");
dojo.require("dojo.event.*");
dojo.require("dojo.html");

dojo.widget.defineWidget(
	"dojo.widget.DropdownContainer",
	dojo.widget.HtmlWidget,
	{
		initializer: function(){
		},

		inputWidth: "7em",
		inputId: "",
		inputName: "",
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/combo_box_arrow.png"),
		iconAlt: "",

		inputNode: null,
		buttonNode: null,
		containerNode: null,
		subWidgetNode: null,

		containerToggle: "plain",
		containerToggleDuration: 150,
		containerAnimInProgress: false,

		templateString: '<span style="white-space:nowrap"><input type="text" value="" style="vertical-align:middle;" dojoAttachPoint="inputNode" autocomplete="off" /> <img src="${this.iconURL}" alt="${this.iconAlt}" dojoAttachEvent="onclick: onIconClick;" dojoAttachPoint="buttonNode" style="vertical-align:middle; cursor:pointer; cursor:hand;" /></span>',
		templateCssPath: "",

		fillInTemplate: function(args, frag){
			var source = this.getFragNodeRef(frag);
			
			this.popup = dojo.widget.createWidget("PopupMenu2", {templateString: '<div dojoAttachPoint="containerNode" class="dojoPopupMenu2" style="display:none;" tabindex="-1"></div>', toggle: "fade"});
			
			this.containerNode = this.popup.domNode;
			
			this.domNode.appendChild(this.popup.domNode);

			if(this.inputId){ this.inputNode.id = this.inputId; }
			if(this.inputName){ this.inputNode.name = this.inputName; }
			this.inputNode.style.width = this.inputWidth;

			dojo.event.connect(this.inputNode, "onchange", this, "onInputChange");
		},

		onIconClick: function(evt){
			if(!this.popup.isShowingNow){
				this.popup.open(this.buttonNode, this);
			}else{
				this.popup.close();
			}
		},

		onInputChange: function(){}
	},
	"html"
);

dojo.widget.tags.addParseTreeHandler("dojo:dropdowncontainer");
