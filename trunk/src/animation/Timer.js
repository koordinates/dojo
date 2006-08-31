dojo.provide("dojo.animation.Timer");

dojo.deprecated("dojo.animation.Timer is now dojo.lang.timing.Timer", "0.5");
dojo.require("dojo.lang.timing.Timer");

dojo.animation.Timer = function(/* int */interval){
	dojo.lang.timing.Timer.call(this, interval);
};
