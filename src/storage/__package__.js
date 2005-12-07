dojo.hostenv.conditionalLoadModule({
	common: ["dojo.storage"],
	browser: ["dojo.storage.browser"],
	rhino: ["dojo.storage.rhino"],
});
dojo.hostenv.moduleLoaded("dojo.storage.*");

