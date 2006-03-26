dojo.require("dojo.lang.array");

function test_lang_find() {
	var foo = new Array(128, 256, 512);
	var bar = new Array("aaa", "bbb", "ccc");
	
	jum.assertTrue("500", dojo.lang.find(56, [45, 56, 85]) == 1);
	jum.assertTrue("501", dojo.lang.find([Number, String, Date], String) == 1);
	jum.assertTrue("502", dojo.lang.find(String, [Number, String, Date]) == 1); // bug #348 -- http://trac.dojotoolkit.org/ticket/348
	jum.assertTrue("503", dojo.lang.find(foo[2], foo) == 2);
	jum.assertTrue("504", dojo.lang.find(foo, foo[2]) == 2);
	jum.assertTrue("505", dojo.lang.find(bar[2], bar) == 2);
	jum.assertTrue("506", dojo.lang.find(bar, bar[2]) == 2);
	
	foo.push(bar);
	jum.assertTrue("510", dojo.lang.find(foo, bar) == 3);
	// jum.assertTrue("511", dojo.lang.find(bar, foo) == 3); // bug #359 -- http://trac.dojotoolkit.org/ticket/359
}

function test_lang_has(){
	var tObj = [];
	tObj.push("foo!");
	tObj.foo = "bar";
	jum.assertTrue("510", dojo.lang.has(tObj, 0));
	jum.assertTrue("511", dojo.lang.has(tObj, "foo"));
	jum.assertFalse("512", dojo.lang.has(tObj, "bar"));
	jum.assertFalse("513", dojo.lang.has(tObj, 1));
}

function test_lang_isEmpty(){
	var tObj = {};
	var tArr = [];
	jum.assertTrue("520", dojo.lang.isEmpty(tObj));
	jum.assertTrue("521", dojo.lang.isEmpty(tArr));
	tArr.push("foo");
	jum.assertFalse("522", dojo.lang.isEmpty(tArr));
	tObj.foo = "bar";
	jum.assertFalse("523", dojo.lang.isEmpty(tObj));
}

