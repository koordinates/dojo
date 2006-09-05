// can't set djConfig.extraLocale before bootstrapping unit tests, so manually load resources here for specific locales:
dojo.requireLocalization("dojo.i18n.calendar","gregorian","en-us");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","fr-fr");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","de-at");
dojo.requireLocalization("dojo.i18n.calendar","gregorian","ja-jp");

dojo.require("dojo.date.format");

function test_date_format() {
	var date = new Date(2006, 7, 11, 0, 55, 12, 345);

	jum.assertEquals("format_test1", "Friday, August 11, 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'en-us'}));
	jum.assertEquals("format_test2", "vendredi 11 ao\xFBt 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'fr-fr'}));
	jum.assertEquals("format_test3", "Freitag, 11. August 2006", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'de-at'}));
	jum.assertEquals("format_test4", "2006\u5E748\u670811\u65E5\u91D1\u66DC\u65E5", dojo.date.format(date, {formatLength:'full',selector:'dateOnly', locale:'ja-jp'}));

	jum.assertEquals("format_test5", "8/11/06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'en-us'}));
	jum.assertEquals("format_test6", "11/08/06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'fr-fr'}));
	jum.assertEquals("format_test7", "11.08.06", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'de-at'}));
	jum.assertEquals("format_test8", "06/08/11", dojo.date.format(date, {formatLength:'short',selector:'dateOnly', locale:'ja-jp'}));

	jum.assertEquals("format_test9", "12:55 AM", dojo.date.format(date, {formatLength:'short',selector:'timeOnly', locale:'en-us'}));
	jum.assertEquals("format_test10", "12:55:12", dojo.date.format(date, {timePattern:'h:m:s',selector:'timeOnly'}));
	jum.assertEquals("format_test11", "12:55:12.35", dojo.date.format(date, {timePattern:'h:m:s.SS',selector:'timeOnly'}));
	jum.assertEquals("format_test12", "24:55:12.35", dojo.date.format(date, {timePattern:'k:m:s.SS',selector:'timeOnly'}));
	jum.assertEquals("format_test13", "0:55:12.35", dojo.date.format(date, {timePattern:'H:m:s.SS',selector:'timeOnly'}));
	jum.assertEquals("format_test14", "0:55:12.35", dojo.date.format(date, {timePattern:'K:m:s.SS',selector:'timeOnly'}));
}

function test_date_strftime() {
	var date = new Date(2006, 7, 11, 0, 55, 12, 3456);
	jum.assertEquals("strftime_test0", "06/08/11", dojo.date.strftime(date, "%y/%m/%d"));
	jum.assertEquals("strftime_test0depr", "06/08/11", dojo.date.format(date, "%y/%m/%d"));

	var dt = null; // Date to test
	var fmt = ''; // Format to test
	var res = ''; // Expected result
	
	dt = new Date(2006, 0, 1, 18, 23);
	fmt = '%a';
	res = 'Sun';
	jum.assertEquals("strftime_test1", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%A';
	res = 'Sunday';
	jum.assertEquals("strftime_test2", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%b';
	res = 'Jan';
	jum.assertEquals("strftime_test3", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%B';
	res = 'January';
	jum.assertEquals("strftime_test4", res, dojo.date.strftime(dt, fmt, 'en'));

//dojo.date.format can't print timezones yet	
	//fmt = '%c';
	//res = 'Sunday, January 1, 2006 6:23:00 PM';
	//jum.assertEquals("strftime_test5", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%C';
	res = '20';
	jum.assertEquals("strftime_test6", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%d';
	res = '01';
	jum.assertEquals("strftime_test7", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%D';
	res = '01/01/06';
	jum.assertEquals("strftime_test8", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%e';
	res = ' 1';
	jum.assertEquals("strftime_test9", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%h';
	res = 'Jan';
	jum.assertEquals("strftime_test10", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%H';
	res = '18';
	jum.assertEquals("strftime_test11", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%I';
	res = '06';
	jum.assertEquals("strftime_test12", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%j';
	res = '001';
	jum.assertEquals("strftime_test13", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%k';
	res = '18';
	jum.assertEquals("strftime_test14", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%l';
	res = ' 6';
	jum.assertEquals("strftime_test15", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%m';
	res = '01';
	jum.assertEquals("strftime_test16", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%M';
	res = '23';
	jum.assertEquals("strftime_test17", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%p';
	res = 'PM';
	jum.assertEquals("strftime_test18", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%r';
	res = '06:23:00 PM';
	jum.assertEquals("strftime_test19", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%R';
	res = '18:23';
	jum.assertEquals("strftime_test20", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%S';
	res = '00';
	jum.assertEquals("strftime_test21", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%T';
	res = '18:23:00';
	jum.assertEquals("strftime_test22", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%u';
	res = '7';
	jum.assertEquals("strftime_test23", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%w';
	res = '0';
	jum.assertEquals("strftime_test24", res, dojo.date.strftime(dt, fmt));

	fmt = '%x';
	res = 'Sunday, January 1, 2006';
	jum.assertEquals("strftime_test25", res, dojo.date.strftime(dt, fmt, 'en'));

// dojo.date.format can't print timezones yet
//	fmt = '%X';
//	res = '6:23:00 PM';
//	jum.assertEquals("strftime_test26", res, dojo.date.strftime(dt, fmt, 'en'));
	
	fmt = '%y';
	res = '06';
	jum.assertEquals("strftime_test27", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%Y';
	res = '2006';
	jum.assertEquals("strftime_test28", res, dojo.date.strftime(dt, fmt));
	
	fmt = '%%';
	res = '%';
	jum.assertEquals("strftime_test29", res, dojo.date.strftime(dt, fmt));
}

function test_date_parse() {
	var tzOffset = new Date().getTimezoneOffset()*60*1000;
	jum.assertEquals("parse_test1", "1155283200000", dojo.date.parse("08/11/06", {formatLength:'short',selector:'dateOnly', locale:'en-us'}).getTime()+tzOffset);
}

function test_date_sql() {
	jum.assertEquals("date.fromSql test", new Date("5/1/2006").valueOf(), dojo.date.fromSql("2006-05-01 00:00:00").valueOf());
}
