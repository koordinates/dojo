dojo.provide("dojo.widget.DropdownTimePicker");

dojo.require("dojo.widget.*");
dojo.require("dojo.widget.DropdownContainer");
dojo.require("dojo.widget.TimePicker");
dojo.require("dojo.event.*");
dojo.require("dojo.html.*");

dojo.require("dojo.i18n.common");
dojo.requireLocalization("dojo.widget", "DropdownTimePicker");

// summary
//	input box with a drop-down gui control, for setting the time (hours, minutes, seconds, am/pm) of an event
dojo.widget.defineWidget(
	"dojo.widget.DropdownTimePicker",
	dojo.widget.DropdownContainer,
	{
		// URL
		//	path of icon for button to display time picker widget
		iconURL: dojo.uri.dojoUri("src/widget/templates/images/timeIcon.gif"),
		
		// Number
		//	z-index of time picker widget
		zIndex: "10",

		// String
		//	format string for how time is displayed in the input box	
		timeFormat: "%R",

		// String
		//	time value in server format (which is probably different than the displayed format)
		value: "",

		postMixInProperties: function() {
			dojo.widget.DropdownTimePicker.superclass.postMixInProperties.apply(this, arguments);
			var messages = dojo.i18n.getLocalization("dojo.widget", "DropdownTimePicker", this.lang);
			this.iconAlt = messages.selectTime;
		},

		fillInTemplate: function(){
			dojo.widget.DropdownTimePicker.superclass.fillInTemplate.apply(this, arguments);

			var timeProps = { widgetContainerId: this.widgetId };
			this.timePicker = dojo.widget.createWidget("TimePicker", timeProps, this.containerNode, "child");
			dojo.event.connect(this.timePicker, "onSetTime", this, "onSetTime");
			dojo.event.connect(this.inputNode,  "onchange",  this, "onInputChange");
			this.containerNode.style.zIndex = this.zIndex;
			this.containerNode.explodeClassName = "timeBorder";
			if(this.value){
				this.timePicker.selectedTime.anyTime = false;
				this.timePicker.setDateTime("2005-01-01T" + this.value);
				this.timePicker.initData();
				this.timePicker.initUI();
				this.onSetTime();
			}
		},
		
		onSetTime: function(){
			// summary: callback when user sets the time via the TimePicker widget
			this.inputNode.value = this.timePicker.selectedTime.anyTime ? "" : dojo.date.strftime(this.timePicker.time, this.timeFormat);
			this.hideContainer();
		},
		
		onInputChange: function(){
			// summary: callback when the user has typed in a time value manually
			this.timePicker.time = "2005-01-01T" + this.inputNode.value;
			this.timePicker.setDateTime(this.timePicker.time);
			this.timePicker.initData();
			this.timePicker.initUI();
		},
		
		enable: function() {
			// summary: enable this widget to accept user input
			this.inputNode.disabled = false;
			this.timePicker.enable();
			this.inherited("enable", []);
		},
		
		disable: function() {
			// summary: lock this widget so that the user can't change the value
			this.inputNode.disabled = true;
			this.timePicker.disable();
			this.inherited("disable", []);
		}
	}
);
