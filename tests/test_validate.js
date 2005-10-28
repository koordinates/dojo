dojo.require("dojo.validate");

function test_validate_isText(){
	jum.assertTrue("test1", dojo.validate.isText('            x'));
	jum.assertTrue("test2", dojo.validate.isText('x             '));
	jum.assertTrue("test3", dojo.validate.isText('        x     '));
	jum.assertFalse("test4", dojo.validate.isText('   '));
	jum.assertFalse("test5", dojo.validate.isText(''));
}

function test_validate_isInteger(){
	jum.assertTrue("test1", dojo.validate.isInteger('0'));
	jum.assertTrue("test2", dojo.validate.isInteger('+0'));
	jum.assertTrue("test3", dojo.validate.isInteger('-1'));
	jum.assertTrue("test4", dojo.validate.isInteger('123456789'));
	jum.assertFalse("test5", dojo.validate.isInteger('0123456789'));
	jum.assertFalse("test6", dojo.validate.isInteger('00'));
	jum.assertFalse("test7", dojo.validate.isInteger('1.0'));
}

function test_validate_isNumber(){
	jum.assertTrue("test1", dojo.validate.isNumber('0'));
	jum.assertTrue("test2", dojo.validate.isNumber('+0'));
	jum.assertTrue("test3", dojo.validate.isNumber('-1'));
	jum.assertTrue("test4", dojo.validate.isNumber('123456789'));
	jum.assertFalse("test5", dojo.validate.isNumber('0123456789'));
	jum.assertFalse("test6", dojo.validate.isNumber('00'));
	jum.assertTrue("test7", dojo.validate.isNumber('1.0'));
	jum.assertTrue("test8", dojo.validate.isNumber('0.0000'));
	jum.assertFalse("test9", dojo.validate.isNumber('1.'));
	jum.assertTrue("test10", dojo.validate.isNumber('1234.0012340e63'));
	jum.assertTrue("test11", dojo.validate.isNumber('1234.0012340e+63'));
	jum.assertTrue("test12", dojo.validate.isNumber('1234.0012340e-63'));
	jum.assertFalse("test13", dojo.validate.isNumber('1234.0012340e063'));
	jum.assertFalse("test14", dojo.validate.isNumber('1234.0012340e63.5'));
	jum.assertFalse("test14", dojo.validate.isNumber('01234.0012340e10'));
}

function test_validate_isEmailAddress(){
	jum.assertTrue("test1", dojo.validate.isEmailAddress('x@yahoo.com'));
	jum.assertTrue("test2", dojo.validate.isEmailAddress('x.y.z.w@yahoo.com'));
	jum.assertFalse("test3", dojo.validate.isEmailAddress('x..y.z.w@yahoo.com'));
	jum.assertFalse("test4", dojo.validate.isEmailAddress('x.@yahoo.com'));
	jum.assertFalse("test5", dojo.validate.isEmailAddress('x@z.com'));
	jum.assertFalse("test6", dojo.validate.isEmailAddress('x@yahoo.x'));
	jum.assertTrue("test7", dojo.validate.isEmailAddress('x@yahoo.museum'));
	jum.assertTrue("test8", dojo.validate.isEmailAddress("o'mally@yahoo.com"));
	jum.assertFalse("test9", dojo.validate.isEmailAddress("'mally@yahoo.com"));
	jum.assertTrue("test10", dojo.validate.isEmailAddress("fred&barney@stonehenge.com"));
	jum.assertFalse("test11", dojo.validate.isEmailAddress("fred&&barney@stonehenge.com"));
}

function test_validate_isValidDate(){
	
	// Month date year
	jum.assertTrue("test1", dojo.validate.isValidDate("08/06/2005", "MM/DD/YYYY"));
	jum.assertTrue("test2", dojo.validate.isValidDate("08.06.2005", "MM.DD.YYYY"));
	jum.assertTrue("test3", dojo.validate.isValidDate("08-06-2005", "MM-DD-YYYY"));
	jum.assertTrue("test4", dojo.validate.isValidDate("8/6/2005", "M/D/YYYY"));
	jum.assertTrue("test5", dojo.validate.isValidDate("8/6", "M/D"));
	jum.assertFalse("test6", dojo.validate.isValidDate("09/31/2005", "MM/DD/YYYY"));
	jum.assertFalse("test7", dojo.validate.isValidDate("02/29/2005", "MM/DD/YYYY"));
	jum.assertTrue("test8", dojo.validate.isValidDate("02/29/2004", "MM/DD/YYYY"));

	// year month date
	jum.assertTrue("test9", dojo.validate.isValidDate("2005-08-06", "YYYY-MM-DD"));
	jum.assertTrue("test10", dojo.validate.isValidDate("20050806", "YYYYMMDD"));

	// year month
	jum.assertTrue("test11", dojo.validate.isValidDate("2005-08", "YYYY-MM"));
	jum.assertTrue("test12", dojo.validate.isValidDate("200508", "YYYYMM"));

	// year
	jum.assertTrue("test13", dojo.validate.isValidDate("2005", "YYYY"));

	// year week day
	jum.assertTrue("test14", dojo.validate.isValidDate("2005-W42-3", "YYYY-Www-d"));
	jum.assertTrue("test15", dojo.validate.isValidDate("2005W423", "YYYYWwwd"));
	jum.assertFalse("test16", dojo.validate.isValidDate("2005-W42-8", "YYYY-Www-d"));
	jum.assertFalse("test17", dojo.validate.isValidDate("2005-W54-3", "YYYY-Www-d"));

	// year week
	jum.assertTrue("test18", dojo.validate.isValidDate("2005-W42", "YYYY-Www"));
	jum.assertTrue("test19", dojo.validate.isValidDate("2005W42", "YYYYWww"));

	// year ordinal-day
	jum.assertTrue("test20", dojo.validate.isValidDate("2005-292", "YYYY-DDD"));
	jum.assertTrue("test21", dojo.validate.isValidDate("2005292", "YYYYDDD"));
	jum.assertFalse("test22", dojo.validate.isValidDate("2005-366", "YYYY-DDD"));
	jum.assertTrue("test23", dojo.validate.isValidDate("2004-366", "YYYY-DDD"));

	// date month year
	jum.assertTrue("test24", dojo.validate.isValidDate("19.10.2005", "DD.MM.YYYY"));
	jum.assertTrue("test25", dojo.validate.isValidDate("19-10-2005", "D-M-YYYY"));
}

function test_validate_is24HourTime(){
	jum.assertTrue("test1", dojo.validate.is24HourTime('02:03:59'));
	jum.assertTrue("test2", dojo.validate.is24HourTime('02:53:59.990'));
	jum.assertTrue("test3", dojo.validate.is24HourTime('02:53'));
	jum.assertFalse("test4", dojo.validate.is24HourTime('2:03:59'));
	jum.assertFalse("test5", dojo.validate.is24HourTime('02:3:59'));
	jum.assertFalse("test6", dojo.validate.is24HourTime('02:03:5'));
	jum.assertFalse("test7", dojo.validate.is24HourTime('24:03:59'));
	jum.assertFalse("test8", dojo.validate.is24HourTime('02:60:59'));
	jum.assertFalse("test9", dojo.validate.is24HourTime('02:03:60'));
}

function test_validate_is12HourTime(){
	jum.assertTrue("test1", dojo.validate.is12HourTime('5:15 p.m.'));
	jum.assertTrue("test2", dojo.validate.is12HourTime('5:15:05 pm'));
	jum.assertTrue("test3", dojo.validate.is12HourTime('5:15:05.50 pm'));
	jum.assertFalse("test4", dojo.validate.is12HourTime('05:15:05 pm'));
	jum.assertFalse("test5", dojo.validate.is12HourTime('5:5:05 pm'));
	jum.assertFalse("test6", dojo.validate.is12HourTime('5:15:5 pm'));
	jum.assertFalse("test7", dojo.validate.is12HourTime('13:15:05 pm'));
	jum.assertFalse("test8", dojo.validate.is12HourTime('5:60:05 pm'));
	jum.assertFalse("test9", dojo.validate.is12HourTime('5:15:60 pm'));
	jum.assertTrue("test10", dojo.validate.is12HourTime('5:59:05 pm'));
	jum.assertTrue("test11", dojo.validate.is12HourTime('5:15:59 pm'));
	jum.assertFalse("test12", dojo.validate.is12HourTime('5:15:05'));
}

function test_validate_isIpAddress(){
	jum.assertTrue("test1", dojo.validate.isIpAddress('0.1.10.100'));
	jum.assertTrue("test2", dojo.validate.isIpAddress('000.001.010.100'));
	jum.assertTrue("test3", dojo.validate.isIpAddress('255.255.255.255'));
	jum.assertFalse("test4", dojo.validate.isIpAddress('256.255.255.255'));
	jum.assertFalse("test5", dojo.validate.isIpAddress('255.256.255.255'));
	jum.assertFalse("test6", dojo.validate.isIpAddress('255.255.256.255'));
	jum.assertFalse("test7", dojo.validate.isIpAddress('255.255.255.256'));
}

function test_validate_isUrl(){
	jum.assertTrue("test1", dojo.validate.isUrl('www.yahoo.com'));
	jum.assertTrue("test2", dojo.validate.isUrl('http://www.yahoo.com'));
	jum.assertTrue("test3", dojo.validate.isUrl('https://www.yahoo.com'));
	jum.assertFalse("test4", dojo.validate.isUrl('http://.yahoo.com'));
	jum.assertFalse("test5", dojo.validate.isUrl('http://www.-yahoo.com'));
	jum.assertFalse("test6", dojo.validate.isUrl('http://www.yahoo-.com'));
	jum.assertTrue("test7", dojo.validate.isUrl('http://y-a---h-o-o.com'));
	jum.assertFalse("test8", dojo.validate.isUrl('http://www.y.com'));
	jum.assertTrue("test9", dojo.validate.isUrl('http://www.yahoo.museum'));
	jum.assertTrue("test10", dojo.validate.isUrl('http://www.yahoo.co.uk'));
	jum.assertFalse("test11", dojo.validate.isUrl('http://www.micro$oft.com'));
}

function test_validate_isCurrency(){
	jum.assertTrue("test1", dojo.validate.us.isCurrency('+$1000'));
	jum.assertTrue("test2", dojo.validate.us.isCurrency('1000'));
	jum.assertTrue("test3", dojo.validate.us.isCurrency('$1000.25'));
	jum.assertTrue("test4", dojo.validate.us.isCurrency('$1,000.25'));
	jum.assertTrue("test5", dojo.validate.us.isCurrency('$1,000,000'));
	jum.assertTrue("test6", dojo.validate.us.isCurrency('$10,000,000'));
	jum.assertTrue("test7", dojo.validate.us.isCurrency('$100,000,000'));
	jum.assertFalse("test8", dojo.validate.us.isCurrency('$10,0000,000'));
	jum.assertFalse("test9", dojo.validate.us.isCurrency('$1000,000,00'));
	jum.assertFalse("test10", dojo.validate.us.isCurrency('$10,000,0000'));
}

function test_validate_isPhoneNumber(){
	jum.assertTrue("test1", dojo.validate.us.isPhoneNumber('(111) 111-1111'));
	jum.assertTrue("test2", dojo.validate.us.isPhoneNumber('(111) 111 1111'));
	jum.assertTrue("test3", dojo.validate.us.isPhoneNumber('111 111 1111'));
	jum.assertTrue("test4", dojo.validate.us.isPhoneNumber('111.111.1111'));
	jum.assertTrue("test5", dojo.validate.us.isPhoneNumber('111-111-1111'));
	jum.assertFalse("test6", dojo.validate.us.isPhoneNumber('111/111/1111'));
	jum.assertFalse("test7", dojo.validate.us.isPhoneNumber('111-1111'));
}

function test_validate_isSocialSecurityNumber(){
	jum.assertTrue("test1", dojo.validate.us.isSocialSecurityNumber('123-45-6789'));
	jum.assertTrue("test2", dojo.validate.us.isSocialSecurityNumber('123 45 6789'));
	jum.assertTrue("test3", dojo.validate.us.isSocialSecurityNumber('123456789'));
	jum.assertFalse("test4", dojo.validate.us.isSocialSecurityNumber('123-45 6789'));
	jum.assertFalse("test5", dojo.validate.us.isSocialSecurityNumber('12345 6789'));
	jum.assertFalse("test6", dojo.validate.us.isSocialSecurityNumber('123-456789'));
}

function test_validate_isZipCode(){
	jum.assertTrue("test1", dojo.validate.us.isZipCode('12345-6789'));
	jum.assertTrue("test2", dojo.validate.us.isZipCode('12345 6789'));
	jum.assertTrue("test3", dojo.validate.us.isZipCode('123456789'));
	jum.assertTrue("test4", dojo.validate.us.isZipCode('12345'));
}

function test_validate_isState(){
	jum.assertTrue("test1", dojo.validate.us.isState('NE'));
	jum.assertTrue("test2", dojo.validate.us.isState('ne'));
	jum.assertTrue("test3", dojo.validate.us.isState('CA'));
	jum.assertTrue("test4", dojo.validate.us.isState('Wa'));
}
