dojo.require("dojo.text.*");

// NOTE: these tests are mostly a port from test_text.html

function test_text_trim(){
	var ws = " This has some white space at the ends! Oh no!    ";
	var trimmed = "This has some white space at the ends! Oh no!";
	jum.assertEquals("test10", trimmed, dojo.text.trim(ws));
}

function test_text_paramString(){
	var ps = "This %{string} has %{parameters} %{toReplace}";
	var ps1 = dojo.text.paramString(ps, { string: "area", parameters: "foo"});
	jum.assertEquals("test20", "This area has foo %{toReplace}", ps1);

	var ps2 = dojo.text.paramString(ps, { string: "area", parameters: "foo"}, true);
	jum.assertEquals("test30", "This area has foo ", ps2);
}

function test_text_isBlank(){
	jum.assertTrue("test40", dojo.text.isBlank('   '));
	jum.assertFalse("test50", dojo.text.isBlank('            x'));
	jum.assertFalse("test60", dojo.text.isBlank('x             '));
	jum.assertTrue("test70", dojo.text.isBlank(''));
	jum.assertTrue("test80", dojo.text.isBlank(null));
	jum.assertTrue("test90", dojo.text.isBlank(new Array()));
}

function test_text_capitalize(){
	jum.assertEquals("test100", 'This Is A Bunch Of Words', dojo.text.capitalize('this is a bunch of words'));
	jum.assertEquals("test110", 'Word', dojo.text.capitalize('word'));
	jum.assertEquals("test110", '   ', dojo.text.capitalize('   '));
	jum.assertEquals("test110", '', dojo.text.capitalize(''));
	jum.assertEquals("test110", '', dojo.text.capitalize(null));
	jum.assertEquals("test110", '', dojo.text.capitalize(new Array()));
}
