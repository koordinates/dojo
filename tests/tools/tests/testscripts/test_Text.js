var printf_test_cases = [
  ['', ''], 
  ['foo', 'foo'],
//  ['foo', '%s', 'foo'],
  [' ggg', ' %s', 'ggg'],
  ['foobar', '%s%s', 'foo', 'bar'],
  [' foobarbaz ', ' %sbar%s ', 'foo', 'baz'],
  ['%', '%%'], 

  ['foo', '%.3s', 'foo'],
  ['fo', '%.2s', 'foo'],
  [' foo', '%4s', 'foo'],
  ['foo ', '%-4s', 'foo'],
  ['foo ', '%*s', -4, 'foo'],
  ['fo', '%.*s', 2, 'foo'],

  ['a', '%c', 97],

  ['17', '%d', 17],
  ['17', '%d', '17'],
  ['17', '%1d', '17'],
  ['-17', '%d', -17],
  [' 17', '%3d', 17],
  ['17 ', '%-3d', 17],
  ['017', '%03d', 17],
  ['-17', '%-03d', -17],
  ['-017', '%-0.3d', -17],
  [' 17', '%3.1d', 17],
  ['0017', '%3.4d', 17],
  ['', '%.d', 0],
  ['0', '%d', 0],

  ['a', '%x', 10],
  ['A', '%X', 10],
  ['0xa', '%#x', 10],
  ['ffffffff', '%x', -1],
  ['fffffff6', '%x', -10],
  ['0xfffffff6', '%#x', -10],

  ['0.000000', '%f', 0],
  ['1.200000', '%f', 1.2],
  ['0.07', '%.2f', .07],
  ['1.13', '%.2f', 1.129],
  ['1', '%.0f', .51],
  ['0.5', '%.1f', .51],
  ['1', '%.0f', .94],
  ['0.9', '%.1f', .94],
  ['1', '%.0f', 1.2],
  ['1.200', '%.3f', 1.2],
  ['12345.678900', '%f', 12345.6789],
  ['0.001000', '%f', .001],
  ['0.000100', '%f', .0001],
  ['0.000010', '%f', .00001],
  ['0.00001', '%.5f', .00001],
  ['0.000010', '%.6f', .00001],
  ['1000000.000000', '%f', 1000000],
  ['1000000', '%.0f', 1000000],
  ['1000000.', '%#.0f', 1000000],
  ['1000000.0000000', '%.7f', 1000000],
  ['0.000000', '%f', NaN],

  ['1.200000e+00', '%e', 1.2],
  ['1.20e+00', '%.2e', 1.2],
  ['  1.20e+00', '%10.2e', 1.2],
  ['1.234568e+04', '%e', 12345.6789],
  ['1.000000e+08', '%e', 100000000],
  ['1.000000e-08', '%e', .00000001],

  ['12345.7', '%g', 12345.6789],
  ['0.001', '%g', .001],
  ['0.0001', '%g', .0001],
  ['1e-05', '%g', .00001],
  ['1e-05', '%.5g', .00001],
  ['1e-05', '%.6g', .00001],
  ['1e+06', '%g', 1000000],
  ['1000000', '%.7g', 1000000]
];

function test_Text_sprintf() {
    for(var i=0;i<printf_test_cases.length;++i) {
	var test_case = printf_test_cases[i];
	var expected = test_case[0];
	test_case.shift();
	var args = test_case;
	var res = burst.Text.sprintf.apply(null, args);
	var mess = "sprintf(" + args.join(',') + ")";
	// bu_debug("typeof res=" + (typeof res) + " typeof args[0]=" + (typeof args[0]));
	bu_debug(mess + (expected == res ? " OK" : " FAILED"));
	jum.assertEquals(mess, expected, res);
    }
}


function test_Text_doubleEscape() {
  jum.assertTrue("[].constructor ok", ([1,2,3].constructor == Array));
  jum.assertEquals('test1', 'a', burst.Text.doubleEscape('a'))
  jum.assertEquals('test2', 'a\\\\b\\\\', burst.Text.doubleEscape('a\\b\\'));
}

function test_Text_quote() {
  jum.assertEquals('test1', '"a"', burst.Text.quote('a'));
  jum.assertEquals('test2', 'a', burst.Text.quote('a',false,true));

  var act = burst.Text.quote("a\nb",true);
  var exp = '"a\\nb"';
  bu_debug("act=|" + act + "|len=" + act.length + " exp=|" + exp + "|len=" + exp.length);
  jum.assertEquals('test3', '"a\\nb"', burst.Text.quote("a\nb",true));

  jum.assertEquals('test4', "'a\"'", burst.Text.quote('a"'));
  // one of each of '"\
  jum.assertEquals('test5', '"' + "'\\\"\\\\" + '"', burst.Text.quote("'\"\\"));

  jum.assertEquals('test6', '"\'\\\\foo\\\""', burst.Text.quote("'\\foo\""));
}

function test_Text_endsWith() {
  jum.assertTrue('test1', burst.Text.endsWith("a", "a"));
  jum.assertTrue('test2', burst.Text.endsWith("abc", "c"));
  jum.assertFalse('test3', burst.Text.endsWith("abc", "a"));
  jum.assertFalse('test4', burst.Text.endsWith("a", "abc"));
}

function test_Text_startsWith() {
  jum.assertTrue('test1', burst.Text.startsWith("a", "a"));
  jum.assertFalse('test2', burst.Text.startsWith("abc", "c"));
  jum.assertTrue('test3', burst.Text.startsWith("abc", "a"));
  jum.assertFalse('test4', burst.Text.startsWith("a", "abc"));
}

function test_Text_trim() {
  jum.assertEquals('test1', 'a', burst.Text.trim('a'));
  jum.assertEquals('test2', 'a', burst.Text.trim('  a  '));
  jum.assertEquals('test3', 'a b', burst.Text.trim(' a b '));
}

function test_Text_isWhite() {
  jum.assertTrue('test1', burst.Text.isWhite(''));
  jum.assertTrue('test2', burst.Text.isWhite(' '));
  jum.assertTrue('test3', burst.Text.isWhite('\n'));
  jum.assertFalse('test4', burst.Text.isWhite('a'));
  jum.assertFalse('test5', burst.Text.isWhite(' a '));
}

function test_Text_splitTerms() {
  jum.assertEquals('test1', ['a'], burst.Text.splitTerms('a'));
  jum.assertEquals('test2', [], burst.Text.splitTerms(''));
  jum.assertEquals('test3', ['a','b'], burst.Text.splitTerms('a b'));
  jum.assertEquals('test4', ['a','b', '"c d"'], burst.Text.splitTerms('a b "c d"'));
  jum.assertEquals('test5', ['a'], burst.Text.splitTerms(' a '));
}

function test_Text_unquote() {
  jum.assertEquals('test1', '', burst.Text.unquote(''));
  jum.assertEquals('test2', 'a', burst.Text.unquote('a'));
  jum.assertEquals('test3', 'a', burst.Text.unquote('"a"'));
}

function test_Text_ellipsis() {
  jum.assertEquals('test1', '', burst.Text.ellipsis('',10));
  jum.assertEquals('test2', 'a', burst.Text.ellipsis('a',10));
  jum.assertEquals('test3', '12345...', burst.Text.ellipsis('1234567890',5));
}
