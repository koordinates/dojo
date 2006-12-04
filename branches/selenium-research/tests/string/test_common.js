dojo.require("dojo.string");

// NOTE: these tests are mostly a port from test_string.html

function test_string_trim(){
	var ws = " This has some white space at the ends! Oh no!    ";
	var trimmed = "This has some white space at the ends! Oh no!";
	jum.assertEquals("test10", trimmed, dojo.string.trim(ws));
}
