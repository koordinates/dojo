dojo.provide("dojo.widget.DropdownDatePicker");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.DatePicker");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");
dojo.require("dojo.date.format");
dojo.require("dojo.date.serialize");

dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.widget", "DropdownDatePicker");

dojo.widget.defineWidget(
	"dojo.widget.DropdownDatePicker",
	dojo.widget.DropdownContainer,
	{
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/dateIcon.gif"),
		zIndex: "10",

		// pattern used in display of formatted date.  See dojo.date.format.
		displayFormat: "",
		dateFormat: "", // deprecated in 0.5
		// formatting used when submitting form.  A pattern string like display format or one of the following:
		// rfc|iso|posix|unix  By default, uses rfc3339 style date formatting.
		saveFormat: "",
		// type of format appropriate to locale.  see dojo.date.format
		formatLength: "short", // only parsing of short is supported at this time
		date: "",
		// name of the form element
		name: "",

		postMixInProperties: function(localProperties, frag) {
			dojo.widget.DropdownDatePicker.superclass.postMixInProperties.apply(this, arguments);
			var messages = dojo.i18n.getLocalization("dojo.widget", "DropdownDatePicker", this.lang);
			this.iconAlt = messages.selectDate;

			if(this.date && isNaN(this.date)){
				var orig = this.date;
				this.date = dojo.date.fromRfc3339(this.date);
				if(!this.date){this.date = new Date(orig); dojo.deprecated("dojo.widget.DropdownDatePicker", "date attributes must be passed in Rfc3339 format", "0.5");}
			}
			if(this.date && !isNaN(this.date)){
				this.date = new Date(this.date);
			}
		},

		fillInTemplate: function(args, frag){
			dojo.widget.DropdownDatePicker.superclass.fillInTemplate.call(this, args, frag);

			var dpNode = document.createElement("div");
			this.containerNode.appendChild(dpNode);

			var dateProps = { widgetContainerId: this.widgetId };
			if(this.date){
				dateProps.date = this.date;
			}
			this.datePicker = dojo.widget.createWidget("DatePicker", dateProps, dpNode);
			dojo.event.connect(this.datePicker, "onSetDate", this, "onSetDate");
			if(this.date){
				this.onSetDate();
			}
			this.containerNode.style.zIndex = this.zIndex;
			this.containerNode.style.backgroundColor = "transparent";
			this.valueNode.name=this.name;
		},

		onSetDate: function(){
			if(this.dateFormat){
				dojo.deprecated("dojo.widget.DropdownDatePicker",
				"Must use displayFormat attribute instead of dateFormat.  See dojo.date.format for specification.", "0.5");
				this.inputNode.value = dojo.date.strftime(this.datePicker.date, this.dateFormat, this.lang);
			}else{
				this.inputNode.value = dojo.date.format(this.datePicker.date,
					{formatLength:this.formatLength, datePattern:this.displayFormat, selector:'dateOnly', locale:this.lang});
			}
			this._synchValueNode();
			this.hideContainer();
		},

		onInputChange: function(){
			if(this.dateFormat){
				dojo.deprecated("dojo.widget.DropdownDatePicker",
				"Cannot parse user input.  Must use displayFormat attribute instead of dateFormat.  See dojo.date.format for specification.", "0.5");
			}else{
				var inputDate = dojo.date.parse(this.inputNode.value,
						{formatLength:this.formatLength, datePattern:this.displayFormat, selector:'dateOnly', locale:this.lang});			
				if(inputDate){
					this.datePicker.setDate(inputDate);
					this._synchValueNode();
				}
			}
			// If the date entered didn't parse, reset to the old date.  KISS, for now.
			//TODO: usability?  should we provide more feedback somehow? an error notice?
			// seems redundant to do this if the parse failed, but at least until we have validation,
			// this will fix up the display of entries like 01/32/2006
			this.onSetDate();
		},

		_synchValueNode: function(){
			var date = this.datePicker.date;
			var value;
			switch(this.saveFormat.toLowerCase()){
				case "rfc": case "iso": case "":
					value = dojo.date.toRfc3339(date, 'dateOnly');
					break;
				case "posix": case "unix":
					value = Number(date);
					break;
				default:
					value = dojo.date.format(date, {datePattern:this.saveFormat, selector:'dateOnly', locale:this.lang});
			}
			this.valueNode.value = value;
		},
		
		enable: function() {
			this.inputNode.disabled = false;
			this.datePicker.enable();
			this.inherited("enable", []);
		},
		
		disable: function() {
			this.inputNode.disabled = true;
			this.datePicker.disable();
			this.inherited("disable", []);
		}
	}
);
