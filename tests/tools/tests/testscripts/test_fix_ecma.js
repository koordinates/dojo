var TEST_ENCODE_IN = [
  '',
  'a',
  '%',
  ';/?:@&=+$,',
  '-_.!~*\'()',
  '#',
  '@*_+-./'
];

// encodeURI
var TEST_ENCODE_OUT = [
  '',
  'a',
  '%25',
  ';/?:@&=+$,',
  '-_.!~*\'()',
  '#',
  '@*_+-./'
];

//encodeURIComponent

var TEST_ENCODE_COMP_OUT = [
  '',
  'a',
  '%25',
  '%3B%2F%3F%3A%40%26%3D%2B%24%2C',
  '-_.!~*\'()',
  '%23',
  '%40*_%2B-.%2F'
];

var ESCAPE_PRESERVE = 'a@*_+-./';
function test_FixEcma_escape() {
    var es = escape(ESCAPE_PRESERVE);
    jum.assertEquals('escape(ESCAPE_PRESERVE)', ESCAPE_PRESERVE, es);

    for(var i=0;i<TEST_ENCODE_IN.length;++i) {
	var ins = TEST_ENCODE_IN[i];

	var v = encodeURI(ins);
	var shouldv = TEST_ENCODE_OUT[i];
	jum.assertEquals('encodeURI("' + ins + '")', shouldv, v);

	var dev = decodeURI(v);
	jum.assertEquals('decodeURI("' + v + '")', ins, dev);

	// Moz and Safari has upper case ABCDEF
	// Rhino has lower-case abcdef.
	// this is not dictated by http://www.ietf.org/rfc/rfc2396.txt
	// since both lower a-z and upper A-Z are preserved, we have to upcase both.
	var vcomp = encodeURIComponent(ins);
	var shouldvcomp = TEST_ENCODE_COMP_OUT[i];
	jum.assertEquals('encodeURIComponent("' + ins + '")', shouldvcomp.toUpperCase(), vcomp.toUpperCase());

	var devcomp = decodeURIComponent(vcomp);
	jum.assertEquals('decodeURIComponent("' + vcomp + '")', ins, devcomp);
    }
}

function test_FixEcma_RegExp() {
   var re = /(\w)/g;
   var s = "foo";
   var result = s.replace(re, function() {return ''});
   jum.assertEquals("String.replace(Regexp,Function)", '', result);
}

function test_FixEcma_Number() {
    jum.info("-10=" + (-10).toString(16) + " " + (4294967286).toString(16));

    var ineg = -10;
    jum.info("-10.toString(16)=" + ineg.toString(16) + " (0x7fffffff & -10) = " + (0x7fffffff & -10) + 
	     " (0xffffffff - 10 + 1) = " + (0xffffffff - 10 + 1) +
	     " (0xffffffff & -10) = " + (0xffffffff & -10) );

    var big = 4294967286;
    jum.info("4294967286 < 0" + (big < 0) + " 4294967286.toString(16)" + big.toString(16));
}

