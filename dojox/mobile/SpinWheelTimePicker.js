define(["dojo/_base/html", "dojo/date","dojo/date/locale","./SpinWheel","./SpinWheelSlot"],function(dhtml,ddate,dlocale,SpinWheel,SpinWheelSlot){
	// module:
	//		dojox/mobile/SpinWheelTimePicker
	// summary:
	//		TODOC

	return dojo.declare("dojox.mobile.SpinWheelTimePicker", dojox.mobile.SpinWheel, {
		slotClasses: [
			SpinWheelSlot,
			SpinWheelSlot
		],
		slotProps: [
			{labelFrom:0, labelTo:23},
			{labels:["00","01","02","03","04","05","06","07","08","09",
					 "10","11","12","13","14","15","16","17","18","19",
					 "20","21","22","23","24","25","26","27","28","29",
					 "30","31","32","33","34","35","36","37","38","39",
					 "40","41","42","43","44","45","46","47","48","49",
					 "50","51","52","53","54","55","56","57","58","59"]}
		],

		buildRendering: function(){
			this.inherited(arguments);
			dojo.addClass(this.domNode, "mblSpinWheelTimePicker");
		},

		reset: function(){
			// goto now
			var slots = this.slots;
			var now = new Date();
			slots[0].setValue(now.getHours());
			slots[0].setColor(now.getHours());
			slots[1].setValue(now.getMinutes());
			slots[1].setColor(now.getMinutes());
		}
	});
});
