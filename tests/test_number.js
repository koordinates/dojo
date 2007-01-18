// can't set djConfig.extraLocale before bootstrapping unit tests, so manually load resources here for specific locales:
dojo.requireLocalization("dojo.i18n.cldr","number","en-us");
dojo.requireLocalization("dojo.i18n.cldr","number","en-in");
dojo.requireLocalization("dojo.i18n.cldr","number","fr-fr");

dojo.require("dojo.number");

function test_number_format() {
	jum.assertEquals("num_0_0", "0123", dojo.number.format(123, {pattern: "0000"}));
	jum.assertEquals("num_0_1", "-12,34,567.890", dojo.number.format(-1234567.89, {pattern: "#,##,##0.000##"}));
	jum.assertEquals("num_0_2", "-12,34,567.89012", dojo.number.format(-1234567.890123, {pattern: "#,##,##0.000##"}));
	jum.assertEquals("num_0_3", "(1,234,567.89012)", dojo.number.format(-1234567.890123, {pattern: "#,##0.000##;(#,##0.000##)"}));
	jum.assertEquals("num_0_4", "(1,234,567.89012)", dojo.number.format(-1234567.890123, {pattern: "#,##0.000##;(#)"}));
	jum.assertEquals("num_0_5", "50.1%", dojo.number.format(0.501, {pattern: "#0.#%"}));
	jum.assertEquals("num_0_6", "98", dojo.number.format(1998, {pattern: "00"}));

	jum.assertEquals("num_1_0", "-12", dojo.number.format(-12.3, {places:0, locale: "en-us"}));
	jum.assertEquals("num_1_1", "-1,234,567.89", dojo.number.format(-1234567.89, {locale: "en-us"}));
	jum.assertEquals("num_1_2", "-12,34,567.89", dojo.number.format(-1234567.89, {locale: "en-in"}));
	jum.assertEquals("num_1_3", "-1,234,567", dojo.number.format(-1234567.89, {places:0, locale: "en-us"}));
	jum.assertEquals("num_1_4", "-12,34,567", dojo.number.format(-1234567.89, {places:0, locale: "en-in"}));
	jum.assertEquals("num_1_5", "-1\xa0000,10", dojo.number.format(-1000.1, {places:2, locale: "fr-fr"}));
	jum.assertEquals("num_1_6", "-1,000.10", dojo.number.format(-1000.1, {places:2, locale: "en-us"}));

	jum.assertEquals("num_1_7", "-1\xa0000,10", dojo.number.format(-1000.1, {places:2, locale: "fr-fr"}));
	jum.assertEquals("num_1_8", "-1,000.10", dojo.number.format(-1000.1, {places:2, locale: "en-us"}));
	jum.assertEquals("num_1_9", "123.45%", dojo.number.format(1.23456, {places:2, locale: "en-us", type: "percent"}));

	//rounding
//	jum.assertEquals("num_2_1", "-1,234,568", dojo.number.format(-1234567.89, {places:0, locale: "en-us"}));
//	jum.assertEquals("num_2_2", "-12,34,568", dojo.number.format(-1234567.89, {places:0, locale: "en-in"}));
//	jum.assertEquals("num_2_3", "-1,000.11", dojo.number.format(-1000.114, {places:2, round: true, locale: "en-us"}));
//	jum.assertEquals("num_2_4", "-1,000.12", dojo.number.format(-1000.115, {places:2, round: true, locale: "en-us"}));
//	jum.assertEquals("num_2_5", "-0.00", dojo.number.format(-0.0001, {places:2, round: true, locale: "en-us"}));
//	jum.assertEquals("num_2_6", "0.00", dojo.number.format(0, {places:2, round: true, locale: "en-us"}));

	//change decimal places
	jum.assertEquals("num_2_7", "-1\xa0000,100", dojo.number.format(-1000.1, {places:3, locale: "fr-fr"}));
	jum.assertEquals("num_2_8", "-1,000.100", dojo.number.format(-1000.1, {places:3, locale: "en-us"}));
}

function test_number_parse() {
	jum.assertEquals("num_3_0", 1000, dojo.number.parse("1000", {locale: "en-us"}));
	jum.assertEquals("num_3_1", 1000.123, dojo.number.parse("1000.123", {locale: "en-us"}));
	jum.assertEquals("num_3_2", 1000, dojo.number.parse("1,000", {locale: "en-us"}));
	jum.assertEquals("num_3_3", -1000, dojo.number.parse("-1000", {locale: "en-us"}));
	jum.assertEquals("num_3_4", -1000.123, dojo.number.parse("-1000.123", {locale: "en-us"}));
	jum.assertEquals("num_3_5", -1234567.89, dojo.number.parse("-1,234,567.89", {locale: "en-us"}));
	jum.assertEquals("num_3_6", -1234567.89, dojo.number.parse("-1\xa0234\xa0567,89", {locale: "fr-fr"}));
	jum.assertEquals("num_3_7", NaN, dojo.number.parse("-1 234 567,89", {locale: "en-us"}));

	//invalid - NaN
//	jum.assertEquals("num_3_8", NaN, dojo.number.parse("10,00", {locale: "en-us"}));
//	jum.assertEquals("num_3_9", NaN, dojo.number.parse("1000.1", {locale: "fr-fr"}));

	//test whitespace
//	jum.assertEquals("num_3_10", -1234567, dojo.number.parse("  -1,234,567  ", {locale: "en-us"}));

//	jum.assertTrue("num_3_11", dojo.number.parse("9.1093826E-31"));

	jum.assertEquals("num_4_0", 123.4, dojo.number.parse("123.4", {pattern: "#0.#"}));
	jum.assertEquals("num_4_1", -123.4, dojo.number.parse("-123.4", {pattern: "#0.#"}));
	jum.assertEquals("num_4_2", 123.4, dojo.number.parse("123.4", {pattern: "#0.#;(#0.#)"}));
	jum.assertEquals("num_4_3", -123.4, dojo.number.parse("(123.4)", {pattern: "#0.#;(#0.#)"}));
}


