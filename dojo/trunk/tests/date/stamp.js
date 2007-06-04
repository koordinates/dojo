dojo.provide("tests.date.stamp");

dojo.require("dojo.date.stamp");

tests.register("tests.date.stamp", 
	[
function test_date_iso(t){
	var rfc  = "2005-06-29T08:05:00-07:00";
	var date = dojo.date.stamp.fromISOString(rfc);
	t.is(2005,date.getFullYear());
	t.is(5,date.getMonth());
	t.is(29,date.getDate());
	t.is(15,date.getUTCHours());
	t.is(5,date.getMinutes());
	t.is(0,date.getSeconds());

	rfc  = "2004-02-29";
	date = dojo.date.stamp.fromISOString(rfc);
	t.is(2004,date.getFullYear());
	t.is(1,date.getMonth());
	t.is(29,date.getDate());

	date = new Date(2005,5,29,8,5,0);
	rfc = dojo.date.stamp.toISOString(date);
	//truncate for comparison
	t.is("2005-06",rfc.substring(0,7));

	date = dojo.date.stamp.fromISOString("T18:46:39");
	t.is(18, date.getHours());
	t.is(46, date.getMinutes());
	t.is(39, date.getSeconds());
},

function test_date_iso_tz(t){

	//23:59:59.9942 or 235959.9942
//	var date = dojo.date.stamp.fromISOString("T18:46:39.9942");
//	t.is(18, date.getHours());
//	t.is(46, date.getMinutes());
//	t.is(39, date.getSeconds());
//	t.is(994, date.getMilliseconds());
	
	//1995-02-04 24:00 = 1995-02-05 00:00

	//timezone tests
	var offset = new Date().getTimezoneOffset()/60;
	date = dojo.date.stamp.fromISOString("T18:46:39+07:00");
	t.is(11, date.getUTCHours());

	date = dojo.date.stamp.fromISOString("T18:46:39+00:00");
	t.is(18, date.getUTCHours());

	date = dojo.date.stamp.fromISOString("T18:46:39Z");
	t.is(18, date.getUTCHours());

	date = dojo.date.stamp.fromISOString("T16:46:39-07:00");
	t.is(23, date.getUTCHours());
	
	//+hh:mm, +hhmm, or +hh
	
	//-hh:mm, -hhmm, or -hh
	}
	]
);
