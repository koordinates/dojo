// can't set djConfig.extraLocale before bootstrapping unit tests, so manually load resources here for specific locales:
dojo.requireLocalization("dojo.i18n.cldr","gregorian","en-us");
dojo.requireLocalization("dojo.i18n.cldr","gregorian","fr-fr");
dojo.requireLocalization("dojo.i18n.cldr","gregorian","es");
dojo.requireLocalization("dojo.i18n.cldr","gregorian","de-at");
dojo.requireLocalization("dojo.i18n.cldr","gregorian","ja-jp");
dojo.requireLocalization("dojo.i18n.cldr","gregorian","zh-cn");

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

	jum.assertEquals("format_test15", "11082006", dojo.date.format(date, {datePattern:"ddMMyyyy", selector:"dateOnly"}));

	// compare without timezone
	jum.assertEquals("format_test16", "\u4e0a\u534812\u65f655\u520612\u79d2", dojo.date.format(date, {formatLength:'full',selector:'timeOnly', locale:'zh-cn'}).split(' ')[0]);
}

function test_date_strftime() {
	var date = new Date(2006, 7, 11, 0, 55, 12, 3456);
	jum.assertEquals("strftime_test0", "06/08/11", dojo.date.strftime(date, "%y/%m/%d"));

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

	fmt = '%c';
	res = 'Sunday, January 1, 2006 6:23:00 PM';
	jum.assertEquals("strftime_test5", res, dojo.date.strftime(dt, fmt).substring(0, res.length));
	
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

	fmt = '%X';
	res = '6:23:00 PM';
	jum.assertEquals("strftime_test26", res, dojo.date.strftime(dt, fmt, 'en').substring(0,res.length));
	
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
	var i = 0;
	function name() { return "parse_test" + i++; }

	/***********
	 DATES
	***********/

	var aug_11_2006 = new Date(2006, 7, 11, 0);
	var aug_11_06CE = new Date(2006, 7, 11, 0);
	aug_11_06CE.setFullYear(6); //literally the year 6 C.E.

	//en: 'short' fmt: M/d/yy
	// Tolerate either 8 or 08 for month part.
	jum.assertEquals( aug_11_2006, dojo.date.parse("08/11/06", {formatLength:'short', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("8/11/06", {formatLength:'short', locale:'en'}));	
	// Tolerate yyyy input in yy part...
	jum.assertEquals( aug_11_2006, dojo.date.parse("8/11/2006", {formatLength:'short', locale:'en'}));
	// ...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("8/11/2006", {formatLength:'short', locale:'en', strict:true}));

	//en: 'medium' fmt: MMM d, yyyy
	// Tolerate either 8 or 08 for month part.
	jum.assertEquals( aug_11_2006, dojo.date.parse("Aug 11, 2006", {formatLength:'medium', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("Aug 11, 2006", {formatLength:'medium', locale:'en'}));	
	// Tolerate abbreviating period in month part...
	jum.assertEquals( aug_11_2006, dojo.date.parse("Aug. 11, 2006", {formatLength:'medium', locale:'en'}));
	// ...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("Aug. 11, 2006", {formatLength:'medium', locale:'en', strict:true}));
	// Note: 06 for year part will be translated literally as the year 6 C.E.
	jum.assertEquals( aug_11_06CE, dojo.date.parse("Aug 11, 06", {formatLength:'medium', locale:'en'}));
	//en: 'long' fmt: MMMM d, yyyy
	jum.assertEquals( aug_11_2006, dojo.date.parse("August 11, 2006", {formatLength:'long', locale:'en'}));

	//en: 'full' fmt: EEEE, MMMM d, yyyy
	jum.assertEquals( aug_11_2006, dojo.date.parse("Friday, August 11, 2006", {formatLength:'full', locale:'en'}));
	//TODO: wrong day-of-week should fail
	//jum.assertEquals( null, dojo.date.parse("Thursday, August 11, 2006", {formatLength:'full', locale:'en'}));

	//Whitespace tolerance
	jum.assertEquals( aug_11_2006, dojo.date.parse(" August 11, 2006", {formatLength:'long', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("August  11, 2006", {formatLength:'long', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("August 11 , 2006", {formatLength:'long', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("August 11,  2006", {formatLength:'long', locale:'en'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("August 11, 2006 ", {formatLength:'long', locale:'en'}));

	//Simple Validation Tests
	//catch "month" > 12 (note: month/day reversals are common when user expectation isn't met wrt european versus US formats)
	jum.assertEquals( null, dojo.date.parse("15/1/2005", {formatLength:'short', locale:'en'}));
	//day of month typo rolls over to the next month
	jum.assertEquals( null, dojo.date.parse("Aug 32, 2006", {formatLength:'medium', locale:'en'}));

	//German (de)
	jum.assertEquals( aug_11_2006, dojo.date.parse("11.08.06", {formatLength:'short', locale:'de'}));
	jum.assertEquals( null, dojo.date.parse("11.8/06", {formatLength:'short', locale:'de'}));
	jum.assertEquals( null, dojo.date.parse("11.8x06", {formatLength:'short', locale:'de'}));
	jum.assertEquals( null, dojo.date.parse("11.13.06", {formatLength:'short', locale:'de'}));
	jum.assertEquals( null, dojo.date.parse("11.0.06", {formatLength:'short', locale:'de'}));
	jum.assertEquals( null, dojo.date.parse("32.08.06", {formatLength:'short', locale:'de'}));

	//Spanish (es)
	//es: 'short' fmt: d/MM/yy
	jum.assertEquals( aug_11_2006, dojo.date.parse("11/08/06", {formatLength:'short', locale:'es'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("11/8/06", {formatLength:'short', locale:'es'}));	
	// Tolerate yyyy input in yy part...
	jum.assertEquals( aug_11_2006, dojo.date.parse("11/8/2006", {formatLength:'short', locale:'es'}));
	// ...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("11/8/2006", {formatLength:'short', locale:'es', strict:true}));
	//es: 'medium' fmt: dd-MMM-yy
	jum.assertEquals( aug_11_2006, dojo.date.parse("11-ago-06", {formatLength:'medium', locale:'es'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("11-ago-2006", {formatLength:'medium', locale:'es'}));	
	// Tolerate abbreviating period in month part...
	jum.assertEquals( aug_11_2006, dojo.date.parse("11-ago.-2006", {formatLength:'medium', locale:'es'}));
	// ...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("11-ago.-2006", {formatLength:'medium', locale:'es', strict:true}));
	//es: 'long' fmt: d' de 'MMMM' de 'yyyy
	jum.assertEquals( aug_11_2006, dojo.date.parse("11 de agosto de 2006", {formatLength:'long', locale:'es'}));
	//case-insensitive month...
	jum.assertEquals( aug_11_2006, dojo.date.parse("11 de Agosto de 2006", {formatLength:'long', locale:'es'}));
	//...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("11 de Agosto de 2006", {formatLength:'long', locale:'es', strict:true}));
	//es 'full' fmt: EEEE d' de 'MMMM' de 'yyyy
	jum.assertEquals( aug_11_2006, dojo.date.parse("viernes 11 de agosto de 2006", {formatLength:'full', locale:'es'}));
	//case-insensitive day-of-week...
	jum.assertEquals( aug_11_2006, dojo.date.parse("Viernes 11 de agosto de 2006", {formatLength:'full', locale:'es'}));
	//...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("Viernes 11 de agosto de 2006", {formatLength:'full', locale:'es', strict:true}));

	//Japanese (ja)
	//note: to avoid garbling from non-utf8-aware editors that may touch this file, using the \uNNNN format 
	//for expressing double-byte chars.
	//toshi (year): \u5e74
	//getsu (month): \u6708
	//nichi (day): \u65e5
	//kinyoubi (Friday): \u91d1\u66dc\u65e5
	//zenkaku space: \u3000
	
	//ja: 'short' fmt: yy/MM/dd (note: the "short" fmt isn't actually defined in the CLDR data...)
	jum.assertEquals( aug_11_2006, dojo.date.parse("06/08/11", {formatLength:'short', locale:'ja'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("06/8/11", {formatLength:'short', locale:'ja'}));	
 	// Tolerate yyyy input in yy part...
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006/8/11", {formatLength:'short', locale:'ja'}));
	// ...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("2006/8/11", {formatLength:'short', locale:'ja', strict:true}));
	//ja: 'medium' fmt: yyyy/MM/dd
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006/08/11", {formatLength:'medium', locale:'ja'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006/8/11", {formatLength:'medium', locale:'ja'}));		
	//ja: 'long' fmt: yyyy'\u5e74'\u6708'd'\u65e5'
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006\u5e748\u670811\u65e5", {formatLength:'long', locale:'ja'}));
	//ja 'full' fmt: yyyy'\u5e74'M'\u6708'd'\u65e5'EEEE
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006\u5e748\u670811\u65e5\u91d1\u66dc\u65e5", {formatLength:'full', locale:'ja'}));

	//Whitespace tolerance
	//tolerate ascii space
	jum.assertEquals( aug_11_2006, dojo.date.parse(" 2006\u5e748\u670811\u65e5\u91d1\u66dc\u65e5 ", {formatLength:'full', locale:'ja'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006\u5e74 8\u670811\u65e5 \u91d1\u66dc\u65e5", {formatLength:'full', locale:'ja'}));
	//tolerate zenkaku space
	jum.assertEquals( aug_11_2006, dojo.date.parse("\u30002006\u5e748\u670811\u65e5\u91d1\u66dc\u65e5\u3000", {formatLength:'full', locale:'ja'}));
	jum.assertEquals( aug_11_2006, dojo.date.parse("2006\u5e74\u30008\u670811\u65e5\u3000\u91d1\u66dc\u65e5", {formatLength:'full', locale:'ja'}));

	/***********
	 DATETIMES
	***********/
	var aug_11_2006_12_30_am = new Date(2006, 7, 11, 0, 30);
	var aug_11_2006_12_30_pm = new Date(2006, 7, 11, 12, 30);

	//en: 'short' datetime fmt: M/d/yy h:mm a
	//note: this is concatenation of dateFormat-short and timeFormat-short, 
	//cldr provisionally defines datetime fmts as well, but we're not using them at the moment
	jum.assertEquals( aug_11_2006_12_30_pm, dojo.date.parse("08/11/06 12:30 PM", {formatLength:'short', selector:'dateTime', locale:'en'}));
	//case-insensitive
	jum.assertEquals( aug_11_2006_12_30_pm, dojo.date.parse("08/11/06 12:30 pm", {formatLength:'short', selector:'dateTime', locale:'en'}));
	//...but not in strict mode
	jum.assertEquals( null, dojo.date.parse("08/11/06 12:30 pm", {formatLength:'short', selector:'dateTime', locale:'en', strict:true}));

	jum.assertEquals( aug_11_2006_12_30_am, dojo.date.parse("08/11/06 12:30 AM", {formatLength:'short', selector:'dateTime', locale:'en'}));

	jum.assertEquals( new Date(2006, 7, 11), dojo.date.parse("11082006", {datePattern:"ddMMyyyy", selector:"dateOnly"}));
}

function test_time_parse(){
	
	var time = new Date(2006, 7, 11, 12, 30);
	var tformat = {selector:'timeOnly', strict:true, timePattern:"h:mm a"};
	
	jum.assertEquals(time.getHours(), dojo.date.parse("12:30 PM", tformat).getHours());
	jum.assertEquals(time.getMinutes(), dojo.date.parse("12:30 PM", tformat).getMinutes());
}

function test_date_sql() {
	var d = new Date(2006, 5, 1, 12, 30);
	//FIXME: lame comparison of hours only to avoid timezone issues with valueof.  Need a better comparison method
	jum.assertEquals("date.fromSql test", d.getHours(), dojo.date.fromSql("2006-05-01 12:30:00").getHours());
	jum.assertEquals("date.toSql test1", "2006-06-01 12:30:00", dojo.date.toSql(d));
	jum.assertEquals("date.toSql test2", "2006-06-01", dojo.date.toSql(d, true));
	jum.assertEquals("date.toSql test3", "2006-06-01 12:30:00", dojo.date.toSql(d, false));
}

// workaround deprecated methods. Should decide whether we should convert the tests or add a helper method (in dojo.date?) to do this.

dojo_validate_isValidTime = function(str, props){
	props = props || {};
	if(!props.format){props.format="h:mm:ss";}
	if(!props.am){props.am="a.m.";}
	if(!props.pm){props.pm="p.m.";}
	var result = false;
	if(/[hk]/.test(props.format) && props.format.indexOf('a') == -1){
		result = dojo.date.parse(str, {selector: 'timeOnly', timePattern: props.format + " a"});
	}
	return Boolean(result || dojo.date.parse(str, {selector: 'timeOnly', timePattern: props.format}));
}

dojo_validate_is12HourTime = function(str){
	return dojo_validate_isValidTime(str, {format: 'h:mm:ss'}) || 	dojo_validate_isValidTime(str, {format: 'h:mm'});
}

dojo_validate_is24HourTime = function(str){
	return dojo_validate_isValidTime(str, {format: 'H:mm:ss'}) || 	dojo_validate_isValidTime(str, {format: 'H:mm'});
}

dojo_validate_isValidDate = function(str, fmt){
	return Boolean(dojo.date.parse(str, {selector: 'dateOnly', datePattern: fmt}));
}

function test_validate_datetime_isValidTime(){
	jum.assertTrue("test1", dojo_validate_isValidTime('5:15:05 pm'));
// FAILURE	jum.assertTrue("test2", dojo_validate_isValidTime('5:15:05 p.m.', {pm: "P.M."} ));
	jum.assertFalse("test3", dojo_validate_isValidTime('5:15:05 f.m.'));
	jum.assertTrue("test4", dojo_validate_isValidTime('5:15 pm', {format: "h:mm a"} ) );
	jum.assertFalse("test5", dojo_validate_isValidTime('5:15 fm', {}) );
	jum.assertTrue("test6", dojo_validate_isValidTime('15:15:00', {format: "H:mm:ss"} ) );
// FAILURE	jum.assertFalse("test7", dojo_validate_isValidTime('15:15:00', {}) );
	jum.assertTrue("test8", dojo_validate_isValidTime('17:01:30', {format: "H:mm:ss"} ) );
	jum.assertFalse("test9", dojo_validate_isValidTime('17:1:30', {format: "H:mm:ss"} ) );
// FAILURE	jum.assertFalse("test10", dojo_validate_isValidTime('17:01:30', {format: "H:m:ss"} ) );
	// Greek
// FAILURE	jum.assertTrue("test11", dojo_validate_isValidTime('5:01:30 \u0924\u0924', {am: "\u0928\u0924", pm: "\u0924\u0924"} ) );
	// Italian
	jum.assertTrue("test12", dojo_validate_isValidTime('17.01.30', {format: "H.mm.ss"} ) );
	// Mexico
// FAILURE	jum.assertTrue("test13", dojo_validate_isValidTime('05:01:30 p.m.', {format: "hh:mm:ss a", am: "a.m.", pm: "p.m."} ) );
}


function test_validate_datetime_is12HourTime(){
	jum.assertTrue("test1", dojo_validate_is12HourTime('5:15:05 pm'));
// FAILURE	jum.assertFalse("test2", dojo_validate_is12HourTime('05:15:05 pm'));
	jum.assertFalse("test3", dojo_validate_is12HourTime('5:5:05 pm'));
	jum.assertFalse("test4", dojo_validate_is12HourTime('5:15:5 pm'));
// FAILURE	jum.assertFalse("test5", dojo_validate_is12HourTime('13:15:05 pm'));
	jum.assertFalse("test6", dojo_validate_is12HourTime('5:60:05 pm'));
	jum.assertFalse("test7", dojo_validate_is12HourTime('5:15:60 pm'));
	jum.assertTrue("test8", dojo_validate_is12HourTime('5:59:05 pm'));
	jum.assertTrue("test9", dojo_validate_is12HourTime('5:15:59 pm'));
// FAILURE	jum.assertFalse("test10", dojo_validate_is12HourTime('5:15:05'));

	// optional seconds
	jum.assertTrue("test11", dojo_validate_is12HourTime('5:15 pm'));
	jum.assertFalse("test12", dojo_validate_is12HourTime('5:15: pm'));
}

function test_validate_datetime_is24HourTime(){
	jum.assertTrue("test1", dojo_validate_is24HourTime('00:03:59'));
	jum.assertTrue("test2", dojo_validate_is24HourTime('22:03:59'));
//FIXME: fix tests or code?
//	jum.assertFalse("test3", dojo_validate_is24HourTime('22:03:59 pm'));
//	jum.assertFalse("test4", dojo_validate_is24HourTime('2:03:59'));
	jum.assertFalse("test5", dojo_validate_is24HourTime('0:3:59'));
	jum.assertFalse("test6", dojo_validate_is24HourTime('00:03:5'));
	jum.assertFalse("test7", dojo_validate_isValidTime('24:03:59', {format: 'kk:mm:ss'}));
	jum.assertFalse("test8", dojo_validate_is24HourTime('02:60:59'));
	jum.assertFalse("test9", dojo_validate_is24HourTime('02:03:60'));

	// optional seconds
	jum.assertTrue("test10", dojo_validate_is24HourTime('22:53'));
	jum.assertFalse("test11", dojo_validate_is24HourTime('22:53:'));
}

function test_validate_datetime_isValidDate(){
	
	// Month date year
	jum.assertTrue("test1", dojo_validate_isValidDate("08/06/2005", "MM/dd/yyyy"));
	jum.assertTrue("test2", dojo_validate_isValidDate("08.06.2005", "MM.dd.yyyy"));
	jum.assertTrue("test3", dojo_validate_isValidDate("08-06-2005", "MM-dd-yyyy"));
	jum.assertTrue("test4", dojo_validate_isValidDate("8/6/2005", "M/d/yyyy"));
	jum.assertTrue("test5", dojo_validate_isValidDate("8/6", "M/d"));
	jum.assertFalse("test6", dojo_validate_isValidDate("09/31/2005", "MM/dd/yyyy"));
	jum.assertFalse("test7", dojo_validate_isValidDate("02/29/2005", "MM/dd/yyyy"));
	jum.assertTrue("test8", dojo_validate_isValidDate("02/29/2004", "MM/dd/yyyy"));

	// year month date
	jum.assertTrue("test9", dojo_validate_isValidDate("2005-08-06", "yyyy-MM-dd"));
	jum.assertTrue("test10", dojo_validate_isValidDate("20050806", "yyyyMMdd"));

	// year month
	jum.assertTrue("test11", dojo_validate_isValidDate("2005-08", "yyyy-MM"));
	jum.assertTrue("test12", dojo_validate_isValidDate("200508", "yyyyMM"));

	// year
	jum.assertTrue("test13", dojo_validate_isValidDate("2005", "yyyy"));

	// year week day
//TODO: need to support 'w'?
//	jum.assertTrue("test14", dojo_validate_isValidDate("2005-W42-3", "yyyy-'W'ww-d"));
//	jum.assertTrue("test15", dojo_validate_isValidDate("2005W423", "yyyy'W'wwd"));
//	jum.assertFalse("test16", dojo_validate_isValidDate("2005-W42-8", "yyyy-'W'ww-d"));
//	jum.assertFalse("test17", dojo_validate_isValidDate("2005-W54-3", "yyyy-'W'ww-d"));

	// year week
//	jum.assertTrue("test18", dojo_validate_isValidDate("2005-W42", "yyyy-'W'ww"));
//	jum.assertTrue("test19", dojo_validate_isValidDate("2005W42", "yyyy'W'ww"));

	// year ordinal-day
	jum.assertTrue("test20", dojo_validate_isValidDate("2005-292", "yyyy-DDD"));
	jum.assertTrue("test21", dojo_validate_isValidDate("2005292", "yyyyDDD"));
	jum.assertFalse("test22", dojo_validate_isValidDate("2005-366", "yyyy-DDD"));
	jum.assertTrue("test23", dojo_validate_isValidDate("2004-366", "yyyy-DDD"));

	// date month year
	jum.assertTrue("test24", dojo_validate_isValidDate("19.10.2005", "dd.MM.yyyy"));
	jum.assertTrue("test25", dojo_validate_isValidDate("19-10-2005", "d-M-yyyy"));
}
