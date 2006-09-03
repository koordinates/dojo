dojo.require("dojo.date.common");

/* Supplementary Date Functions
 *******************************/

function test_date_setDayOfYear () {
	//dojo.date.setDayOfYear(new Date(2006,2,1), 23);
}

function test_date_getDayOfYear () {
	//dojo.date.getDayOfYear(new Date(2006,0,1));
}




function test_date_setWeekOfYear () {
	//dojo.date.setWeekOfYear(new Date(2006,2,1), 34);
	//dojo.date.setWeekOfYear(new Date(2006,2,1), 34, 1);
}

function test_date_getWeekOfYear () {
	//dojo.date.getWeekOfYear(new Date(2006,1,1));
	//dojo.date.getWeekOfYear(new Date(2006,1,1), 1);
}




function test_date_setIsoWeekOfYear () {
	//dojo.date.setIsoWeekOfYear(new Date(2006,2,1), 34);
	//dojo.date.setIsoWeekOfYear(new Date(2006,2,1), 34, 1);
}

function test_date_getIsoWeekOfYear () {
	//dojo.date.getIsoWeekOfYear(new Date(2006,1,1));
	//dojo.date.getIsoWeekOfYear(new Date(2006,1,1), 1);
}




/* ISO 8601 Functions
 *********************/

function test_date_fromIso8601() {
	var iso  = "20060210T000000Z"
	var date = dojo.date.fromIso8601(iso);
	jum.assertEquals("fromIso8601_test1",2006,date.getFullYear());
	jum.assertEquals("fromIso8601_test2",1,date.getMonth());
	jum.assertEquals("fromIso8601_test3",10,date.getDate());
}

function test_date_fromIso8601Date () {
	
	//YYYY-MM-DD
	var date = dojo.date.fromIso8601Date("2005-02-22");
	jum.assertEquals("fromIso8601Date_test7", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test8", 1, date.getMonth());
	jum.assertEquals("fromIso8601Date_test9", 22, date.getDate());
	
	//YYYYMMDD
	var date = dojo.date.fromIso8601Date("20050222");
	jum.assertEquals("fromIso8601Date_test10", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test11", 1, date.getMonth());
	jum.assertEquals("fromIso8601Date_test12", 22, date.getDate());
	
	//YYYY-MM
	var date = dojo.date.fromIso8601Date("2005-08");
	jum.assertEquals("fromIso8601Date_test13", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test14", 7, date.getMonth());
	
	//YYYYMM
	var date = dojo.date.fromIso8601Date("200502");
	jum.assertEquals("fromIso8601Date_test15", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test16", 1, date.getMonth());
	
	//YYYY
	var date = dojo.date.fromIso8601Date("2005");
	jum.assertEquals("fromIso8601Date_test17", 2005, date.getFullYear());
	
	//1997-W01 or 1997W01
	var date = dojo.date.fromIso8601Date("2005-W22");
	jum.assertEquals("fromIso8601Date_test18", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test19", 5, date.getMonth());
	jum.assertEquals("fromIso8601Date_test20", 6, date.getDate());

	var date = dojo.date.fromIso8601Date("2005W22");
	jum.assertEquals("fromIso8601Date_test21", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test22", 5, date.getMonth());
	jum.assertEquals("fromIso8601Date_test23", 6, date.getDate());
	
	//1997-W01-2 or 1997W012
	var date = dojo.date.fromIso8601Date("2005-W22-4");
	jum.assertEquals("fromIso8601Date_test24", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test25", 5, date.getMonth());
	jum.assertEquals("fromIso8601Date_test26", 9, date.getDate());

	var date = dojo.date.fromIso8601Date("2005W224");
	jum.assertEquals("fromIso8601Date_test27", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test28", 5, date.getMonth());
	jum.assertEquals("fromIso8601Date_test29", 9, date.getDate());

		
	//1995-035 or 1995035
	var date = dojo.date.fromIso8601Date("2005-146");
	jum.assertEquals("fromIso8601Date_test30", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test31", 4, date.getMonth());
	jum.assertEquals("fromIso8601Date_test32", 26, date.getDate());
	
	var date = dojo.date.fromIso8601Date("2005146");
	jum.assertEquals("fromIso8601Date_test33", 2005, date.getFullYear());
	jum.assertEquals("fromIso8601Date_test34", 4, date.getMonth());
	jum.assertEquals("fromIso8601Date_test35", 26, date.getDate());
	
}

function test_date_fromIso8601Time () {
	
	//23:59:59
	var date = dojo.date.fromIso8601Time("18:46:39");
	jum.assertEquals("fromIso8601Time_test36", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test37", 46, date.getMinutes());
	jum.assertEquals("fromIso8601Time_test38", 39, date.getSeconds());
	
	//235959
	var date = dojo.date.fromIso8601Time("184639");
	jum.assertEquals("fromIso8601Time_test39", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test40", 46, date.getMinutes());
	jum.assertEquals("fromIso8601Time_test41", 39, date.getSeconds());
	
	//23:59, 2359, or 23
	var date = dojo.date.fromIso8601Time("18:46");
	jum.assertEquals("fromIso8601Time_test42", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test43", 46, date.getMinutes());

	var date = dojo.date.fromIso8601Time("1846");
	jum.assertEquals("fromIso8601Time_test44", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test45", 46, date.getMinutes());

	var date = dojo.date.fromIso8601Time("18");
	jum.assertEquals("fromIso8601Time_test46", 18, date.getHours());

	//23:59:59.9942 or 235959.9942
	var date = dojo.date.fromIso8601Time("18:46:39.9942");
	jum.assertEquals("fromIso8601Time_test47", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test48", 46, date.getMinutes());
	jum.assertEquals("fromIso8601Time_test49", 39, date.getSeconds());
	jum.assertEquals("fromIso8601Time_test50", 994, date.getMilliseconds());

	var date = dojo.date.fromIso8601Time("184639.9942");
	jum.assertEquals("fromIso8601Time_test51", 18, date.getHours());
	jum.assertEquals("fromIso8601Time_test52", 46, date.getMinutes());
	jum.assertEquals("fromIso8601Time_test53", 39, date.getSeconds());
	jum.assertEquals("fromIso8601Time_test54", 994, date.getMilliseconds());
	
	//1995-02-04 24:00 = 1995-02-05 00:00

	// FIXME: failing because of daylight savings time
	//timezone tests
	var offset = new Date().getTimezoneOffset()/60;
	var date = dojo.date.fromIso8601Time("18:46:39+07:00");
	jum.assertEquals("fromIso8601Time_test61", 11 - offset, date.getHours());

	var date = dojo.date.fromIso8601Time("18:46:39+00:00");
	jum.assertEquals("fromIso8601Time_test62", 18 - offset, date.getHours());

	var date = dojo.date.fromIso8601Time("16:46:39-07:00");
	jum.assertEquals("fromIso8601Time_test63", 23 - offset, date.getHours());
	
	//+hh:mm, +hhmm, or +hh
	
	//-hh:mm, -hhmm, or -hh
	
}


/* Informational Functions
 **************************/

function test_date_getDaysInMonth () {
	// months other than February
	jum.assertEquals("getDaysInMonth_test1", 31, dojo.date.getDaysInMonth(new Date(2006,0,1)));
	jum.assertEquals("getDaysInMonth_test2", 31, dojo.date.getDaysInMonth(new Date(2006,2,1)));
	jum.assertEquals("getDaysInMonth_test3", 30, dojo.date.getDaysInMonth(new Date(2006,3,1)));
	jum.assertEquals("getDaysInMonth_test4", 31, dojo.date.getDaysInMonth(new Date(2006,4,1)));
	jum.assertEquals("getDaysInMonth_test5", 30, dojo.date.getDaysInMonth(new Date(2006,5,1)));
	jum.assertEquals("getDaysInMonth_test6", 31, dojo.date.getDaysInMonth(new Date(2006,6,1)));
	jum.assertEquals("getDaysInMonth_test7", 31, dojo.date.getDaysInMonth(new Date(2006,7,1)));
	jum.assertEquals("getDaysInMonth_test8", 30, dojo.date.getDaysInMonth(new Date(2006,8,1)));
	jum.assertEquals("getDaysInMonth_test9", 31, dojo.date.getDaysInMonth(new Date(2006,9,1)));
	jum.assertEquals("getDaysInMonth_test10", 30, dojo.date.getDaysInMonth(new Date(2006,10,1)));
	jum.assertEquals("getDaysInMonth_test11", 31, dojo.date.getDaysInMonth(new Date(2006,11,1)));

	// Februarys
	jum.assertEquals("getDaysInMonth_test12", 28, dojo.date.getDaysInMonth(new Date(2006,1,1)));
	jum.assertEquals("getDaysInMonth_test13", 29, dojo.date.getDaysInMonth(new Date(2004,1,1)));
	jum.assertEquals("getDaysInMonth_test14", 29, dojo.date.getDaysInMonth(new Date(2000,1,1)));
	jum.assertEquals("getDaysInMonth_test15", 28, dojo.date.getDaysInMonth(new Date(1900,1,1)));
	jum.assertEquals("getDaysInMonth_test16", 28, dojo.date.getDaysInMonth(new Date(1800,1,1)));
	jum.assertEquals("getDaysInMonth_test17", 28, dojo.date.getDaysInMonth(new Date(1700,1,1)));
	jum.assertEquals("getDaysInMonth_test18", 29, dojo.date.getDaysInMonth(new Date(1600,1,1)));
}

function test_date_isLeapYear () {
	jum.assertFalse("isLeapYear_test1", dojo.date.isLeapYear(new Date(2006,0,1)));
	jum.assertTrue("isLeapYear_test2", dojo.date.isLeapYear(new Date(2004,0,1)));
	jum.assertTrue("isLeapYear_test3", dojo.date.isLeapYear(new Date(2000,0,1)));
	jum.assertFalse("isLeapYear_test4", dojo.date.isLeapYear(new Date(1900,0,1)));
	jum.assertFalse("isLeapYear_test5", dojo.date.isLeapYear(new Date(1800,0,1)));
	jum.assertFalse("isLeapYear_test6", dojo.date.isLeapYear(new Date(1700,0,1)));
	jum.assertTrue("isLeapYear_test7", dojo.date.isLeapYear(new Date(1600,0,1)));
}



function test_date_getOrdinal () {
	jum.assertEquals("getOrdinal_test1", "st", dojo.date.getOrdinal(new Date(2006,0,1)));
	jum.assertEquals("getOrdinal_test2", "nd", dojo.date.getOrdinal(new Date(2006,0,2)));
	jum.assertEquals("getOrdinal_test3", "rd", dojo.date.getOrdinal(new Date(2006,0,3)));
	jum.assertEquals("getOrdinal_test4", "th", dojo.date.getOrdinal(new Date(2006,0,4)));
	jum.assertEquals("getOrdinal_test5", "th", dojo.date.getOrdinal(new Date(2006,0,11)));
	jum.assertEquals("getOrdinal_test6", "th", dojo.date.getOrdinal(new Date(2006,0,12)));
	jum.assertEquals("getOrdinal_test7", "th", dojo.date.getOrdinal(new Date(2006,0,13)));
	jum.assertEquals("getOrdinal_test8", "th", dojo.date.getOrdinal(new Date(2006,0,14)));
	jum.assertEquals("getOrdinal_test9", "st", dojo.date.getOrdinal(new Date(2006,0,21)));
	jum.assertEquals("getOrdinal_test10", "nd", dojo.date.getOrdinal(new Date(2006,0,22)));
	jum.assertEquals("getOrdinal_test11", "rd", dojo.date.getOrdinal(new Date(2006,0,23)));
	jum.assertEquals("getOrdinal_test12", "th", dojo.date.getOrdinal(new Date(2006,0,24)));
}


/* Date compare and add Functions
 *********************************/

function test_date_compare(){
	var d1=new Date();
	d1.setHours(0);
	var d2=new Date();
	d2.setFullYear(2005);
	d2.setHours(12);
	jum.assertEquals("compare_test1", 0, dojo.date.compare(d1, d1));
	jum.assertEquals("compare_test2", 1, dojo.date.compare(d1, d2, dojo.date.compareTypes.DATE));
	jum.assertEquals("compare_test3", -1, dojo.date.compare(d2, d1, dojo.date.compareTypes.DATE));
	jum.assertEquals("compare_test4", -1, dojo.date.compare(d1, d2, dojo.date.compareTypes.TIME));
	jum.assertEquals("compare_test5", 1, dojo.date.compare(d1, d2, dojo.date.compareTypes.DATE|dojo.date.compareTypes.TIME));
}

function test_date_add(){
	var interv = ''; // Interval (e.g., year, month)
	var dtA = null; // Date to increment
	var dtB = null; // Expected result date
	
	interv = dojo.date.dateParts.YEAR;
	dtA = new Date(2005, 11, 27);
	dtB = new Date(2006, 11, 27);
	jum.assertEquals("add_test1", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2005, 11, 27);
	dtB = new Date(2004, 11, 27);
	jum.assertEquals("add_test1a", dtB, dojo.date.add(dtA, interv, -1));
	
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2001, 1, 28);
	jum.assertEquals("add_test2", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2005, 1, 28);
	jum.assertEquals("add_test3", dtB, dojo.date.add(dtA, interv, 5));
	
	dtA = new Date(1900, 11, 31);
	dtB = new Date(1930, 11, 31);
	jum.assertEquals("add_test4", dtB, dojo.date.add(dtA, interv, 30));
	
	dtA = new Date(1995, 11, 31);
	dtB = new Date(2030, 11, 31);
	jum.assertEquals("add_test5", dtB, dojo.date.add(dtA, interv, 35));

	interv = dojo.date.dateParts.QUARTER;
	dtA = new Date(2000, 0, 1);
	dtB = new Date(2000, 3, 1);
	jum.assertEquals("add_test6", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2000, 7, 29);
	jum.assertEquals("add_test7", dtB, dojo.date.add(dtA, interv, 2));
	
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2001, 1, 28);
	jum.assertEquals("add_test8", dtB, dojo.date.add(dtA, interv, 4));
	
	interv = dojo.date.dateParts.MONTH;
	dtA = new Date(2000, 0, 1);
	dtB = new Date(2000, 1, 1);
	jum.assertEquals("add_test9", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2000, 0, 31);
	dtB = new Date(2000, 1, 29);
	jum.assertEquals("add_test10", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2001, 1, 28);
	jum.assertEquals("add_test11", dtB, dojo.date.add(dtA, interv, 12));
	
	interv = dojo.date.dateParts.WEEK;
	dtA = new Date(2000, 0, 1);
	dtB = new Date(2000, 0, 8);
	jum.assertEquals("add_test12", dtB, dojo.date.add(dtA, interv, 1));

	var interv = dojo.date.dateParts.DAY;
	dtA = new Date(2000, 0, 1);
	dtB = new Date(2000, 0, 2);
	jum.assertEquals("add_test13", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2001, 0, 1);
	dtB = new Date(2002, 0, 1);
	jum.assertEquals("add_test14", dtB, dojo.date.add(dtA, interv, 365));
	
	dtA = new Date(2000, 0, 1);
	dtB = new Date(2001, 0, 1);
	jum.assertEquals("add_test15", dtB, dojo.date.add(dtA, interv, 366));
	
	dtA = new Date(2000, 1, 28);
	dtB = new Date(2000, 1, 29);
	jum.assertEquals("add_test16", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2001, 1, 28);
	dtB = new Date(2001, 2, 1);
	jum.assertEquals("add_test17", dtB, dojo.date.add(dtA, interv, 1));
	
	dtA = new Date(2000, 2, 1);
	dtB = new Date(2000, 1, 29);
	jum.assertEquals("add_test18", dtB, dojo.date.add(dtA, interv, -1));
	
	dtA = new Date(2001, 2, 1);
	dtB = new Date(2001, 1, 28);
	jum.assertEquals("add_test19", dtB, dojo.date.add(dtA, interv, -1));
	
	dtA = new Date(2000, 0, 1);
	dtB = new Date(1999, 11, 31);
	jum.assertEquals("add_test20", dtB, dojo.date.add(dtA, interv, -1));
	
	interv = dojo.date.dateParts.WEEKDAY;
	// Sat, Jan 1
	dtA = new Date(2000, 0, 1);
	// Should be Mon, Jan 3
	dtB = new Date(2000, 0, 3);
	jum.assertEquals("add_test21", dtB, dojo.date.add(dtA, interv, 1));
	
	// Sun, Jan 2
	dtA = new Date(2000, 0, 2);
	// Should be Mon, Jan 3
	dtB = new Date(2000, 0, 3);
	jum.assertEquals("add_test22", dtB, dojo.date.add(dtA, interv, 1));
	
	// Sun, Jan 2
	dtA = new Date(2000, 0, 2);
	// Should be Fri, Jan 7
	dtB = new Date(2000, 0, 7);
	jum.assertEquals("add_test23", dtB, dojo.date.add(dtA, interv, 5));
	
	// Sun, Jan 2
	dtA = new Date(2000, 0, 2);
	// Should be Mon, Jan 10
	dtB = new Date(2000, 0, 10);
	jum.assertEquals("add_test24", dtB, dojo.date.add(dtA, interv, 6));
	
	// Mon, Jan 3
	dtA = new Date(2000, 0, 3);
	// Should be Mon, Jan 17
	dtB = new Date(2000, 0, 17);
	jum.assertEquals("add_test25", dtB, dojo.date.add(dtA, interv, 10));
	
	// Sat, Jan 8
	dtA = new Date(2000, 0, 8);
	// Should be Mon, Jan 3
	dtB = new Date(2000, 0, 3);
	jum.assertEquals("add_test25", dtB, dojo.date.add(dtA, interv, -5));
	
	// Sun, Jan 9
	dtA = new Date(2000, 0, 9);
	// Should be Wed, Jan 5
	dtB = new Date(2000, 0, 5);
	jum.assertEquals("add_test26", dtB, dojo.date.add(dtA, interv, -3));
	
	// Sun, Jan 23
	dtA = new Date(2000, 0, 23);
	// Should be Fri, Jan 7
	dtB = new Date(2000, 0, 7);
	jum.assertEquals("add_test27", dtB, dojo.date.add(dtA, interv, -11));
	
	interv = dojo.date.dateParts.HOUR;
	dtA = new Date(2000, 0, 1, 11);
	dtB = new Date(2000, 0, 1, 12);
	jum.assertEquals("add_test28", dtB, dojo.date.add(dtA, interv, 1));

	dtA = new Date(2001, 9, 28, 0);
	dtB = new Date(2001, 9, 28, 1);
	jum.assertEquals("add_test29", dtB, dojo.date.add(dtA, interv, 1));

	dtA = new Date(2001, 9, 28, 23);
	dtB = new Date(2001, 9, 29, 0);
	jum.assertEquals("add_test30", dtB, dojo.date.add(dtA, interv, 1));

	dtA = new Date(2001, 11, 31, 23);
	dtB = new Date(2002, 0, 1, 0);
	jum.assertEquals("add_test31", dtB, dojo.date.add(dtA, interv, 1));

	interv = dojo.date.dateParts.MINUTE;
	dtA = new Date(2000, 11, 31, 23, 59);
	dtB = new Date(2001, 0, 1, 0, 0);
	jum.assertEquals("add_test32", dtB, dojo.date.add(dtA, interv, 1));

	dtA = new Date(2000, 11, 27, 12, 02);
	dtB = new Date(2000, 11, 27, 13, 02);
	jum.assertEquals("add_test33", dtB, dojo.date.add(dtA, interv, 60));
	
	interv = dojo.date.dateParts.SECOND;
	dtA = new Date(2000, 11, 31, 23, 59, 59);
	dtB = new Date(2001, 0, 1, 0, 0, 0);
	jum.assertEquals("add_test34", dtB, dojo.date.add(dtA, interv, 1));

	dtA = new Date(2000, 11, 27, 8, 10, 59);
	dtB = new Date(2000, 11, 27, 8, 11, 59);
	jum.assertEquals("add_test35", dtB, dojo.date.add(dtA, interv, 60));
	
	// Test environment JS Date doesn't support millisec?
	//interv = dojo.date.dateParts.MILLISECOND;
	//
	//dtA = new Date(2000, 11, 31, 23, 59, 59, 999);
	//dtB = new Date(2001, 0, 1, 0, 0, 0, 0);
	//jum.assertEquals("add_test36", dtB, dojo.date.add(dtA, interv, 1));
	//
	//dtA = new Date(2000, 11, 27, 8, 10, 53, 2);
	//dtB = new Date(2000, 11, 27, 8, 10, 54, 2);
	//jum.assertEquals("add_test37", dtB, dojo.date.add(dtA, interv, 1000));
}


function test_date_diff() {
	var dtA = null; // First date to compare
	var dtB = null; // Second date to compare
	var interv = ''; // Interval to compare on (e.g., year, month)
	
	interv = dojo.date.dateParts.YEAR;
	dtA = new Date(2005, 11, 27);
	dtB = new Date(2006, 11, 27);
	jum.assertEquals("diff_test1", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 31);
	dtB = new Date(2001, 0, 1);
	jum.assertEquals("diff_test2", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.QUARTER;
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2001, 2, 1);
	jum.assertEquals("diff_test3", 4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 1);
	dtB = new Date(2001, 0, 1);
	jum.assertEquals("diff_test4", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.MONTH;
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2001, 2, 1);
	jum.assertEquals("diff_test5", 13, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 1);
	dtB = new Date(2001, 0, 1);
	jum.assertEquals("diff_test6", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.WEEK;
	dtA = new Date(2000, 1, 1);
	dtB = new Date(2000, 1, 8);
	jum.assertEquals("diff_test7", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 1, 28);
	dtB = new Date(2000, 2, 6);
	jum.assertEquals("diff_test8", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 2, 6);
	dtB = new Date(2000, 1, 28);
	jum.assertEquals("diff_test9", -1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.DAY;
	dtA = new Date(2000, 1, 29);
	dtB = new Date(2000, 2, 1);
	jum.assertEquals("diff_test10", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 31);
	dtB = new Date(2001, 0, 1);
	jum.assertEquals("diff_test11", 1, dojo.date.diff(dtA, dtB, interv));
	
	// DST leap -- check for rounding err
	// This is dependent on US calendar, but
	// shouldn't break in other locales
	dtA = new Date(2005, 3, 3);
	dtB = new Date(2005, 3, 4);
	jum.assertEquals("diff_test12", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.WEEKDAY;
	dtA = new Date(2006, 7, 3);
	dtB = new Date(2006, 7, 11);
	jum.assertEquals("diff_test13", 6, dojo.date.diff(dtA, dtB, interv));
	
	// Positive diffs
	dtA = new Date(2006, 7, 4);
	dtB = new Date(2006, 7, 11);
	jum.assertEquals("diff_test14", 5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 5);
	dtB = new Date(2006, 7, 11);
	jum.assertEquals("diff_test15", 5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 6);
	dtB = new Date(2006, 7, 11);
	jum.assertEquals("diff_test16", 5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 7);
	dtB = new Date(2006, 7, 11);
	jum.assertEquals("diff_test17", 4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 7);
	dtB = new Date(2006, 7, 13);
	jum.assertEquals("diff_test18", 4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 7);
	dtB = new Date(2006, 7, 14);
	jum.assertEquals("diff_test19", 5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 7);
	dtB = new Date(2006, 7, 15);
	jum.assertEquals("diff_test20", 6, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 7);
	dtB = new Date(2006, 7, 28);
	jum.assertEquals("diff_test21", 15, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 2, 2);
	dtB = new Date(2006, 2, 28);
	jum.assertEquals("diff_test22", 18, dojo.date.diff(dtA, dtB, interv));
	
	// Negative diffs
	dtA = new Date(2006, 7, 11);
	dtB = new Date(2006, 7, 4);
	jum.assertEquals("diff_test23", -5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 11);
	dtB = new Date(2006, 7, 5);
	jum.assertEquals("diff_test24", -4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 11);
	dtB = new Date(2006, 7, 6);
	jum.assertEquals("diff_test25", -4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 11);
	dtB = new Date(2006, 7, 7);
	jum.assertEquals("diff_test26", -4, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 13);
	dtB = new Date(2006, 7, 7);
	jum.assertEquals("diff_test27", -5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 14);
	dtB = new Date(2006, 7, 7);
	jum.assertEquals("diff_test28", -5, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 15);
	dtB = new Date(2006, 7, 7);
	jum.assertEquals("diff_test29", -6, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 7, 28);
	dtB = new Date(2006, 7, 7);
	jum.assertEquals("diff_test30", -15, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2006, 2, 28);
	dtB = new Date(2006, 2, 2);
	jum.assertEquals("diff_test31", -18, dojo.date.diff(dtA, dtB, interv));

	// Two days on the same weekend -- no weekday diff
	dtA = new Date(2006, 7, 5);
	dtB = new Date(2006, 7, 6);
	jum.assertEquals("diff_test32", 0, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.HOUR;
	dtA = new Date(2000, 11, 31, 23);
	dtB = new Date(2001, 0, 1, 0);
	jum.assertEquals("diff_test33", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 31, 12);
	dtB = new Date(2001, 0, 1, 0);
	jum.assertEquals("diff_test34", 12, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.MINUTE;
	dtA = new Date(2000, 11, 31, 23, 59);
	dtB = new Date(2001, 0, 1, 0, 0);
	jum.assertEquals("diff_test35", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 1, 28, 23, 59);
	dtB = new Date(2000, 1, 29, 0, 0);
	jum.assertEquals("diff_test36", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.SECOND;
	dtA = new Date(2000, 11, 31, 23, 59, 59);
	dtB = new Date(2001, 0, 1, 0, 0, 0);
	jum.assertEquals("diff_test37", 1, dojo.date.diff(dtA, dtB, interv));
	
	interv = dojo.date.dateParts.MILLISECOND;
	dtA = new Date(2000, 11, 31, 23, 59, 59, 999);
	dtB = new Date(2001, 0, 1, 0, 0, 0, 0);
	jum.assertEquals("diff_test38", 1, dojo.date.diff(dtA, dtB, interv));
	
	dtA = new Date(2000, 11, 31, 23, 59, 59, 0);
	dtB = new Date(2001, 0, 1, 0, 0, 0, 0);
	jum.assertEquals("diff_test39", 1000, dojo.date.diff(dtA, dtB, interv));
}
