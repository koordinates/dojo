dojo.provide("dojo.profile.ProfileHelper");

dojo.require("dojo.lang.*");
dojo.require("dojo.profile");

/* interface you can mix in to your class for convenient profiling functions */
dojo.profile.ProfileHelper = {
	// summary
	//	Mix-in to add profiling help to another class.
	// description
	//	For an instance, install as:
	//		dojo.lang.mixin(yourObject, dojo.profile.ProfileHelper);
	//	For a class, install as:
	//		dojo.lang.extend(constructor, dojo.profile.ProfileHelper);
	//
	//	In your class's methods, call
	//		this.startProfile("name")
	//		...
	//		this.endProfile("name");
	//	
	//	Set yourObject._profile  to false to skip all profiling
	//	Set yourObject._autoDebugProfile to true to write profile information on debug log on endProfile()
	//
									//  note: you must set these AFTER mixing in the ProfileHelper

	_profile : true,				// if true, we do profiling in this class
	_autoDebugProfile : true,		// if true, we output debug information when profiling finishes
	_profileMinTime : 1,			// if > 0, we only output if debug total time is > minTime
	
	startProfile : function(name) {
		if (!this._profile) return;
		dojo.profile.start(name);
	},
	
	endProfile : function(name, debug, clear) {
		if (!this._profile) return;
		dojo.profile.end(name);
		if (debug || this._autoDebugProfile) {
			if (dojo.profile.getItemTotal(name) > this._profileMinTime) {
				dojo.profile.debugItem(name);
			}
		}
		if (clear) dojo.profile.clearItem(name);
	},
	clearProfile : function(name) {
		if (!this._profile) return;
		dojo.profile.clearItem(name);
	}
}