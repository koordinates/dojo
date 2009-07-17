dojo.provide("tests.regexp-face");
dojo.required("tests.regexp");

tests.register("tests.regexp", 
	[
		function test_regexp_escape(t){
			t.assertTrue(new RegExp(dojo.regexp.escapeString("\f\b\n\t\r+.$?*|{}()[]\\/^")).test("TEST\f\b\n\t\r+.$?*|{}()[]\\/^TEST"));
			t.assertTrue(new RegExp(dojo.regexp.escapeString("\f\b\n\t\r+.$?*|{}()[]\\/^", ".")).test("TEST\f\b\n\t\r+X$?*|{}()[]\\/^TEST"));
		}
	]
);
