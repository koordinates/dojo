dojo.provide("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.HtmlWidget");
dojo.require("dojo.event.*");
dojo.require("dojo.html");
dojo.require("dojo.Firebug");

dojo.widget.defineWidget(
	"dojo.widget.DropdownContainer",
	dojo.widget.HtmlWidget,
	{
		initializer: function(){
		},

		isContainer: true,
		snarfChildDomOutput: true,
		
		inputWidth: "7em",
		inputName: "",
		iconURL: null,
		iconAlt: null,

		inputNode: null,
		buttonNode: null,
		containerNode: null,
		subWidgetNode: null,

		templateString: '<div><input type="text" value="" style="vertical-align:middle;" dojoAttachPoint="inputNode" /> <img src="" alt="" dojoAttachPoint="buttonNode" dojoAttachEvent="onclick: onDropdown;" style="vertical-align:middle; cursor:pointer; cursor:hand;" /><div dojoAttachPoint="containerNode" style="display:none;position:absolute;width:12em;background-color:#fff;"></div></div>',
		templateCssPath: "",

		fillInTemplate: function(args, frag){
			var source = this.getFragNodeRef(frag);

			if(args.inputName){ this.inputName = args.inputName; }
			if(args.iconURL){ this.iconURL = args.iconURL; }
			if(args.iconAlt){ this.iconAlt = args.iconAlt; }

			this.containerNode.style.left = "";
			this.containerNode.style.top = "";

			this.inputNode.name = this.inputName;
			this.inputNode.style.width = this.inputWidth;

			if(this.iconURL){ this.buttonNode.src = this.iconURL; }
			if(this.iconAlt){ this.buttonNode.alt = this.iconAlt; }

			dojo.event.connect(this.valueInputNode, "onkeyup", this, "onInputChange");
		},

		onDropdown: function(evt){
			this.toggleContainerShow();
		},

		toggleContainerShow: function(){
			dojo.html.toggleShowing(this.containerNode);
		},
		
		onHide: function(evt){
			dojo.html.hide(this.containerNode);
		},

		onInputChange: function(){}
	},
	"html"
);

dojo.widget.tags.addParseTreeHandler("dojo:dropdowncontainer");
