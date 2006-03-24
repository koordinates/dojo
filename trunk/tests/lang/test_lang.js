dojo.require("dojo.lang");

function test_lang_mixin(){
	var src = {
		foo: function(){
			jum.debug("foo");
		},
		bar: "bar"
	};
	var dest = {};
	dojo.lang.mixin(dest, src);
	jum.assertEquals("10", "function", typeof dest["foo"]);
	jum.assertEquals("11", "string", typeof dest["bar"]);
}

function test_lang_extend(){
	var src = {
		foo: function(){
			jum.debug("foo");
		},
		bar: "bar"
	};
	function dest(){}
	dojo.lang.extend(dest, src);
	var test = new dest();
	jum.assertEquals("20", "function", typeof test["foo"]);
	jum.assertEquals("21", "string", typeof test["bar"]);
}

function test_lang_forEach(){
	var foo = new Array(128, "bbb", 512);
	var bar = { 'alpha': 2, 'beta': 16, 'delta': 'samiam' };
	var ok = true;
	dojo.lang.forEach(foo, function(elt, idx){
		switch (idx) {
			case 0: ok = (elt==128); break;
			case 1: ok = (elt=="bbb"); break;
			case 2: ok = false; break;
		}
		return (!ok || idx == 1 ? 'break' : '');
	});
	jum.assertTrue("30", ok);
	
	var ok = true;
	dojo.lang.forEach(bar, function(elt, idx){
		switch(idx) {
			case 0: ok = (elt==12); break;
			case 1: ok = (elt==16); break;
			case 2: ok = false; break;
		}
		return (!ok || idx == 1 ? 'break' : '');
	});
	jum.assertTrue("31", ok);
}

function test_lang_isObject(){
	jum.assertFalse("40", dojo.lang.isObject(true));
	jum.assertFalse("41", dojo.lang.isObject(false));
	jum.assertFalse("42", dojo.lang.isObject("foo"));
	jum.assertTrue("43", dojo.lang.isObject(new String("foo")));
	jum.assertTrue("44", dojo.lang.isObject(null));
	jum.assertTrue("45", dojo.lang.isObject({}));
	jum.assertTrue("46", dojo.lang.isObject([]));
	jum.assertTrue("47", dojo.lang.isObject(new Array()));
}

function test_lang_isArray(){
	jum.assertTrue("50", dojo.lang.isArray([]));
	jum.assertTrue("51", dojo.lang.isArray(new Array()));
	jum.assertFalse("52", dojo.lang.isArray({}));
}

function test_lang_isString(){
	jum.assertFalse("60", dojo.lang.isString(true));
	jum.assertFalse("61", dojo.lang.isString(false));
	jum.assertTrue("62", dojo.lang.isString("foo"));
	jum.assertTrue("63", dojo.lang.isString(new String("foo")));
	jum.assertFalse("64", dojo.lang.isString(null));
	jum.assertFalse("65", dojo.lang.isString({}));
	jum.assertFalse("66", dojo.lang.isString([]));
}

function test_lang_isNumber(){
	jum.assertTrue("70", dojo.lang.isNumber(0));
	jum.assertFalse("71", dojo.lang.isNumber(false));
	jum.assertFalse("72", dojo.lang.isNumber(true));
	jum.assertFalse("73", dojo.lang.isNumber(null));
	var undef;
	jum.assertFalse("74", dojo.lang.isNumber(undef));
	jum.assertTrue("75", dojo.lang.isNumber(new Number(0)));
	jum.assertTrue("76", dojo.lang.isNumber(new Number(10)));
	jum.assertTrue("77", dojo.lang.isNumber(parseInt("10")));
}

function test_lang_isBoolean(){
	jum.assertFalse("80", dojo.lang.isBoolean(0));
	jum.assertFalse("81", dojo.lang.isBoolean(1));
	jum.assertTrue("82", dojo.lang.isBoolean(false));
	jum.assertTrue("83", dojo.lang.isBoolean(true));
	jum.assertFalse("84", dojo.lang.isBoolean(null));
	jum.assertTrue("85", dojo.lang.isBoolean(new Boolean(false)));
	jum.assertTrue("86", dojo.lang.isBoolean(new Boolean(true)));
}

function test_lang_isUndefined(){
	var undef;
	jum.assertTrue("90", dojo.lang.isUndefined(undef));
	// jum.assertTrue("91", dojo.lang.isUndefined(unfef2));
	jum.assertFalse("92", dojo.lang.isUndefined(false));
	jum.assertFalse("93", dojo.lang.isUndefined(true));
	var undef3 = null;
	jum.assertFalse("94", dojo.lang.isUndefined(undef3));
}
