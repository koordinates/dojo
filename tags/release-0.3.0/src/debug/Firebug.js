dojo.provide("dojo.debug.Firebug");

dojo.debug.firebug = function(){}
dojo.debug.firebug.printfire = function () {
	printfire=function(){}
	printfire.args = arguments;
	var ev = document.createEvent("Events");
	ev.initEvent("printfire", false, true);
	dispatchEvent(ev);
}

if (dojo.render.html.moz) {
	dojo.hostenv.println=dojo.debug.firebug.printfire;
}
