// can't set djConfig.extraLocale before bootstrapping unit tests, so directly load resources here for specific locales:

//TODO: move all extra locale references out into separate test file
var partLocaleList = (["en-us", "en-ca"]);

/**
 * Load all the required locales
 */
for(var i = 0 ; i < partLocaleList.length; i ++){
	dojo.requireLocalization("dojo.i18n.cldr","currency",partLocaleList[i]);
}

dojo.require("dojo.currency");

/**
 * Previous version
 */
function test_currency_format(){
	jum.assertEquals("cur_0_0", "$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-us"}));
	jum.assertEquals("cur_0_1", "US$123.45", dojo.currency.format(123.45, {currency: "USD", locale: "en-ca"}));
	jum.assertEquals("cur_0_2", "$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-ca"}));
	jum.assertEquals("cur_0_3", "Can$123.45", dojo.currency.format(123.45, {currency: "CAD", locale: "en-us"}));
	jum.assertEquals("cur_0_4", "ADP123", dojo.currency.format(123, {currency: "ADP", locale: "en-us"}));
}

/**
 * Previous version
 */
function test_currency_parse(){
	jum.assertEquals("cur_1_0", 123.45, dojo.currency.parse("$123.45", {currency: "USD", locale: "en-us"}));
}

