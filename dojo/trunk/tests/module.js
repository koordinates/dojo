dojo.provide("dojo.tests.module");

try{
	dojo.require("tests._base");
	dojo.require("tests.i18n"); 
	dojo.require("tests.cldr");
	dojo.require("tests.data");
	dojo.require("tests.date");
	dojo.require("tests.number");
	dojo.require("tests.currency");
	dojo.require("tests.AdapterRegistry");
	dojo.require("tests.io.script");
}catch(e){
	doh.debug(e);
}


