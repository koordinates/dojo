dojo.provide("dojo.debug.Firebug");

if (console.log) {
	dojo.hostenv.println=console.log;
} else {
	dojo.debug("dojo.debug.Firebug requires Firebug > 0.4");
}
