dojo.provide("dojo.logging.Firebug");

function printfire()
{
    if (document.createEvent)
    {
        printfire.args = arguments;
        var ev = document.createEvent("Events");
        ev.initEvent("printfire", false, true);
        dispatchEvent(ev);
    }
}

if (dojo.render.html.moz) {
	dojo.hostenv.println=printfire;
}
