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

function test_lang_extendPrototype(){
	var src = {
		foo: function(){
			jum.debug("foo");
		},
		bar: "bar"
	};
	function dest(){};
	dojo.lang.extendPrototype(dest.prototype, src);
	var test = new dest();
	jum.assertEquals("30", "function", typeof test["foo"]);
	jum.assertEquals("31", "string", typeof test["bar"]);
}

function test_lang_setTimeout(){
	jum.debug("cannot test setTimeout in a pure Rhino envionment");
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

function test_lang_isNumeric() {
	var number365 = new Number(365);
	var numberFoo = new Number("foo");
	var string365 = new String("365");
	var stringFoo = new String("foo");
	var booleanFalse = new Boolean(false);
	var error = new Error();
	var undef; // undefined

	jum.assertTrue("100", dojo.lang.isNumeric(12345));
	jum.assertTrue("101", dojo.lang.isNumeric("12345"));
	jum.assertTrue("102", dojo.lang.isNumeric(number365));
	jum.assertTrue("103", dojo.lang.isNumeric(string365));

	jum.assertFalse("110", dojo.lang.isNumeric(3/0));
	jum.assertFalse("111", dojo.lang.isNumeric("foo"));
	jum.assertFalse("112", dojo.lang.isNumeric(numberFoo));
	jum.assertFalse("113", dojo.lang.isNumeric(false));
	jum.assertFalse("114", dojo.lang.isNumeric(true));
	jum.assertFalse("115", dojo.lang.isNumeric(stringFoo));
	jum.assertFalse("116", dojo.lang.isNumeric(null));
	jum.assertFalse("117", dojo.lang.isNumeric(undef));
	jum.assertFalse("118", dojo.lang.isNumeric([]));
	jum.assertFalse("119", dojo.lang.isNumeric(error));
	// dojo.log.debug("leaving test_lang_isNumeric()");
}

function test_lang_isPureObject() {
	var undef; // undefined

	jum.assertTrue("120", dojo.lang.isPureObject(new Object()));
	jum.assertTrue("120", dojo.lang.isPureObject({a: 1, b: 2}));

	jum.assertFalse("121", dojo.lang.isPureObject([1, 2]));
	jum.assertFalse("122", dojo.lang.isPureObject(new Number(365)));
	jum.assertFalse("123", dojo.lang.isPureObject(new String("foo")));
	jum.assertFalse("124", dojo.lang.isPureObject(test_lang_isPureObject));
	jum.assertFalse("125", dojo.lang.isPureObject(new Boolean(true)));
	jum.assertFalse("126", dojo.lang.isPureObject(365));
	jum.assertFalse("127", dojo.lang.isPureObject("foo"));
	jum.assertFalse("128", dojo.lang.isPureObject(true));
	jum.assertFalse("129", dojo.lang.isPureObject(null));
	jum.assertFalse("130", dojo.lang.isPureObject(undef));
	jum.assertFalse("131", dojo.lang.isPureObject(new Error()));
	// dojo.log.debug("leaving test_lang_isPureObject()");
}

function test_lang_isOfType() {
	var number365 = new Number(365);
	var stringFoo = new String("foo");
	var booleanFalse = new Boolean(false);
	var undef; // undefined

	jum.assertTrue("200", dojo.lang.isOfType("foo", String));
	jum.assertTrue("201", dojo.lang.isOfType(12345, Number));
	jum.assertTrue("202", dojo.lang.isOfType(false, Boolean));
	jum.assertTrue("203", dojo.lang.isOfType([6, 8], Array));
	jum.assertTrue("204", dojo.lang.isOfType(dojo.lang.isOfType, Function));
	jum.assertTrue("205", dojo.lang.isOfType({foo: "bar"}, Object));
	jum.assertTrue("206", dojo.lang.isOfType(new Date(), Date));
	jum.assertTrue("207", dojo.lang.isOfType(number365, Number));
	jum.assertTrue("208", dojo.lang.isOfType(stringFoo, String));
	jum.assertTrue("209", dojo.lang.isOfType(booleanFalse, Boolean));

	jum.assertTrue("210", dojo.lang.isOfType("foo", "string"));
	jum.assertTrue("211", dojo.lang.isOfType(12345, "number"));
	jum.assertTrue("212", dojo.lang.isOfType(false, "boolean"));
	jum.assertTrue("213", dojo.lang.isOfType([6, 8], "array"));
	jum.assertTrue("214", dojo.lang.isOfType(dojo.lang.isOfType, "function"));
	jum.assertTrue("215", dojo.lang.isOfType({foo: "bar"}, "object"));
	jum.assertTrue("216", dojo.lang.isOfType(undef, "undefined"));
	jum.assertTrue("217", dojo.lang.isOfType(number365, "number"));
	jum.assertTrue("218", dojo.lang.isOfType(stringFoo, "string"));
	jum.assertTrue("219", dojo.lang.isOfType(booleanFalse, "boolean"));

	jum.assertTrue("220", dojo.lang.isOfType("foo", [Number, String, Boolean]));
	jum.assertTrue("221", dojo.lang.isOfType(12345, [Number, String, Boolean]));
	jum.assertTrue("222", dojo.lang.isOfType(false, [Number, String, Boolean]));

	jum.assertTrue("223", dojo.lang.isOfType("foo", ["number", String, "boolean"]));
	jum.assertTrue("224", dojo.lang.isOfType(12345, ["number", String, Boolean]));
	jum.assertTrue("225", dojo.lang.isOfType(false, ["number", "string", "boolean"]));

	jum.assertTrue("226", dojo.lang.isOfType(undef, ["number", "undefined"]));
	jum.assertTrue("227", dojo.lang.isOfType(undef, ["number", "optional"]));
	jum.assertTrue("228", dojo.lang.isOfType(12345, ["number", "optional"]));

	jum.assertFalse("230", dojo.lang.isOfType(undef, String));
	jum.assertFalse("231", dojo.lang.isOfType(undef, Number));
	jum.assertFalse("232", dojo.lang.isOfType(undef, [Boolean]));
	jum.assertFalse("233", dojo.lang.isOfType(undef, Array));
	jum.assertFalse("234", dojo.lang.isOfType(undef, Function));
	jum.assertFalse("235", dojo.lang.isOfType(undef, Object));
	jum.assertFalse("236", dojo.lang.isOfType(undef, Date));
	jum.assertFalse("237", dojo.lang.isOfType(undef, [String, Number, Boolean]));
	jum.assertFalse("238", dojo.lang.isOfType(undef, "string"));
	jum.assertFalse("239", dojo.lang.isOfType(undef, ["string", "number"]));

	jum.assertFalse("240", dojo.lang.isOfType(12345, String));
	jum.assertFalse("241", dojo.lang.isOfType("foo", "numeric"));
	jum.assertFalse("242", dojo.lang.isOfType(12345, Boolean));
	jum.assertFalse("243", dojo.lang.isOfType(false, [Array]));
	jum.assertFalse("244", dojo.lang.isOfType(new Date(), Function));
	jum.assertFalse("245", dojo.lang.isOfType("foo", Object));
	jum.assertFalse("246", dojo.lang.isOfType([6, 8], Date));
	jum.assertFalse("247", dojo.lang.isOfType([6, 8], [String, Number, Boolean]));
	jum.assertFalse("248", dojo.lang.isOfType(12345, "string"));
	jum.assertFalse("249", dojo.lang.isOfType(true, "string"));
	jum.assertFalse("250", dojo.lang.isOfType({foo: "bar"}, ["string", "number"]));
	jum.assertFalse("251", dojo.lang.isOfType(number365, "pureobject"));
	jum.assertFalse("252", dojo.lang.isOfType(stringFoo, "pureobject"));
	jum.assertFalse("253", dojo.lang.isOfType(booleanFalse, "pureobject"));
	jum.assertFalse("254", dojo.lang.isOfType([], "numeric"));

	// dojo.log.debug("leaving test_lang_isOfType()");
}

function test_lang_isOfTypeToo() {
	var allTypes = [
		String, Number, Boolean, Array, Function, Object, null,
		"string", "number", "boolean", "array", "function", "object", "null",
		"numeric", "pureobject", "undefined", "optional", Date, Error];
	var number365 = new Number(365);
	var string365 = new String("365");
	var numberFoo = new Number("foo");
	var stringFoo = new String("foo");
	var booleanTrue = new Boolean(true);
	var booleanFalse = new Boolean(false);
	var error = new Error();
	var IggyClass = function() {};
	IggyClass.prototype.valueOf = function() { return 3; };
	var obj = {a: 1, b: 2}; // obj.undef is undefined
	var iggyInstace = new IggyClass();

	var examples = [
		{value: "foo",             types: [String, "string"]},
		{value: stringFoo,         types: [String, "string", Object, "object"]},
		{value: numberFoo,         types: [Number, "number", Object, "object"]},
		{value: number365,         types: [Number, "number", "numeric", Object, "object"]},
		{value: 365,               types: [Number, "number", "numeric"]},
		{value: "365",             types: [String, "string", "numeric"]},
		{value: string365,         types: [String, "string", "numeric", Object, "object"]},
		{value: true,              types: [Boolean, "boolean"]},
		{value: false,             types: [Boolean, "boolean"]},
		{value: booleanTrue,       types: [Boolean, "boolean", Object, "object"]},
		{value: booleanFalse,      types: [Boolean, "boolean", Object, "object"]},
		{value: [],                types: [Array, "array", Object, "object"]},
		{value: [1, 2, obj],       types: [Array, "array", Object, "object"]},
		{value: dojo.lang.indexOf, types: [Function, "function", Object, "object"]},
		{value: parseInt,          types: [Function, "function", Object, "object"]},
		{value: Math.sin,          types: [Function, "function", Object, "object"]},
		{value: obj,               types: [Object, "object", "pureobject"]},
		{value: dojo.lang,         types: [Object, "object", "pureobject"]},
		{value: Math,              types: [Object, "object", "pureobject"]},
		{value: null,              types: [null, "null", Object, "object", "optional"]},
		{value: error,             types: [Error, Object, "object"]},
		{value: obj.undef,         types: ["undefined", "optional"]},
		{value: iggyInstace,       types: [Object, "object", "numeric"]}
	];
	
	for (var i in examples) {
		var example = examples[i];
		var value = example.value;
		var matchingTypes = example.types;
		
		var whatAmIResult = dojo.lang.whatAmI(value);
		jum.assertTrue("300: " + i, dojo.lang.isOfType(value, whatAmIResult));
		
		for (var j in matchingTypes) {
			var matchingType = matchingTypes[j];
			jum.assertTrue("301", dojo.lang.isOfType(value, matchingType));
			jum.assertTrue("302", dojo.lang.isOfType(value, [Number, matchingType, String]));
			jum.assertTrue("303", dojo.lang.isOfType(value, [matchingType, "optional"]));
		}
		for (var k in allTypes) {
			var possibleType = allTypes[k];
			if (!dojo.lang.inArray(matchingTypes, possibleType)) {
				var nonMatchingType = possibleType;
				jum.assertFalse("310:" + i + " " + k, dojo.lang.isOfType(value, nonMatchingType));
			}
		}
	}
	
	
	// dojo.log.debug("leaving test_lang_isOfTypeToo()");
}

function test_lang_assert() {
	dojo.lang.assert(true);
	dojo.lang.assert(true, "400");
	dojo.lang.assert((1 == 1), "401");
	dojo.lang.assert("not a boolean value", "402");
	dojo.lang.assert(28, "403");

	var caught404 = false;
	try {
		dojo.lang.assert(false, "404");
	} catch (e) {
		caught404 = true;
	}
	jum.assertTrue("404", caught404);
	// dojo.log.debug("leaving test_lang_assert()");
}

function test_lang_assertType() {
	dojo.lang.assertType("foo", String, "410");
	dojo.lang.assertType(12345, Number, "411");
	dojo.lang.assertType(false, Boolean, "412");
	dojo.lang.assertType([6, 8], Array, "413");
	dojo.lang.assertType(dojo.lang.assertType, Function, "414");
	dojo.lang.assertType({foo: "bar"}, Object, "415");
	dojo.lang.assertType(new Date(), Date, "416");
	dojo.lang.assertType(new Error(), Error, "417");
	dojo.lang.assertType([6, 8], ["array", "optional"], "418");
	dojo.lang.assertType(null, ["array", "optional"], "419");

	var caught430 = false;
	try {
		dojo.lang.assertType(12345, Boolean, "430");
	} catch (e) {
		caught430 = true;
	}
	jum.assertTrue("430", caught430);

	var caught431 = false;
	try {
		dojo.lang.assertType("foo", [Number, Boolean, Object], "431");
	} catch (e) {
		caught431 = true;
	}
	jum.assertTrue("431", caught431);
	// dojo.log.debug("leaving test_lang_assertType()");
}

function test_lang_assertValidKeywords() {
	dojo.lang.assertValidKeywords({a: 1, b: 2}, ["a", "b"], "440");
	dojo.lang.assertValidKeywords({a: 1, b: 2}, ["a", "b", "c"], "441");
	dojo.lang.assertValidKeywords({foo: "iggy"}, ["foo"], "442");
	dojo.lang.assertValidKeywords({foo: "iggy"}, ["foo", "bar"], "443");
	dojo.lang.assertValidKeywords({foo: "iggy"}, {foo: null, bar: null}, "444");

	var caught450 = false;
	try {
		dojo.lang.assertValidKeywords({a: 1, b: 2, c: 3}, ["a", "b"], "450");
	} catch (e) {
		caught450 = true;
	}
	jum.assertTrue("450", caught450);

	// dojo.log.debug("leaving test_lang_assertValidKeywords()");
}

