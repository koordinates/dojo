dojo.provide("testlocal.thingyi18n");
dojo.require("dojo.i18n.common");

dojo.requireLocalization("testlocal", "thingyBundle");

testlocal.thingyi18n = {
	messageText: dojo.i18n.getLocalization("testlocal", "thingyBundle").messageText,
	
	message: function(){
		return this.messageText;
	}
}
