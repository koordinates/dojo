
function test_Lang_uneval() {
  jum.assertTrue("[].constructor ok", ([1,2,3].constructor == Array));

  var sobj = new String('foobar');
  bu_debug("typeof new String=" + (typeof sobj));
  bu_debug("uneval(sobj): |" + burst.Lang.uneval(sobj));
  bu_debug("uneval(''): |" + burst.Lang.uneval(''));
  bu_debug("uneval('foobar'): |" + burst.Lang.uneval('foobar'));

  //bu_alert("initial isArray: " + (eval("[1,2,3]").constructor == Array));
  //bu_alert("again isArray: " + ([1,2,3].constructor == Array));
  //bu_debug('before test1');

  var s1 = "({a: 1, basdf: 2, cdf: {z: 1}})";
  var es1 = eval(s1);
  bu_debug("typeof es1 = " + (typeof es1));
  //bu_debug('before test1 assert');
  jum.assertEquals('test1', s1, burst.Lang.uneval(es1));

  jum.assertEquals('test1a', '({})', burst.Lang.uneval({}));

  jum.assertEquals('test1b', '"a\\nb"', burst.Lang.uneval("a\nb"));

  //bu_debug('before test2');
  var s2 = "[1, 2, 3]";
  var es2 = eval(s2);
  BU_DBG_CTOR = false;
  //bu_alert("(test_Lang.js) burst.Lang.isArray(es2)=" + burst.Lang.isArray(es2));
/*
  bu_debug('before test2 uneval of: ' + es2 + 
       ' typeof=' + (typeof es2) + 
       ' es2.constructor=' + es2.constructor + 
       ' es2.constructor===Array ' + (es2.constructor===Array));
  bu_debug('es2.constructor==Array ' + (es2.constructor==Array));
  bu_debug('es2.prototype=' + es2.prototype);
  if (es2.constructor) bu_debug('es2.constructor.toString()=' + es2.constructor.toString());
*/
  //bu_alert("(test_Lang.js) es2=" + es2);
  //bu_alert("(test_Lang.js) es2.constructor==Array " + (es2.constructor == Array));
  //bu_alert("(test_Lang.js) es2.push=" + es2.push);
  var unes2 = burst.Lang.uneval(es2);
  bu_debug("before test2 assert '" + s2 + "' and '" + unes2 + "'");
  //bu_debug("before test2, typeof unes2=" + (typeof unes2));
  BU_DBG_CTOR = false;
  jum.assertEquals('test2', s2, unes2);

//  bu_debug('before test3');
  var un3 = burst.Lang.uneval('\\f');
  bu_debug('before test3 assert');
  jum.assertEquals('test3', '"\\\\f"', un3);

  // stored as 6 chars '\foo".
  var tricky_str =  "'\\foo\"";
  bu_debug('tricky_str=' + tricky_str);
  // double escape makes '\\foo". quoting makes "'\\foo\""
  var untricky = burst.Lang.uneval(tricky_str);
  bu_debug('untricky=' + untricky);
  var etricky = eval(untricky);
  bu_debug("before test4 assert, tricky_str='" + tricky_str + "', etricky='" + etricky + "'");
  jum.assertEquals('test4', tricky_str, etricky);

  var orig_re = /ab\w[cd]/;
  var re_str = burst.Lang.uneval(orig_re);
  bu_debug('re_str=' + re_str);
  var re = eval(re_str);
  bu_debug('before testre, re=' + re + ' typeof=' + (typeof re) + ' constructor===RegExp ' + (re.constructor===RegExp));
  //jum.assertTrue('testre', re.constructor===RegExp);
  jum.assertEquals('testre2', orig_re.toString(), re.toString());

  var kitchen = {
	num:1, 
	bool: false, 
	simple_str: "string", 
	tricky_str: "'\\foo\"", 
	flt: 17.98, 
	dt: new Date(1000), 
	'new': "reserved",
	nl: null, 
	uf: undefined,
        arr: [1, "2", 3],
        obj: {a: 1, b: 2},
        re: /ab\sc/,
	func: function(a,b) {return a + b},
	last: 17
  };
  var unkitchen = burst.Lang.uneval(kitchen);
  bu_debug('unkitchen=' + unkitchen);
  var ekitchen = eval(unkitchen);
  jum.assertEquals('test5', kitchen, ekitchen);
}

function test_Lang_stack() {
  var callers;
  var caller_names;
  var caller_args;
  var caller_arg_names;
  function a(a1) {
     bu_debug("in a");
     // SpiderMonkey: function b 
     bu_debug("a.caller=" + a.caller);
     // SpiderMonkey: function b 
     bu_debug("bu_functionCaller(a)=" + bu_functionCaller(a));
     // SpiderMonkey: function b 
     bu_debug("arguments.callee.caller=" + arguments.callee.caller);
     // SpiderMonkey: undefined
     bu_debug("arguments.caller=" + (typeof arguments.caller == 'undefined' ? 'undefined' : arguments.caller));
     // SpiderMonkey: undefined
     bu_debug("this.caller=" + (typeof this.caller == 'undefined' ? 'undefined' : this.caller));
/*
     bu_debug("arguments.caller.arguments=" + arguments.caller.arguments);
     bu_debug("arguments.caller.callee.arguments=" + arguments.caller.callee.arguments);
     bu_debug("caller.arguments=" + caller.arguments);
*/

     callers =          burst.Lang.getCallers(); 
     // SpiderMonkey: 6
     bu_debug("burst.Lang.getCallers().length=" + callers.length);
     caller_names =     burst.Lang.getCallerNames(); 
     bu_debug("burst.Lang.getCallerNames().length=" + caller_names.length);
     caller_args =      burst.Lang.getCallerArguments();
     bu_debug("burst.Lang.getCallerArguments().length=" + caller_args.length);
     caller_arg_names = burst.Lang.getCallers(0,burst.Lang.functionArgumentNames);
     bu_debug("burst.Lang.getCallers(0,...).length=" + caller_arg_names.length);

     bu_debug("(test_Lang.js) getStackTrace()=" + burst.Lang.getStackTrace());
  }
  function b(b1,b2) {a(b1 + 1)}
  function c(c1, c2) {b(c1 + 1)}
  c(1);
  //bu_debug("got callers: " + callers);
  bu_debug("got caller_names: '" + caller_names + "' length=" + caller_names.length);
  bu_debug("got caller_args: '" + caller_args + "'");
  bu_debug("got caller_arg_names: '" + caller_arg_names + "'");
}

function test_Lang_functionParts() {
  jum.assertEquals('test1', 'alert("Hello");', burst.Lang.functionBody(function() {alert("Hello");}));
  jum.assertEquals('test2', 'anonymous', burst.Lang.functionName(function() {alert("Hello")}));
  var foo = function foobar() {alert("Hello")};
  jum.assertEquals('test3', 'foobar', burst.Lang.functionName(foo));
  // ENVBUG: khtml 3.02 doesn't work with this
  //jum.assertEquals('test3', 'foobar', burst.Lang.functionName(function foobar() {alert("Hello")}));
  jum.assertEquals('test4', ['first','second'], burst.Lang.functionArgumentNames(function /*foobar*/(first,second) {alert("Hello")}));
}

