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
	isOnline: false,
	
	// requireDurableCache: boolean
	//	A durable cache is a cache that can correctly and
	//	truely cache the UI resources of an application for
	//	offline use, such as its HTML, JavaScript, etc. A
	//	durable cache won't remove these files from it's
	//	offline cache, for example. No browser's currently
	//	support native durable cache's; FireFox 3 has plans
	//	for one. If true, then we require a durable cache,
	//	and must either install one or have one natively
	//	supported by this browser; if false, then we will
	//	rely on the browser's ordinary cache, which can be
	//	made to work but is not always reliable. Defaults to
	//	true.
	requireDurableCache: true,
	
	hasDurableCache: function(){ /* boolean */
		// summary: 
		//	Returns whether we have a durable cache available
		// description:
		//	Determines if a durable cache is available or installed;
		//	a durable cache is a facility that can truely cache offline
		//	resource, such as JavaScript, HTML, etc. in such a way that
		//	they won't be removed from the cache inappropriately like
		//	a browser cache would. If this is false, and 
		//	dojo.dot.requireDurableCache is true, then a durable cache
		//	will be installed
	
		// FIXME: Implement
		return true;
	}
});