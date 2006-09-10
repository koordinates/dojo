dojo.provide("dojo.widget.DropdownDatePicker");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.DatePicker");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");

dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.widget", "DropdownDatePicker");

dojo.widget.defineWidget(
	"dojo.widget.DropdownDatePicker",
	dojo.widget.DropdownContainer,
	{
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/dateIcon.gif"),
		zIndex: "10",
		datePicker: null,
		
		dateFormat: "%m/%d/%Y",
		date: null,

		postMixInProperties: function(localProperties, frag) {
			dojo.widget.DropdownDatePicker.superclass.postMixInProperties.apply(this, arguments);
			var messages = dojo.i18n.getLocalization("dojo.widget", "DropdownDatePicker", this.lang);
			this.iconAlt = messages.selectDate;
		},

		fillInTemplate: function(args, frag){
			dojo.widget.DropdownDatePicker.superclass.fillInTemplate.call(this, args, frag);
			var source = this.getFragNodeRef(frag);
			
			if(args.date){ this.date = new Date(args.date); }
			
			var dpNode = document.createElement("div");
			this.containerNode.appendChild(dpNode);
			
			var dateProps = { widgetContainerId: this.widgetId };
			if(this.date){
				dateProps["date"] = this.date;
				dateProps["selectedDate"] = dojo.date.toRfc3339(this.date);
				this.inputNode.value = dojo.date.strftime(this.date, this.dateFormat);
			}
			this.datePicker = dojo.widget.createWidget("DatePicker", dateProps, dpNode);
			dojo.event.connect(this.datePicker, "onSetDate", this, "onSetDate");
			this.containerNode.style.zIndex = this.zIndex;
			this.containerNode.style.backgroundColor = "transparent";
		},
		
		onSetDate: function(){
			this.inputNode.value = dojo.date.format(this.datePicker.date, this.dateFormat);
			this.hideContainer();
		},
		
		onInputChange: function(){
			this.datePicker.date = new Date(this.inputNode.value);
			this.datePicker.setDate(this.datePicker.date);
		}
	}
);
