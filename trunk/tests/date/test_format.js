// can't set djConfig.extraLocale before bootstrapping unit tests, so manually load resources here for specific locales:
dojo.requireLocalization("dojo.i18n.calendar","gregorian","en-us");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","fr-fr");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","de-at");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","ja-jp");

dojo.require("dojo.date.format");

function test_date_format() {
	var date = new Date(2006, 7, 11, 0, 55, 12, 3456);

	jum.assertEquals("format_test1", "Friday, August 11, 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'en-us'}));
	jum.assertEquals("format_test2", "vendredi 11 ao\xFBt 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'fr-fr'}));
	jum.assertEquals("format_test3", "Freitag, 11. August 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'de-at'}));
	jum.assertEquals("format_test4", "2006\u5E748\u670811\u65E5\u91D1\u66DC\u65E5", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'ja-jp'}));

	jum.assertEquals("format_test5", "8/11/06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'en-us'}));
	jum.assertEquals("format_test6", "11/08/06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'fr-fr'}));
	jum.assertEquals("format_test7", "11.08.06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'de-at'}));
	jum.assertEquals("format_test8", "06/08/11", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'ja-jp'}));
}

function test_date_strftime() {
	var date = new Date(2006, 7, 11, 0, 55, 12, 3456);
	jum.assertEquals("strftime_test1", "06/08/11", dojo.date.strftime(date, "%y/%m/%d"));
	jum.assertEquals("strftime_test2", "06/08/11", dojo.date.strftime(date, "%y/%m/%d"));
	jum.assertEquals("strftime_test1depr", "06/08/11", dojo.date.format(date, "%y/%m/%d"));
	jum.assertEquals("strftime_test2depr", "06/08/11", dojo.date.format(date, "%y/%m/%d"));
}

function test_date_parse() {
	var tzOffset = new Date().getTimezoneOffset()*60*1000;
	jum.assertEquals("parse_test1", "1155283200000", dojo.date.parse("08/11/06", {formatLength:'short',selector:'dateOnly', locale:'en-us'}).getTime()+tzOffset);
}

function test_date_sql() {
	jum.assertEquals("date.fromSql test", new Date("5/1/2006").valueOf(), dojo.date.fromSql("2006-05-01 00:00:00").valueOf());
}
