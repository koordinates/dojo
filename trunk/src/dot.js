dojo.provide("dojo.dot");

dojo.lang.mixin(dojo.dot, {
	// isOnline: boolean
	//	true if we are online, false if not;
	//	note that this does not check the status
	//	of the network. It is either set manually
	//	when a user goes on or offline through calls
	//	to dojo.dot.goOnline() and dojo.dot.goOffline(),
	//	or it was set the last time we called
	//	dojo.dot.isSiteAvailable()
	isOnline: false
});