dojo.debug('MyNS Package loading');

dojo.hostenv.conditionalLoadModule({
	common: ["myns.myns"]
});

dojo.hostenv.moduleLoaded("myns.*");