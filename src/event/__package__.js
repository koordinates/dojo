dojo.hostenv.conditionalLoadModule({
	common: ["dojo.event", "dojo.event.topic"],
	browser: ["dojo.event.BrowserEvent"]
});
dojo.hostenv.moduleLoaded("dojo.event.*");
