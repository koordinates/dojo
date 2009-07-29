dojo.provide("dojox.form.DateTextBox");

dojo.required("dojox.widget.Calendar");
dojo.required("dojox.widget.CalendarViews");
dojo.required("dijit.form._DateTimeTextBox");

dojo.declare(
	"dojox.form.DateTextBox",
	dijit.form._DateTimeTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar

		// popupClass: String
		//  The popup widget to use. In this case, a calendar with Day, Month and Year views.
		popupClass: "dojox.widget.Calendar",
		_selector: "date",
		
		_open: function(){
			this.inherited(arguments);
			dojo.style(this._picker.domNode.parentNode, "position", "absolute");
		}
	}
);

dojo.declare(
	"dojox.form.DayTextBox",
	dojox.form.DateTextBox,
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains just months.
		
		// popupClass: String
		//  The popup widget to use. In this case, a calendar with just a Month view.
		popupClass: "dojox.widget.DailyCalendar",
		
		format: function(value){return value.getDate();},
		validator: function(value) {

			// NOTE: What types are allowed for value?
			//       Consolidate in one function

			var num;

			if (typeof value == 'number') {
				num = value;
			} else if (typeof value == 'string') { // Allow empty string
				if (!value) {
					return true;
				}
				num = Number(value);
			} else {
				return true; // Allow null and undefined
			}

			return num >= 1 && num <= 31 && Math.floor(num) == num; // Integers only
		},		
		_open: function(){
			this.inherited(arguments);
			
			this._picker.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				window.setTimeout(dojo.hitch(this, "_close"), 1); // allow focus time to take
				dijit.form.TextBox.prototype._setValueAttr.call(this, value, true, String(value.getDate()));
			});			
		}
	}
);

dojo.declare(
	"dojox.form.MonthTextBox",
	dojox.form.DateTextBox, 
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains just months.
		
		// popupClass: String
		//  The popup widget to use. In this case, a calendar with just a Month view.
		popupClass: "dojox.widget.MonthlyCalendar",

		format: function(value){return value + 1;},

		validator: function(value) {

			// NOTE: What types are allowed for value?

			var num;

			if (typeof value == 'number') {
				num = value;
			} else if (typeof value == 'string') { // Allow empty string
				if (!value) {
					return true;
				}
				num = Number(value);
			} else {
				return true; // Allow null and undefined
			}

			return num >= 1 && num <= 12 && Math.floor(num) == num; // Integers only

		},
		_open: function(){
			this.inherited(arguments);
			
			this._picker.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				window.setTimeout(dojo.hitch(this, "_close"), 1); // allow focus time to take
				dijit.form.TextBox.prototype._setValueAttr.call(this,value + 1, true, value + 1);
			});			
		}
	}
);

dojo.declare(
	"dojox.form.YearTextBox",
	dojox.form.DateTextBox, 
	{
		// summary:
		//		A validating, serializable, range-bound date text box with a popup calendar that contains only years
		
		// popupClass: String
		//  The popup widget to use. In this case, a calendar with just a Year view.
		popupClass: "dojox.widget.YearlyCalendar",
		format: function(value){return value;},
		validator: function(value) {

			// NOTE: What types are allowed for value?

			var num;

			if (typeof value == 'number') {
				num = value;
			} else if (typeof value == 'string') { // Allow empty string
				if (!value) {
					return true;
				}
				num = Number(value);
			} else {
				return true; // Allow null and undefined
			}

			return num >= 0 && Math.floor(num) == num; // Integers only
		},
		
		_open: function(){
			this.inherited(arguments);
			
			this._picker.onValueSelected = dojo.hitch(this, function(value){
				this.focus(); // focus the textbox before the popup closes to avoid reopening the popup
				window.setTimeout(dojo.hitch(this, "_close"), 1); // allow focus time to take
				dijit.form.TextBox.prototype._setValueAttr.call(this,value, true, value);
			});						
		}
	}
);
