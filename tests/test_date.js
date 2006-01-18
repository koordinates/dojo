dojo.require("dojo.date");


function test_date_fromIso8601() {
	var iso  = "20060210T000000Z"
	var date = dojo.date.fromIso8601(iso);
	jum.assertEquals("test1",2006,date.getFullYear());
	jum.assertEquals("test2",1,date.getMonth());
	jum.assertEquals("test3",9,date.getDate());
}

function test_date_fromIso8601Date () {
	
	//YYYY-MM-DD
	var date = dojo.date.fromIso8601Date("2005-02-22");
	jum.assertEquals("test7", 2005, date.getFullYear());
	jum.assertEquals("test8", 1, date.getMonth());
	jum.assertEquals("test9", 22, date.getDate());
	
	//YYYYMMDD
	var date = dojo.date.fromIso8601Date("20050222");
	jum.assertEquals("test10", 2005, date.getFullYear());
	jum.assertEquals("test11", 1, date.getMonth());
	jum.assertEquals("test12", 22, date.getDate());
	
	//YYYY-MM
	var date = dojo.date.fromIso8601Date("2005-08");
	jum.assertEquals("test13", 2005, date.getFullYear());
	jum.assertEquals("test14", 7, date.getMonth());
	
	//YYYYMM
	var date = dojo.date.fromIso8601Date("200502");
	jum.assertEquals("test15", 2005, date.getFullYear());
	jum.assertEquals("test16", 1, date.getMonth());
	
	//YYYY
	var date = dojo.date.fromIso8601Date("2005");
	jum.assertEquals("test17", 2005, date.getFullYear());
	
	//1997-W01 or 1997W01
	var date = dojo.date.fromIso8601Date("2005-W22");
	jum.assertEquals("test18", 2005, date.getFullYear());
	jum.assertEquals("test19", 5, date.getMonth());
	jum.assertEquals("test20", 6, date.getDate());

	var date = dojo.date.fromIso8601Date("2005W22");
	jum.assertEquals("test21", 2005, date.getFullYear());
	jum.assertEquals("test22", 5, date.getMonth());
	jum.assertEquals("test23", 6, date.getDate());
	
	//1997-W01-2 or 1997W012
	var date = dojo.date.fromIso8601Date("2005-W22-4");
	jum.assertEquals("test24", 2005, date.getFullYear());
	jum.assertEquals("test25", 5, date.getMonth());
	jum.assertEquals("test26", 9, date.getDate());

	var date = dojo.date.fromIso8601Date("2005W224");
	jum.assertEquals("test27", 2005, date.getFullYear());
	jum.assertEquals("test28", 5, date.getMonth());
	jum.assertEquals("test29", 9, date.getDate());

		
	//1995-035 or 1995035
	var date = dojo.date.fromIso8601Date("2005-146");
	jum.assertEquals("test30", 2005, date.getFullYear());
	jum.assertEquals("test31", 4, date.getMonth());
	jum.assertEquals("test32", 26, date.getDate());
	
	var date = dojo.date.fromIso8601Date("2005146");
	jum.assertEquals("test33", 2005, date.getFullYear());
	jum.assertEquals("test34", 4, date.getMonth());
	jum.assertEquals("test35", 26, date.getDate());
	
}

function test_date_fromIso8601Time () {
	
	//23:59:59
	var date = dojo.date.fromIso8601Time("18:46:39");
	jum.assertEquals("test36", 18, date.getHours());
	jum.assertEquals("test37", 46, date.getMinutes());
	jum.assertEquals("test38", 39, date.getSeconds());
	
	//235959
	var date = dojo.date.fromIso8601Time("184639");
	jum.assertEquals("test39", 18, date.getHours());
	jum.assertEquals("test40", 46, date.getMinutes());
	jum.assertEquals("test41", 39, date.getSeconds());
	
	//23:59, 2359, or 23
	var date = dojo.date.fromIso8601Time("18:46");
	jum.assertEquals("test42", 18, date.getHours());
	jum.assertEquals("test43", 46, date.getMinutes());

	var date = dojo.date.fromIso8601Time("1846");
	jum.assertEquals("test44", 18, date.getHours());
	jum.assertEquals("test45", 46, date.getMinutes());

	var date = dojo.date.fromIso8601Time("18");
	jum.assertEquals("test46", 18, date.getHours());

	//23:59:59.9942 or 235959.9942
	var date = dojo.date.fromIso8601Time("18:46:39.9942");
	jum.assertEquals("test47", 18, date.getHours());
	jum.assertEquals("test48", 46, date.getMinutes());
	jum.assertEquals("test49", 39, date.getSeconds());
	jum.assertEquals("test50", 994, date.getMilliseconds());

	var date = dojo.date.fromIso8601Time("184639.9942");
	jum.assertEquals("test51", 18, date.getHours());
	jum.assertEquals("test52", 46, date.getMinutes());
	jum.assertEquals("test53", 39, date.getSeconds());
	jum.assertEquals("test54", 994, date.getMilliseconds());
	
	//1995-02-04 24:00 = 1995-02-05 00:00
	
	//TODO: timezone tests
	
	//+hh:mm, +hhmm, or +hh
	
	//-hh:mm, -hhmm, or -hh
	
}

