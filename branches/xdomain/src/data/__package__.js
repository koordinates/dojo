dojo.require("dojo.experimental");

dojo.experimental("dojo.data.*");
dojo.hostenv.conditionalLoadModule({
	common: [
		"dojo.data.Item",
		"dojo.data.ResultSet",
		"dojo.data.provider.FlatFile"
	]
});
dojo.hostenv.moduleLoaded("dojo.data.*");

