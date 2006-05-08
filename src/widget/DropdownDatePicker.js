dojo.provide("dojo.widget.DropdownDatePicker");
dojo.require("dojo.widget.*");
dojo.require("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.DatePicker");
dojo.require("dojo.event.*");
dojo.require("dojo.html");

dojo.widget.defineWidget(
	"dojo.widget.DropdownDatePicker",
	dojo.widget.DropdownContainer,
	{
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/dateIcon.gif"),
		iconAlt: "Select a Date",
		iconTitle: "Select a Date",
		
		datePicker: null,
		
		dateFormat: "%m/%d/%Y",
		
		fillInTemplate: function(args, frag){
			dojo.widget.DropdownDatePicker.superclass.fillInTemplate.call(this, args, frag);
			var source = this.getFragNodeRef(frag);
			
			if(args.dateFormat){ this.dateFormat = args.dateFormat; }
			
			var dpNode = document.createElement("div");
			this.containerNode.appendChild(dpNode);
			
			this.datePicker = dojo.widget.createWidget("DatePicker", { widgetContainerId: this.widgetId }, dpNode);
			dojo.event.connect(this.datePicker, "onSetDate", this, "onPopulate");
		},
		
		onPopulate: function(){
			this.inputNode.value = dojo.date.format(this.datePicker.date, this.dateFormat);
			this.onHide();
		},
		
		onInputChange: function(){
			var tmp = new Date(this.inputNode.value);
			this.datePicker.date = tmp;
			this.datePicker.setDate(dojo.widget.DatePicker.util.toRfcDate(tmp));
			this.datePicker.initData();
			this.datePicker.initUI();
		}
	},
	"html"
);

dojo.widget.tags.addParseTreeHandler("dojo:dropdowndatepicker");