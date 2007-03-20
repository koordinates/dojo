// can't set djConfig.extraLocale before bootstrapping unit tests, so directly load resources here for specific locales: 

//TODO: move all extra locale references out into separate test file
var partLocaleList = (["en-us", "fr-fr", "en-in"]);

/**
 * Load all the required locales
 */
for(var i = 0 ; i < partLocaleList.length; i ++){
	dojo.requireLocalization("dojo.i18n.cldr","number",partLocaleList[i]);
}

dojo.require("dojo.number");

/**
 * Previous version
 */
function test_number_format() {
	jum.assertEquals("num_0_0", "0123", dojo.number.format(123, {pattern: "0000"}));
	jum.assertEquals("num_0_1", "-12,34,567.890", dojo.number.format(-1234567.89, {pattern: "#,##,##0.000##"}));
	jum.assertEquals("num_0_2", "-12,34,567.89012", dojo.number.format(-1234567.890123, {pattern: "#,##,##0.000##"}));
	jum.assertEquals("num_0_3", "(1,234,567.89012)", dojo.number.format(-1234567.890123, {pattern: "#,##0.000##;(#,##0.000##)"}));
	jum.assertEquals("num_0_4", "(1,234,567.89012)", dojo.number.format(-1234567.890123, {pattern: "#,##0.000##;(#)"}));
	jum.assertEquals("num_0_5", "50.1%", dojo.number.format(0.501, {pattern: "#0.#%"}));
	jum.assertEquals("num_0_6", "98", dojo.number.format(1998, {pattern: "00"}));
	jum.assertEquals("num_0_7", "01998", dojo.number.format(1998, {pattern: "00000"}));
	jum.assertEquals("num_0_8", "0.13", dojo.number.format(0.125, {pattern: "0.##"})); //NOTE: expects round_half_up, not round_half_even
	jum.assertEquals("num_0_9", "0.1250", dojo.number.format(0.125, {pattern: "0.0000"}));
	jum.assertEquals("num_0_10", "0.1", dojo.number.format(0.100004, {pattern: "0.####"}));

	jum.assertEquals("num_1_0", "-12", dojo.number.format(-12.3, {places:0, locale: "en-us"}));
	jum.assertEquals("num_1_1", "-1,234,567.89", dojo.number.format(-1234567.89, {locale: "en-us"}));
	jum.assertEquals("num_1_2", "-12,34,567.89", dojo.number.format(-1234567.89, {locale: "en-in"}));
	jum.assertEquals("num_1_3", "-1,234,568", dojo.number.format(-1234567.89, {places:0, locale: "en-us"}));
	jum.assertEquals("num_1_4", "-12,34,568", dojo.number.format(-1234567.89, {places:0, locale: "en-in"}));
	jum.assertEquals("num_1_5", "-1\xa0000,10", dojo.number.format(-1000.1, {places:2, locale: "fr-fr"}));
	jum.assertEquals("num_1_6", "-1,000.10", dojo.number.format(-1000.1, {places:2, locale: "en-us"}));
	jum.assertEquals("num_1_7", "-1\xa0000,10", dojo.number.format(-1000.1, {places:2, locale: "fr-fr"}));
	jum.assertEquals("num_1_8", "-1,000.10", dojo.number.format(-1000.1, {places:2, locale: "en-us"}));
	jum.assertEquals("num_1_9", "123.46%", dojo.number.format(1.23456, {places:2, locale: "en-us", type: "percent"}));

	//rounding
	jum.assertEquals("num_2_1", "-1,234,568", dojo.number.format(-1234567.89, {places:0, locale: "en-us"}));
	jum.assertEquals("num_2_2", "-12,34,568", dojo.number.format(-1234567.89, {places:0, locale: "en-in"}));
	jum.assertEquals("num_2_3", "-1,000.11", dojo.number.format(-1000.114, {places:2, locale: "en-us"}));
	jum.assertEquals("num_2_4", "-1,000.11", dojo.number.format(-1000.115, {places:2, locale: "en-us"}));
	jum.assertEquals("num_2_5", "-1,000.12", dojo.number.format(-1000.116, {places:2, locale: "en-us"}));
	jum.assertEquals("num_2_6", "-0.00", dojo.number.format(-0.0001, {places:2, locale: "en-us"}));
	jum.assertEquals("num_2_7", "0.00", dojo.number.format(0, {places:2, locale: "en-us"}));

	//change decimal places
	jum.assertEquals("num_2_8", "-1\xa0000,100", dojo.number.format(-1000.1, {places:3, locale: "fr-fr"}));
	jum.assertEquals("num_2_9", "-1,000.100", dojo.number.format(-1000.1, {places:3, locale: "en-us"}));
}

/**
 * Previous version
 */
function test_number_parse() {
	jum.assertEquals("num_3_0", 1000, dojo.number.parse("1000", {locale: "en-us"}));
	jum.assertEquals("num_3_1", 1000.123, dojo.number.parse("1000.123", {locale: "en-us"}));
	jum.assertEquals("num_3_2", 1000, dojo.number.parse("1,000", {locale: "en-us"}));
	jum.assertEquals("num_3_3", -1000, dojo.number.parse("-1000", {locale: "en-us"}));
	jum.assertEquals("num_3_4", -1000.123, dojo.number.parse("-1000.123", {locale: "en-us"}));
	jum.assertEquals("num_3_5", -1234567.89, dojo.number.parse("-1,234,567.89", {locale: "en-us"}));
	jum.assertEquals("num_3_6", -1234567.89, dojo.number.parse("-1 234 567,89", {locale: "fr-fr"}));
	jum.assertEquals("num_3_7", NaN, dojo.number.parse("-1 234 567,89", {locale: "en-us"}));

	//invalid - NaN
	jum.assertEquals("num_3_8", NaN, dojo.number.parse("10,00", {locale: "en-us"}));
	jum.assertEquals("num_3_9", NaN, dojo.number.parse("1000.1", {locale: "fr-fr"}));

	//test whitespace
//	jum.assertEquals("num_3_10", -1234567, dojo.number.parse("  -1,234,567  ", {locale: "en-us"}));

//	jum.assertTrue("num_3_11", dojo.number.parse("9.1093826E-31"));
	jum.assertEquals("num_3_12", 0.501, dojo.number.parse("50.1%", {pattern: "#0.#%"}));

	jum.assertEquals("num_4_0", 123.4, dojo.number.parse("123.4", {pattern: "#0.#"}));
	jum.assertEquals("num_4_1", -123.4, dojo.number.parse("-123.4", {pattern: "#0.#"}));
	jum.assertEquals("num_4_2", 123.4, dojo.number.parse("123.4", {pattern: "#0.#;(#0.#)"}));
	jum.assertEquals("num_4_3", -123.4, dojo.number.parse("(123.4)", {pattern: "#0.#;(#0.#)"}));
}


/*************************************************************************************************
 * Evan:The following test cases are referred from ICU4J 3.6 (NumberFormatTest etc.) 
 * see http://icu.sourceforge.net/download/3.6.html#ICU4J
 *************************************************************************************************/


/*************************************************************************************************
 *                            dojo.number.format test cases
 *************************************************************************************************/
/**
 * In ICU4J, testing logic for NumberFormat.format() is seperated into 
 * differernt single tese cases. So part of these logic are 
 * collected together in this single method.
 * 
 * !!Failed cases are as follows:
 * 1.1234567890987654321234567890987654321 should be formatted as 
 *   1,234,567,890,987,654,321,234,567,890,987,654,321 with all the default parameters,
 *   but got 1.234 instead, may due to the unimplemeted exponent.
 * 2.\u00a4 and ' are not replaced
 * 	 with pattern "'*&'' '\u00a4' ''&*' #,##0.00"
 *   1.0 should be formatted to "*&' Re. '&* 1.00",but got "'*&'' '\u00a4' ''&*' 1.00" instead
 *   etc.   
 * 		
 */
function test_number_format_icu4j3_6(){
	//print("test_number_format_icu4j3_6() start..............");
	/* !!Failed case, 1.234 returned instead
	//refer to ICU4J's NumberFormatTest.TestCoverage() 
	var bigNum = 1234567890987654321234567890987654321;
	var expectResult = "1,234,567,890,987,654,321,234,567,890,987,654,321";
	checkFormatParseCycle(null,bigNum,expectResult,false);
	*/	
	
	//in icu4j should throw out an exception when formatting a string,
	//but it seems dojo.number.format can deal with strings
	//return 123,456,789
	dojo.number.format("123456789");
	
	//!!Failed case, \u00a4 and ' are not replaced
	/*
	var options = {pattern:"'*&'' '\u00a4' ''&*' #,##0.00",locale:"en-us"};
	check(options,1.0, "*&' Re. '&* 1.00");
	check(options,-2.0, "-*&' Rs. '&* 2.00");	

	options = {pattern:"#,##0.00 '*&'' '\u00a4' ''&*'",locale:"en-us"};
	check(options,1.0,"1.00 *&' Re. '&*");
	check(options,-2.0,"-2.00 *&' Rs. '&*");
	*/
	//print("test_number_format_icu4j3_6() end..............\n");
}

/**
 * Refer to ICU4J's NumberFormatTest.TestPatterns() which now only coveres us locale	
 */
function test_number_format_patterns(){
	//print("test_number_format_Patterns() start..............");
	var patterns = (["#0.#", "#0.", "#.0", "#"]);
	var patternsLength = patterns.length;    
	var num = (["0","0", "0.0", "0"]);
	var options;
	//icu4j result seems doesn't work as:
	//var num = (["0","0.", ".0", "0"]);      
	for (var i=0; i<patternsLength; ++i)
	{	
		options = {pattern:patterns[i],locale:"en-us"};
		checkFormatParseCycle(options,0,num[i],false);       
	}
	
	//!!Failed case
	//In ICU4J:
	//        unquoted special characters in the suffix are illegal
	//        so "000.000|###" is illegal; "000.000'|###'" is legal
	//dojo.number.format:
	//        when formatting 1.2 with illegal pattern "000.000|###"
	//		  no exception was thrown but got "001.200|###" instead.
	
	/*
	patterns = (["000.000|###","000.000'|###'"]);
	var exception = false;
	var result;
	for(var i = 0; i < patterns.length; i ++){
		try{
			//"001.200'|###'" is return for "000.000'|###'"
			//"001.200|###" is return for "000.000|###"
			result = dojo.number.format(1.2,{pattern:patterns[i]});
			print("["+i+"] 1.2 is formatted to " + result + " with pattern " + patterns[i]);
		}catch(e){
			exception = true;
		}
		if(exception && i==1){
			throw "["+i+"]Failed when formatting 1.2 using legal pattern " + patterns[i];
		}else if(!exception && i==0){
			throw "["+i+"]Failed when formatting 1.2 using illegal pattern  " + patterns[i];
		}
	}*/	
	//print("test_number_format_Patterns() end..............\n");
}

/**
 * TODO: For dojo.number future version 
 * Refer to ICU4J's NumberFormatTest.TestExponential()
 */
function test_number_format_exponential(){}

/**
 * TODO: Failed case
 * Refer to ICU4J's NumberFormatTest.TestQuotes()
 */
function test_number_format_quotes(){
	//print("test_number_format_Quotes() start..............");
	//TODO: add more locales 
	
	//TODO:!!Failed case	
	//Pattern "s'aa''s'c#" should format 6666 to "saa'sc6666", but got s'aa''s'c6666 instead
	// is this case necessary?
	/*
	var pattern = "s'aa''s'c#";   
	var result = dojo.number.format(6666,{pattern:pattern,locale:"en-us"});
	var expectResult = "saa'sc6666";
	jum.assertEquals(("FAIL: Pattern  " + pattern + " should format "+ 6666+ " as " + expectResult +
      	"; but " + result + " instead"),expectResult,result);
	*/
	//print("test_number_format_Quotes() end..............");     
}

/**
 * Refer to ICU4J's NumberFormatTest.TestRounding487() and NumberFormatTest.TestRounding()
 */
function test_number_format_rounding(){
	//print("test_number_format_rounding() start..............");
	rounding(0.000179999, 5, "0.00018");
	rounding(0.00099, 4, "0.001");
	rounding(17.6995, 3, "17.7");
	rounding(15.3999, 0, "15");
	rounding(-29.6, 0, "-30");
	
	//TODO refer to NumberFormatTest.TestRounding()
	
	//print("test_number_format_rounding() end..............");
}

/**
 * TODO: For dojo.number future version
 * Refer to ICU4J's NumberFormatTest.TestScientific()- Exponential testing 
 * Refer to ICU4J's NumberFormatTest.TestScientific2() 
 * Refer to ICU4J's NumberFormatTest.TestScientificGrouping()
 */
function test_number_format_scientific(){}

/**
 * TODO: Failed case 
 * Refer to ICU4J's NumberFormatTest.TestPerMill()
 */

function test_number_format_perMill(){
	//print("test_number_format_PerMill() start..............");
	var pattern;
	var result;
	var expectResult;
	
    //TODO: !!Failed case - ###.###\u2030(\u2030 is ‰)
	//Pattern ###.###\u2030 should format 0.4857 as 485.7\u2030,but got 485.700\u2030 instead    
	pattern = "###.###\u2030";
	expectResult = "485.7\u2030";
	result = dojo.number.format(0.4857,{pattern:pattern});
	jum.assertEquals(("FAIL: Pattern  " + pattern + " should format 0.4857 as " + expectResult +
      	"; but" + result + " instead"),expectResult,result);

    //TODO: !!Failed mile percent case - ###.###m
	//Pattern "###.###m" should format 0.4857 to 485.7m, but got 0.485m instead
	/*
	pattern = "###.###m";
	expectResult = "485.7m";
	result = dojo.number.format(0.4857,{pattern:pattern,locale:"en"});
	jum.assertEquals(("FAIL: Pattern  " + pattern + " should format 0.4857 as " + expectResult +
      	"; but" + result + " instead"),expectResult,result);	
	*/
	//print("test_number_format_PerMill() end..............\n");
}


/**
 * Only test en-us and en-in 
 * Refer to ICU4J's NumberFormatTest.TestSecondaryGrouping()
 */
function test_number_format_grouping(){
	//print("test_number_format_Grouping() start..............");
	//primary grouping
	var sourceInput = 123456789;
	var expectResult = "12,34,56,789";
	var options = {pattern:"#,##,###",locale:"en-us"};	

	//step1: 123456789 formated=> 12,34,56,789
	//step2:12,34,56,789 parsed=> 123456789 => formated => 12,34,56,789
	checkFormatParseCycle(options,sourceInput,expectResult,true);
						  
	//TODO: sencondary grouping not implemented yet ?
	//Pattern "#,###" and secondaryGroupingSize=4 should format 123456789 to "12,3456,789"			
	
	//Special case for "en-in" locale
	//1876543210 should be formated as 1,87,65,43,210 in "en-in" (India)
	sourceInput = 1876543210;
	expectResult = "1,87,65,43,210";
	var result = dojo.number.format(sourceInput,{locale:"en-in"});
	jum.assertEquals(("FAIL: in \"en-in\" locale,1876543210 should  be formated to 1,87,65,43,210; " +
  		" but" + result + " instead"),expectResult,result);   
	//print("test_number_format_Grouping() end..............\n");    
}

/**
 * TODO:!!Failed cases:
 * According to ICU4J test criteria:
 * 1.with pattern "*^##.##":
 * 	 0 should be formatted to "^^^^0",but got "*^0" instead,
 *   -1.3 should be formatted to "^-1.3",but got "-*^1.3" instead.
 *   
 * 2.with pattern "##0.0####*_ 'g-m/s^2'" :
 *   0 should be formatted to "0.0______ g-m/s^2",but got ":0.0*_ 'g-m/s^2'" instead
 *   1.0/3 should be formatted to "0.33333__ g-m/s^2",but got "0.33333*_ 'g-m/s^2'" instead
 *   
 * 3.with pattern "*x#,###,###,##0.0#;*x(###,###,##0.0#)":
 * 	 -10 should be formatted to "xxxxxxxxxx(10.0)",but got "*x(10.0)" instead.
 *   10 should be formatted to "xxxxxxxxxxxx10.0",but got "*x10.0" instead.
 *   ......
 *   -1120456.37 should be formatted to "xx(1,120,456.37)",but got "*x(1,120,456.37)" instead.
 *   1120456.37 should be formatted to "xxxx1,120,456.37",but got "*x1,120,456.37" instead.
 *   -1252045600.37 should be formatted to "(1,252,045,600.37)",but got "*x(1,252,045,600.37)" instead.
 *   1252045600.37 should be formatted to "10,252,045,600.37",but got "*x10,252,045,600.37" instead.
 *   
 * 4.with pattern "#,###,###,##0.0#*x;(###,###,##0.0#*x)"
 * 	 -10 should be formatted to (10.0xxxxxxxxxx),but got "(10.0*x)" instead.
 *   10 should be formatted to "10.0xxxxxxxxxxxx",but got "10.0*x" instead.
 *   ......
 *   -1120456.37 should be formatted to "(1,120,456.37xx)",but got "(1,120,456.37*x)" instead.
 *   1120456.37 should be formatted to "xxxx1,120,456.37",but got "1,120,456.37*x" instead.
 *   -1252045600.37 should be formatted to "(1,252,045,600.37)",but got "(1,252,045,600.37*x)" instead.
 *   1252045600.37 should be formatted to ""10,252,045,600.37"",but got "10,252,045,600.37*x" instead.*   
 * 
 * Refer to ICU4J's NumberFormatTest.TestPad()
 */
/*
function test_number_format_pad(){
	var locale = "en-us";
	print("test_number_format_Pad() start..............");
	var options = {pattern:"*^##.##",locale:locale};

	check(options,0,"^^^^0");
	check(options,-1.3,"^-1.3");	
	
	
	options = {pattern:"##0.0####*_ 'g-m/s^2'",locale:locale};
	check(options,0,"0.0______ g-m/s^2");	
	checkFormatParseCycle(options,1.0/3,"0.33333__ g-m/s^2",true);	
	
	//exponent not implemented
	//options = {pattern:"##0.0####E0*_ 'g-m/s^2'",locale:locale};
	//check(options,0,"0.0E0______ g-m/s^2");
	//checkFormatParseCycle(options,1.0/3,"333.333E-3_ g-m/s^2",true);
	
	// Test padding before a sign
	options = {pattern:"*x#,###,###,##0.0#;*x(###,###,##0.0#)",locale:locale};

	check(options,-10,"xxxxxxxxxx(10.0)");
	check(options,-1000, "xxxxxxx(1,000.0)");
	check(options,-1000000, "xxx(1,000,000.0)");
	check(options,-100.37, "xxxxxxxx(100.37)");
	check(options,-10456.37, "xxxxx(10,456.37)");
	check(options,-1120456.37, "xx(1,120,456.37)");
	check(options,-112045600.37, "(112,045,600.37)");    
	check(options,-1252045600.37, "(1,252,045,600.37)");


	check(options,10, "xxxxxxxxxxxx10.0");
	check(options,1000, "xxxxxxxxx1,000.0");
	check(options,1000000, "xxxxx1,000,000.0");
	check(options,100.37, "xxxxxxxxxx100.37");
	check(options,10456.37, "xxxxxxx10,456.37");        
	check(options,1120456.37, "xxxx1,120,456.37");
	check(options,112045600.37, "xx112,045,600.37");
	check(options,10252045600.37, "10,252,045,600.37");

	// Test padding between a sign and a number
	options = {pattern:"#,###,###,##0.0#*x;(###,###,##0.0#*x)",locale:locale};
	check(options, -10, "(10.0xxxxxxxxxx)");
	check(options, -1000, "(1,000.0xxxxxxx)");
	check(options, -1000000, "(1,000,000.0xxx)");
	check(options, -100.37, "(100.37xxxxxxxx)");
	check(options, -10456.37, "(10,456.37xxxxx)");    
	check(options, -1120456.37, "(1,120,456.37xx)");
	check(options, -112045600.37, "(112,045,600.37)");   
	check(options, -1252045600.37, "(1,252,045,600.37)");  

	check(options, 10, "10.0xxxxxxxxxxxx");
	check(options, 1000, "1,000.0xxxxxxxxx");
	check(options, 1000000, "1,000,000.0xxxxx");
	check(options, 100.37, "100.37xxxxxxxxxx");
	check(options, 10456.37, "10,456.37xxxxxxx");
	check(options, 1120456.37, "1,120,456.37xxxx");
	check(options, 112045600.37, "112,045,600.37xx");
	check(options, 10252045600.37, "10,252,045,600.37");	
	
	//Not implemented yet,refer to NumberFormatTest.TestPatterns2()
	//For future use - maily test pad patterns
	print("test_number_format_Pad() end..............");
}
*/

/*************************************************************************************************
 *                            dojo.number.parse test cases
 *************************************************************************************************/

/**
 * In ICU4J, testing logic for NumberFormat.parse() is seperated into 
 * differernt single tese cases. So part of these logic are 
 * collected together in this test case. * 
 */
function test_number_parse_icu4j3_6(){
	//print("test_number_parse_icu4j3_6() start..............");
	//Refer to ICU4J's NumberFormatTest.TestParse() which is only a rudimentary version
	var pattern = "00";
	var str = "0.0";	
	var result = dojo.number.parse(str,{pattern:pattern,locale:"en-us"});
	//TODO: add more locales
	jum.assertEquals(("Fail: pattern "+ pattern +"should parse "+ 
					str + " as 0; but "+ result + " instead"),0,result);	


	/**************************************** tolerant parse *****************************************
	 * refere to ICU4J's NumberFormatTest.TestStrictParse()��
	 * TODO: Seems dojo.number parses string in a tolerant way.  
	 */
	 var options = {locale:"en"};
	/*
	 * TODO: !!Failed case,Should all pass,
	 * but the following elements failed (all parsed to NaN):
	 * [1]-"0 ",[2]-"0.",[3]-"0,",[5]-"0. ",[6]-"0.100,5",
	 * [7]-".00",[9]-"12345, ",[10]-"1,234, ",[12]-"0E" 
	 */
	var passData = ([            
		"0",           //[0] single zero before end of text is not leading
        //"0 ",        //[1] single zero at end of number is not leading
        //"0.",        //[2] single zero before period (or decimal, it's ambiguous) is not leading
        //"0,",          //[3] single zero before comma (not group separator) is not leading
        "0.0",         //[4] single zero before decimal followed by digit is not leading
        //"0. ",       //[5] same as above before period (or decimal) is not leading
        //"0.100,5",   //[6] comma stops parse of decimal (no grouping)
        //".00",       //[7] leading decimal is ok, even with zeros
        "1234567",     //[8] group separators are not required
        //"12345, ",   //[9] comma not followed by digit is not a group separator, but end of number
        //"1,234, ",   //[10] if group separator is present, group sizes must be appropriate
        "1,234,567"   //[11] ...secondary too
        //,"0E"         //[12]not implemented yet,an exponnent not followed by zero or digits is not an exponent 
         ]);
	runBatchParse(options,passData,true/*tolerant parse*/);	
	
	/* 
	 * TODO:!!Failed case,should all pass,
	 * but the following failed,
	 * [10]-"1,45 that" implies that we partially parse input
	 */
	var failData = ([            
		"00",          //[0] leading zero before zero
        "012",         //[1] leading zero before digit
        "0,456",       //[2] leading zero before group separator
        "1,2",         //[3] wrong number of digits after group separator
        ",0",          //[4] leading group separator before zero
        ",1",          //[5] leading group separator before digit
        ",.02",        //[6] leading group separator before decimal
        "1,.02",       //[7] group separator before decimal
        "1,,200",      //[8] multiple group separators
        "1,45",        //[9] wrong number of digits in primary group
        //"1,45 that",   //[10] wrong number of digits in primary group
        "1,45.34",     //[11] wrong number of digits in primary group
        "1234,567",    //[12] wrong number of digits in secondary group
        "12,34,567",   //[13] wrong number of digits in secondary group
        "1,23,456,7890" //[14] wrong number of digits in primary and secondary groups
		]);
	runBatchParse(options,failData,false);
	
	 options = {pattern:"#,##,##0.#",locale:"en-us"};
	/*
	 * TODO:!!Failed case,shoudl all pass.
	 
	 * but [1] [2] and [3] failed
	 * should be parsed to 1234567,but NaN instead 
	 */
	var mixedPassData = ([            
		"12,34,567"    	//[0]
        //,"12,34,567,"		//[1]
        //"12,34,567, that",//[2]
        //"12,34,567 that"	//[3]
		]);	
	runBatchParse(options,mixedPassData,true/*tolerant parse*/);
	
	/*
	 * TODO:!!Failed case,should all pass,
	 * but actually mixedFailData[2] and mixedFailData[3] passed.
	 * "12,34,56, that " and [3]-"12,34,56 that" should be parsed to 123456,but NaN instead
	 */
	var mixedFailData = ([
        "12,34,56",			//[0]
        "12,34,56,"		//[1]
        //,"12,34,56, that ",//[2]
        //"12,34,56 that",	//[3]
		]);			
	runBatchParse(options,mixedFailData,false);
	

	/**************************************** strict parse ******************************************
	 * TODO:May need to test strict parsing in the future?
	 * e.g. A strict parsing like (with pattern "#,##0.#") 
	 * 1.Leading zeros
	 * 		'00', '0123' fail the parse, but '0' and '0.001' pass
	 * 2.Leading or doubled grouping separators
	 * 		',123' and '1,,234" fail
	 * 3.Groups of incorrect length when grouping is used
	 * 		'1,23' and '1234,567' fail, but '1234' passes
	 * 4.Grouping separators used in numbers followed by exponents
	 * 		'1,234E5' fails, but '1234E5' and '1,234E' pass
	 */	
	//options={locale:"en",strict:true};
	//runBatchParse(options,passData,false/*strict parse*/);
	//runBatchParse(options,failData,false/*strict parse*/);	
	
	//options = {pattern:"#,##,##0.#",locale:"en-us",strict:true};
	//runBatchParse(options,mixedPassData,false/*strict parse*/);
	//runBatchParse(options,mixedFailData,false/*strict parse*/);		

	//print("test_number_parse_icu4j3_6() end..............\n");
}


/**
 * TODO:!!Failed case
 * With pattern "a  b#0c  ",both "a b3456c " and and "a   b1234c   " should be parsed to 3456,but got NaN instead.
 * 
 * Refer to ICU4J's NumberFormatTest.TestWhiteSpaceParsing
 */
function test_number_parse_whiteSpace(){	
    /*
	print("test_number_parse_WhiteSpace() start..............");
   	var pattern = "a  b#0c  ";
	var expectResult = 3456;   
	result =  dojo.number.parse("a b3456c ",{pattern:pattern,locale:"en-us"});
   	jum.assertEquals(("Fail: pattern "+ pattern +"should format a b3456c "+ 
				" as "+expectResult +"; but "+ result + " instead"),expectResult,result);	
	result =  dojo.number.parse("a   b3456c   ",{pattern:pattern,locale:"en-us"});
	jum.assertEquals(("Fail: pattern "+ pattern +"should parse a  b3456c  " + 
		" as "+expectResult + "; but "+ result + " instead"),expectResult,result);
	print("test_number_parse_WhiteSpace() end..............\n");
	*/   
}


/*************************************************************************************************
 *                            Regression test cases
 * These test cases are referred to ICU4J's NumberFormatRegressionTest and NumberFormatRegression.
 * The regression cases in ICU4J are used as unit test cases for bug fixing, 
 * They are inluced here so that dojo.number may avoid those similar bugs. 
 *************************************************************************************************/
/**
 * Refer to ICU4J's NumberFormatRegressionTest.Test4161100()
 */
function test_number_regression_1(){
	checkFormatParseCycle({pattern:"#0.#"},-0.09,"-0.1",false);
}

/**
 * !!Failed case,rounding hasn't been implemented yet.
 * Refer to ICU4J's NumberFormatRegressionTest.Test4408066()
 */
function test_number_regression_2(){
	/*
	var data =   ([-3.75, -2.5, -1.5, 
                   -1.25, 0,    1.0, 
                   1.25,  1.5,  2.5, 
                   3.75,  10.0, 255.5]);
	var expected = (["-4", "-2", "-2",
                    "-1", "0",  "1",
                	"1",  "2",  "2",
                	"4",  "10", "256"]);
	var options = {locale:"zh-cn",round:true};
	for(var i =0; i < data.length; i++){
		checkFormatParseCycle(options,data[i],expected[i],false);
	}	

	data = ([ 	"-3.75", "-2.5", "-1.5", 
              	"-1.25", "0",    "1.0", 
              	"1.25",  "1.5",  "2.5", 
              	"3.75",  "10.0", "255.5"]);
	expected =([ -3, -2, -1,
                 -1, 0,  1,
                 1,  1,  2,
                 3,  10, 255]);
	
	for(var i =0; i < data.length; i++){
		checkParse(options,data[i],expected[i]);
	}
	*/
}

/**
 * Refer to ICU4J's NumberRegression.Test4087535() and Test4243108()
 */
function test_number_regression_3(){
	checkFormatParseCycle({places:0},0,"0",false);
	//TODO:in icu4j,0.1 should be formatted to ".1" when minimumIntegerDigits=0
	checkFormatParseCycle({places:0},0.1,"0",false);	
	checkParse({pattern:"#0.#####"},123.55456,123.55456);
//!! fails because default pattern only has 3 decimal places
//	checkParse(null,123.55456,123.55456);
	
	//See whether it fails first format 0.0 ,parse "99.99",and then reformat 0.0 
	checkFormatParseCycle({pattern:"#.#"},0.0,"0",false);
	checkParse(null,"99.99",99.99);
	checkFormatParseCycle({pattern:"#.#"},0.0,"0",false);
}

/**
 * TODO:
 * In ICU -0.0 and -0.0001 should be formatted to "-0" with FieldPosition(0)
 * dojo.i18n.number format -0.0 to "-0"; -0.0001 to "-0.000100" 
 * 
 * Refer to ICU4J's NumberRegression.Test4088503() and Test4106658()
 */
function test_number_regression_4(){
	checkFormatParseCycle({places:0},123,"123",false);
	
	//TODO: differernt from ICU where -0.0 is formatted to "-0"
	checkFormatParseCycle({locale:"en-us"},-0.0,"0",false);
	
	//TODO: differernt from ICU where -0.0001 is formatted to "-0"
	checkFormatParseCycle({locale:"en-us",places:6},-0.0001,"-0.000100",false);
}

/**
 * !!Failed case,rounding has not implemented yet.
 * 0.00159999 should be formatted as 0.0016 but got 0.0015 instead.
 * Refer to ICU4J's NumberRegression.Test4071492()
 */
function test_number_regression_5(){
	//checkFormatParseCycle({places:4,round:true},0.00159999,"0.0016",false);	
}

/**
 * Refer to ICU4J's NumberRegression.Test4086575()
 */
function test_number_regression_6(){
	var pattern = "###.00;(###.00)";
	var locale = "fr";
	var options = {pattern:pattern,locale:locale};
	
	//no group separator
	checkFormatParseCycle(options,1234,"1234,00",false);
	checkFormatParseCycle(options,-1234,"(1234,00)",false);	
	
	//space as group separator
	pattern = "#,###.00;(#,###.00)";
	options = {pattern:pattern,locale:locale};
	checkFormatParseCycle(options,1234,"1\u00a0234,00",false);// Expect 1 234,00
	checkFormatParseCycle(options,-1234,"(1\u00a0234,00)",false);  // Expect (1 234,00)
}

/**
 * !!Failed case - expontent has not implemented yet 
 * shuold format 1.000000000000001E7 to 10000000.00000001, but got 10,000,000.000 instead
 * Refer to ICU4J's NumberRegression.Test4090489() - loses precision
 */

function test_number_regression_7(){
	//checkFormatParseCycle(null,1.000000000000001E7,"10000000.00000001",false);	
}

/** 
 * !!Failed case
 * 1.with pattern "#,#00.00 p''ieces;-#,#00.00 p''ieces"
 *   3456.78 should be formated to "3,456.78 p'ieces",
 *   but got "3,456.78 p''ieces","''" should be replaced with "'"
 * 2.with illegal pattern "000.0#0"
 * 	 no error for the illegal pattern, and 3456.78 is formatted to 456.780
 * 3.with illegal pattern "0#0.000"
 * 	 no error for the illegal pattern, and 3456.78 is formatted to 3456.780
 * 
 * Refer to ICU4J's NumberRegression.Test4092480(),Test4074454() 
 */
function test_number_regression_8(){
	var patterns = (["#0000","#000","#00","#0","#"]);
	var expect = (["0042","042","42","42","42"]);
	
	for(var i =0; i < patterns.length; i ++){
		checkFormatParseCycle({pattern:patterns[i]},42,expect[i],false);
		checkFormatParseCycle({pattern:patterns[i]},-42,"-"+expect[i],false);	
	}
	
	checkFormatParseCycle({pattern:"#,#00.00;-#.#"},3456.78,"3,456.78",false);
	//!!Failed case
	//checkFormatParseCycle({pattern:"#,#00.00 p''ieces;-#,#00.00 p''ieces"},3456.78,"3,456.78 p'ieces",false);	
	//checkFormatParseCycle({pattern:"000.0#0"},3456.78,null,false);
	//checkFormatParseCycle({pattern:"0#0.000"},3456.78,null,false);	
}

/**
 * TODO
 * Refer to ICU4J's NumberRegression.Test4052223()
 */
function test_number_regression_9(){
	//TODO:only got NaN,need an illegal pattern exception? 
	checkParse({pattern:"#,#00.00"},"abc3");	
	
	//TODO: got NaN instead of 1.222, is it ok?
	//checkParse({pattern:"#,##0.###",locale:"en-us"},"1.222,111",1.222);
	//checkParse({pattern:"#,##0.###",locale:"en-us"},"1.222x111",1.222);
	
	//got NaN for illeal input,ok
	checkParse(null,"hello: ,.#$@^&**10x");	
}

/**
 * Refer to ICU4J's NumberRegression.Test4125885()
 */
function test_number_regression_10(){
	checkFormatParseCycle({pattern:"000.00"},12.34,"012.34",false);
	checkFormatParseCycle({pattern:"+000.00%;-000.00%"},0.1234,"+012.34%",false);
	checkFormatParseCycle({pattern:"##,###,###.00"},9.02,"9.02",false);
	
	var patterns =(["#.00", "0.00", "00.00", "#0.0#", "#0.00"]);
	var expect =  (["1.20", "1.20", "01.20", "1.2",   "1.20" ]);
	for(var i =0 ; i < patterns.length; i ++){
		checkFormatParseCycle({pattern:patterns[i]},1.2,expect[i],false);
	}
}

/**
 * TODO:!!Failed case
 * Make sure that all special characters, when quoted in a suffix or prefix, lose their special meaning.
 * The detail error info :  
 * for input 123
 * pattern:'0'#0'0'; expect:"01230"; but got "'3'#0'0'" instead
 * pattern:','#0','; expect:",123,"; but got "','123','" instead
 * pattern:'.'#0'.'; expect:".123."; but got "'.'123'.'" instead
 * pattern:'‰'#0'‰'; expect:"‰123‰"; but got "'‰'123000'‰'" instead
 * pattern:'%'#0'%'; expect:"%123%"; but got "'%'12300'%'" instead
 * pattern:'#'#0'#'; expect:"#123#"; but got "'123'#0'#'" instead
 * pattern:';'#0';'; expect:";123;"; but got "[dojo-test] FATAL exception raised: 
 * 											  unable to find a number expression in pattern: '"
 * pattern:'E'#0'E'; expect:"E123E"; not implemeted yet
 * pattern:'*'#0'*'; expect:"*123*"; but got "'*'123'*'" instead
 * pattern:'+'#0'+'; expect:"+123+"; but got "'+'123'+'" instead
 * pattern:'-'#0'-'; expect:"-123-"; but got "'-'123'-'" instead
 * 
 * TODO: is it ok to remain "'" in the formatted result as above??
 * 
 * Refer to ICU4J's NumberRegression.Test4212072()
 */
/*
function test_number_regression_11(){
	var specials = ([ '0', ',', '.', '\u2030', '%', '#',';', 'E', '*', '+', '-']);
	var pattern; 
	var expect;
	
	for(var i=0; i < specials.length; i ++){
		pattern = "'" + specials[i] + "'#0'" + specials[i] + "'";
		expect = "" +  specials[i] + "123" +  specials[i];
		checkFormatParseCycle({pattern:pattern,locale:"en-us"},123,expect,false);
	}
}*/


/**
 * TODO: add more rounding test cases, refer to ICU4J's NumberRegression.Test4071005(),Test4071014() etc.. 
 */

/**
 * TODO:Decimal format doesnt round a double properly when the number is less than 1
 * 
 * Refer to ICU4J's NumberRegression.test4241880()
 */
/*
function test_number_regression_12(){
	var input = ([ .019, .009, .015, .016, .014,
                	.004, .005, .006, .007, .008,
                	.5, 1.5, .05, .15, .005,
                	.015, .0005, .0015]);
	var patterns = (["##0%", "##0%", "##0%", "##0%", "##0%",
                	 "##0%", "##0%", "##0%", "##0%", "##0%",
                	 "#,##0", "#,##0", "#,##0.0", "#,##0.0", "#,##0.00",
                	 "#,##0.00", "#,##0.000", "#,##0.000"]);
	var expect =([   "2%", "1%", "2%", "2%", "1%",
                	 "0%", "0%", "1%", "1%", "1%",
                	 "0", "2", "0.0", "0.2", "0.00",
                	 "0.02", "0.000", "0.002",]);
	for(var i = 0; i <input.length; i ++){
		checkFormatParseCycle({pattern:patterns[i],round:true},input[i],expect[i],false);
	}
}
*/


/*************************************************************************************************
 *                            		utility methods
 *************************************************************************************************/

/**
 * Refer to ICU4J's NumberFormatTest.expect(...) 
 */
function check(options,sourceInput,expectResult){
	checkFormatParseCycle(options,sourceInput,expectResult,false);
	checkParse(options,expectResult,sourceInput);	
}

/**
 * Perform a single formatting check or a backward check
 * backward check:number1 -(formatted)-> string1 -(parsed)-> number2 -(formated)-> string2
 * then number should == number2; string1 should == string2
 */
function checkFormatParseCycle(options,sourceInput,expectResult,
		 backwardCheck/*boolean,indicates whether need a backward chain check,like formate->parse->format*/){	
	if(null != options){
		var pattern = options.pattern;
		var locale = options.locale;
		//TODO: add more fields
	}
	
	//print("\n");
	var str = null==pattern?"default":pattern;
	//print("pattern:" + str + "| locale:" + locale);
	//print("input:" + sourceInput);
	var result = dojo.number.format(sourceInput,options);
	//print("result:" + result);
	if(null != expectResult){
	    jum.assertEquals(("Fail: " + str + " pattern should format " + sourceInput + 
		" to "+expectResult + "; but "+ result + " instead"),expectResult,result);
	}
	if(backwardCheck){
		var resultParsed = dojo.number.parse(result,options);
		//print("resultParsed:" + resultParsed);		
		if(!decimalNumberDiff(sourceInput,resultParsed)){	
		    jum.assertEquals(("Fail: " + str + " pattern should parse " + result + 
					 " to "+sourceInput + "; but "+ resultParsed + " instead"),
					 sourceInput,resultParsed);
		}		
		var resultParsedReformatted = dojo.number.format(resultParsed,options);
		//print("resultParsedReformatted:" + resultParsedReformatted);
	    if(!decimalNumberDiff(result,resultParsedReformatted)){
			jum.assertEquals(("Fail: " + str + " pattern should parse and reformat " + result + 
							 " to "+result + "; but "+ resultParsedReformatted + " instead"),
							 result,resultParsedReformatted);
		}		
	}	
}

/**
 * Perform a single parsing check
 */
function checkParse(options,sourceInput,expectResult){
	var str = "default";
	if(null != options && null != options.pattern){	
		str = options.pattern;
	}
	//print("input:" + sourceInput);
	var result = dojo.number.parse(sourceInput,options);
	//print("result :" + result);
	if(null != expectResult){
	    jum.assertEquals(("Fail: "+ str +" pattern should parse " + sourceInput + 
			 " to "+ expectResult + "; but "+ result + " instead"),expectResult,result);
	}
}

/**
 * //TODO:Round a given number
 */
function rounding(number,maxFractionDigits,expected){
	var pattern="#0.";
	for(var i=0; i<maxFractionDigits; i++){pattern += "#";}
	var result = dojo.number.format(number,{pattern:pattern});
	jum.assertEquals(("Fail: " + number +" should be rounded to "+
	 expected +" but "+ result + " instead"),expected,result);	
}

/**
 * Run a batch parsing
 */
function runBatchParse(options,dataArray/*array*/,pass/*boolean*/){
	var exception = null;
	var result;
	var i=0;
	var str = (null==options.pattern)?"default":options.pattern;
	
	//print("\n");
	for(; i<dataArray.length; i++){
		try{
			//print("["+i+"]"+"input:"+dataArray[i]);
			result = dojo.number.parse(dataArray[i],options);			
			if(isNaN(result)){
				throw "\"" + dataArray[i] + "\" is parsed to NaN with pattern " + str;
			}
			//print("["+i+"]"+"output:"+result);	
		}catch(e){
			exception = e;
			break;
		}
	}
		
	if(!pass && (exception == null)) {
		throw "runBatchParse() - stric parse failed, no exception when parsing illegal data"; 
	}else if(exception != null){
		if(!pass && i == 0){
			//strict parsing should fail for all the dataArray elements as expected
			//pass condition for strict parsing
			return;
		}
		throw "runBatchParse() failed: " + exception;		
	}
}

/**
 * Check whether the given two numbers differ under the decimal bound
 * 
 */
function decimalNumberDiff(num1,num2){
	//TODO: should be more accurate when dojo.number finish rounding in the future
	var diffBound = 1e-3;
	var diff = num1 - num2;
	//print("Math.abs(diff) " + Math.abs(diff));
	if(Math.abs(diff) < diffBound ){
		return true;
	}else if(isNaN(Math.abs(diff))){	
		var s = num1.toString().split(num2);
		s[1] = s[1].replace(",","0");
		s[1] = s[1].replace('\u066b','0');
		return (new Number(s[1])< diffBound);
	}
	return false;	
}

