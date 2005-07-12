dojo.hostenv.conditionalLoadModule({
	common: ["dojo.event.Event", "dojo.event.Topic"],
	browser: ["dojo.event.BrowserEvent"]
});
dojo.hostenv.moduleLoaded("dojo.event.*");
