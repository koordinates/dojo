/**
* @file fix_ecma.js
*
* Utility file - attempts to bring builtin objects such as Array and Function
* into compliance with ECMAScript edition 3 (JavaScript 1.5).
*
* The main target is support for IE5.0 Windows (JScript 5.0). Even there,
* we do not attempt to compensate for all its missing features (such as lacking
* non-greedy regexps, etc.).
*
* For a good summary of what was fixed by Microsoft in JScript 5.5, see:
*    http://groups.google.com/groups?selm=unx4moEP%24GA.232%40cppssbbsa02.microsoft.com&rnum=1 
*
* We provide implementations of these functions:
* - Function: apply(), call()
* - Array: push(), pop(), shift(), splice(), unshift()
* - Number: toFixed()*, toPrecision()*, toExponential()*
* - RegExp: exec()*
* - String: replace()*, charCodeAt()
* - Error: message*, name*
* - globals: escape*, undefined, encodeURI(), decodeURI(), encodeURIComponent(), decodeURIComponent()
* 
* The functions above marked with "*" are replaced in some cases regardless of whether they
* are already defined. The unmarked ones are defined only if they are not already defined.
* @todo Improve runtime detection of when these fixes are needed. Right now, only "escape" is done well.
*
* This file has no dependencies on any other file.
*
* This file only affects the builtin ECMAScript objects, except that it
* does keep track of the names it has defined in the global Array <var>bu_fixed</var>.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*
* $Id: fix_ecma.js,v 1.1.1.1 2004/06/18 06:17:24 alex Exp $
*/

/** Array of names of symbols we've defined */
//:GLVAR Array bu_fixed = []
var bu_fixed = [];

// function to register a fixed name
function bu_fixing(name) {
   // don't use Array.push, as we may not have defined it yet....
   bu_fixed[bu_fixed.length] = name;
}

// Get the version of JScript, or null.
var bu_jscript_version = null;
// This can be done efficiently using conditional compilation:
//     See http://msdn.microsoft.com/library/default.asp?url=/library/en-us/jscript7/html/jsconditionalcompilationvars.asp
// But we don't preserve these right now when stripping comments.
///*@cc_on
//bu_jscript_version = @_jscript_version;
//@*/
// ScriptEngineMajorVersion is in defined in JScript 5.0.
if (typeof ScriptEngineMajorVersion == 'function') {
  bu_jscript_version = parseFloat(ScriptEngineMajorVersion() + '.' + ScriptEngineMinorVersion());
}


/****************************************************************
* Function fixes.
****************************************************************/

// Modified from Usenet posts by David Crockford and Yep (y-e.perio@em-lyon.com)
if (!Function.prototype.apply) {
  bu_fixing('Function.apply');
  Function.prototype.apply = function bu_fix_apply(o,a) {
    var r;
    if (!o) o = {}; // in case func.apply(null, arguments).
    o.___apply=this;
    switch((a && a.length) || 0) {
	case 0: r = o.___apply(); break;
	case 1: r = o.___apply(a[0]); break;
	case 2: r = o.___apply(a[0],a[1]); break;
	case 3: r = o.___apply(a[0],a[1],a[2]); break;
	case 4: r = o.___apply(a[0],a[1],a[2],a[3]); break;
	case 5: r = o.___apply(a[0],a[1],a[2],a[3],a[4]); break;
	case 6: r = o.___apply(a[0],a[1],a[2],a[3],a[4],a[5]); break;
	default: 
           for(var i=0, s=""; i<a.length;i++){
             if(i!=0) s += ",";
             s += "a[" + i +"]";
           }
           r = eval("o.___apply(" + s + ")");

    }
    // note that delete is not in JS1.1 and thus won't work in IE5.0 PC.
    // since this is a workaround anyway, we just let it stay.
    //delete o.___apply;
    o.__apply = null;
    return r;
  }
}

if (!Function.prototype.call) {
  bu_fixing('Function.call');
  Function.prototype.call = function bu_fix_call(o) {
    // copy arguments and use apply
    var args = new Array(arguments.length - 1);
    for(var i=1;i<arguments.length;i++) {args[i - 1] = arguments[i];}
    return this.apply(o, args);
  }
}

/****************************************************************
* Array fixes.
****************************************************************/

/*
* There are many re-implementations of these Array functions available, for example:
* - http://www.crockford.com/javascript/remedial.html
* - http://www.webreference.com/dhtml/column33/
* - http://www.technicalpursuit.com/Dev_viewsource.html
* - http://www.informit.com/isapi/product_id~{E40D98B6-703F-4ED9-9B6C-9DD2E731FAD5}/element_id~{26FC4DC0-4520-47D2-B188-EFF1FF8F2E10}/st~{68F792C2-D59B-43BA-A07E-F0B1569A0392}/session_id~{2FF7DAF3-4594-49C3-9928-042852C1BF38}/content/articlex.asp
* - http://cvs.berlios.de/cgi-bin/viewcvs.cgi/jsunit/jsunit/lib/JsUtil.js?rev=1.14&content-type=text/vnd.viewcvs-markup
*
* I have no particular reason to prefer the implementations given here, except that I wrote them.
*/

if (!Array.prototype.push) {
  bu_fixing('Array.push');
  Array.prototype.push = function bu_fix_push() {
    for (var i = 0; i < arguments.length; i++) {this[this.length] = arguments[i];}
    return this.length;
  };
}

if (!Array.prototype.pop) {
  bu_fixing('Array.pop');
  Array.prototype.pop = function bu_fix_pop() {
    if (this.length == 0) return BU_UNDEFINED;
    return this[this.length--];
  }
}

if (!Array.prototype.shift) {
  bu_fixing('Array.shift');
  Array.prototype.shift = function bu_fix_shift() {
     this.reverse();
     var lastv = this.pop();
     this.reverse();
     return lastv;
  }
}

if (!Array.prototype.splice) {
  bu_fixing('Array.splice');
  Array.prototype.splice = function bu_fix_splice(start, deleteCount) {
    var len = parseInt(this.length);

    start = start ? parseInt(start) : 0;
    start = (start < 0) ? Math.max(start+len,0) : Math.min(len,start);

    deleteCount = deleteCount ? parseInt(deleteCount) : 0;
    deleteCount = Math.min(Math.max(parseInt(deleteCount),0), len);

    var deleted = this.slice(start, start+deleteCount);

    var insertCount = Math.max(arguments.length - 2,0);
    // new len, 1 more than last destination index
    var new_len = this.length + insertCount - deleteCount;
    var start_slide = start + insertCount;
    var nslide = len - start_slide; // (this.length - deleteCount) - start
    // slide up
    for(var i=new_len - 1;i>=start_slide;--i) {this[i] = this[i - nslide];}
    // copy inserted elements
    for(i=start;i<start+insertCount;++i) {this[i] = arguments[i-start+2];}
    return deleted;
  }
}

if (!Array.prototype.unshift) {
  bu_fixing('Array.unshift');
  Array.prototype.unshift = function bu_fix_unshift() {
     // prepare for a call to splice
     var a = [0,0];
     for(var i=0;i<arguments.length;i++) {a.push(arguments[i]);}
     var ret = this.splice.apply(a);
     return this.length;
  }
/*
  Array.prototype.unshift2 = function bu_fix_unshift2() {
     var len = arguments.length;
     var a = new Array(len);
     for(var i=0;i<len;i++) {a[i] = arguments[i];}
     this.reverse();
     a.reverse();
     this.push(a);
     this.reverse();
     return this.length;
  }
*/
}

/****************************************************************
* Number fixes.
****************************************************************/
/*
Safari1 and IE5.0 don't implement Number.toFixed, toPrecision, toExponential.
IE5.5 and IE6 implement them, but have rounding problems with Number.toFixed,
for example (.51).toFixed(0) == '0' instead of '1'. Ditto for .94.

Note that you can't do something like
    s = String(Math.round(f * Math.pow(10, prec)) / Math.pow(10, prec));
Because the division sometimes gives the wrong result, at least on IE
For example, for f=.51 and prec=1 we might get 0.5000000000000001 instead of 0.5

My implementations below are grotesque, but keep in mind these are only for
deficient browsers.

See also:
    http://jibbering.com/faq/#FAQ4_6
    http://www.merlyn.demon.co.uk/js-round.htm#TNM
    http://www.faqts.com/knowledge_base/view.phtml/aid/1157/fid/209/lang/
*/
if (!Number.prototype.toFixed || bu_jscript_version) {
  function bu_nz(n) {return n <= 0 ? '' : '0000000000000000000000000'.substring(25 - n)}

  bu_fixing('Number.toFixed');
  if (Number.prototype.toFixed) Number.prototype.$$toFixed$$ = Number.prototype.toFixed;
  Number.prototype.toFixed = function(fracDigits) {
    var f = this;
    if (typeof fracDigits == 'undefined') fracDigits = 0;
    if (fracDigits < 0) throw Error("negative fracDigits " + fracDigits);
    var n = Math.round(Math.abs(f) * Math.pow(10, fracDigits));
    var s;
    if (isNaN(n) || n == 2147483647) { // Safari braindamage
        s = String(f);
        var dec = s.indexOf('.');
	if (dec == -1) return fracDigits > 0 ? s + '.' + bu_nz(fracDigits) : s;
        var res = s.substring(0,dec+1);
        var fraction = s.substring(dec+1);
        if (fraction.length >= fracDigits) return res + fraction.substring(0,fracDigits);
        res = res + fraction + bu_nz(fracDigits - fraction.length); 
//alert("got nan, returning " + res);
        return res; 
    }
    s = String(n);
//alert("f=" + f + " fracDigits=" + fracDigits + " s=" + s);
    // stick a decimal point at the appropriate point, if fracDigits > 0
    if (fracDigits > 0) {
      // larger than 1 
      if (s.length > fracDigits)
        s = s.substring(0, s.length - fracDigits) + '.' + s.substring(s.length - fracDigits);
      // a fraction, have to put some zeros after decimal as shift down.
      else {
        s = '0.' + bu_nz(fracDigits - s.length) + s;
      }
    }
    if (f < 0) s = '-' + s;
    return s;
  }
}

if (!Number.prototype.toPrecision || bu_jscript_version) {
  bu_fixing('Number.toPrecision');
  if (Number.prototype.toPrecision) Number.prototype.$$toPrecision$$ = Number.prototype.toPrecision;
  Number.prototype.toPrecision = function(prec) {
    var f = this;
    if (typeof prec == 'undefined') return String(f);
    if (prec < 0) throw Error("negative precision " + prec);

    // For IE5.5 and IE6, there is a native toPrecision which will only be potentially wrong if
    // it returns fixed format.
    if (Number.prototype.$$toPrecision$$ /*&& bu_jscript_version*/) {
      var nat = Number.prototype.$$toPrecision$$.call(this, prec);
      if (/e/i.test(nat)) return nat;
    }

    // the exponent part
    var exp = Math.floor(Math.log(Math.abs(f))/Math.LN10 + 0.000001);
    // if exponent >= precision, want exponential notation with prec - 1 fracDigits
    if (exp >= prec) {
	s = this.toExponential(prec - 1);
    }
    // otherwise want fixed format with precision significant digits (note not same as fracDigits)
    else {
	//s = this.toFixed(prec);

        // we know exp < prec.
        // make it an integer with desired number of significant digits, by making prec digits left of period.
	var n = Math.round(Math.abs(f) * Math.pow(10, prec - exp - 1)); 
        // Now we have to effectively multiply by Math.pow(10, exp + 1 - prec), which means digit shift
	s = String(n);
	var nshift = prec - exp - 1;
	if (nshift == 0) {
	}
	else if (nshift < s.length) {
	    s = s.substring(0, s.length - nshift) + '.' + s.substring(s.length - nshift);
	}
	else {
	    s = '0.' + bu_nz(nshift - s.length) + s;
        }
	// alert("f=" + f + " p=" + prec + " n=" + n + " s=" + s + " nshift=" + nshift);
    }
    return s;
  }
}

if (!Number.prototype.toExponential) {
  bu_fixing('Number.toExponential');
  Number.prototype.toExponential = function(fracDigits) {
    var f = this;
    // the exponent part
    // sigh, Math.log(100000000)/Math.LN10 = 7.999999999999998
    var exp = Math.floor(Math.log(Math.abs(f))/Math.LN10 + 0.000001);
    var n; 
    // if fracDigits is undefined, then use as many digits as need be.
    if (typeof fracDigits == 'undefined') {
       n = Math.abs(f) * Math.pow(10, 0 - exp - 1);
    }
    else {
       // make a number with 1 more than fracDigits digits to left of decimal point, and round it.
       n = Math.round(Math.abs(f) * Math.pow(10, fracDigits - exp));
    }
    // convert to string, put period after first digit
    var s = String(n).replace(/(\d)/, "$1.");

    // alert("f=" + f + " fracDigits=" + fracDigits + " exp=" + exp + " n=" + n + " s=" + s + " exp exact=" + Math.log(Math.abs(f))/Math.LN10);

    // add exponent part
/*
// C ensures at least 2 digits in exponent. But ECMAScript says just append the exp
    s += 'e' + (exp > 10 ? '+' + exp : 
                (exp >= 0 ? '+0' + exp :
                 (exp > -10 ? '-0' + Math.abs(exp) : exp)));
*/
    s += (exp >= 0 ? 'e+' : 'e') + exp;
    // put sign in front
    if (f < 0) s = '-' + s;
    return s;
  }
}

/****************************************************************
* RegExp fixes.
****************************************************************/
/*
Fix RegExp.exec on IE5.0 PC

RegExp instances do not have the flags re.global, re.multiline, re.ignoreCase.
RegExp instances do not have re.lastIndex.
The RegExp.exec return value does not have .input or .index.
RegExp.exec ignores re.lastIndex (which doesn't exist) and RegExp.lastIndex (which is
set, but does not behave the same).
So RegExp.exe loops will generally loop forever if there is a match.

See Peter Torr:
  http://groups.google.com/groups?selm=OSyFsf18%24GA.240%40cppssbbsa05
  http://groups.google.com/groups?selm=%23BQZ1ge4%24GA.1576%40cpmsftngp04
  http://groups.google.com/groups?selm=unx4moEP%24GA.232%40cppssbbsa02.microsoft.com&rnum=1

Note that String.match will loop properly in 5.0, but won't do captures, so that doesn't help.

TODO: if not re.global, and we detect we are called multiple times, what should we do?

Note that these properties only exist in IE5.5+:
  RegExp.lastMatch
  RegExp.leftContext
  RegExp.rightContext
  RegExp.lastParen
But these are not standard EcmaScript 262 attributes.
*/
if (bu_jscript_version && (bu_jscript_version < 5.5)) {
    // fix instance properties
    // local regexp literals seem to be created each time a function is called, so this is not 
    // necessary within passes of a loop, but is necessary again for each function call using the re.
    function bu_fix_re_flags(re) {
	var s = re.toString();
	var flags = s.substring(s.lastIndexOf('/'));
	re.global = flags.indexOf('g') != -1;
	re.multiline = flags.indexOf('m') != -1;
	re.ignoreCase = flags.indexOf('i') != -1;
	//alert("fixed flags, global=" + re.global + " flags=" + flags);
    }

    bu_fixing('RegExp.exec');
    RegExp.prototype.$$exec$$ = RegExp.prototype.exec;
    RegExp.prototype.exec = function(s) {
	if (typeof this.global == 'undefined') bu_fix_re_flags(this);

	// RegExp.lastIndex starts out -1. but doesn't always seem to set back to -1 for a failed match.
	// And it is not overwritable either, so we use this.lastIndex within the loop.
	// It should be set anyway, for standards compliance.
	var lastInd;
	if (typeof this.lastIndex == 'undefined') {
	    lastInd = this.lastIndex = 0;
	    // if (RegExp.lastIndex > 0) alert("ignoring RegExp.lastIndex on new match");
	}
	else {
	    lastInd = this.lastIndex;
	}
	//alert("lastInd = " + lastInd + " RegExp.lastIndex=" + RegExp.lastIndex);

	var res = this.$$exec$$(s.substring(lastInd));
	if (!res) {
	    // does nothing:
	    //    if (RegExp.lastIndex > 0) {alert("setting RegExp.lastIndex=-1"); RegExp.lastIndex = -1;}
	    this.lastIndex = 0;
	    // alert("exec of " + this + " on '" + s + "' returning " + res + " RegExp.lastIndex=" + RegExp.lastIndex);
	    return res;
	}

	// now RegExp.lastIndex is end of match within substring, so make it from start of original.
	this.lastIndex = (RegExp.lastIndex + lastInd);

	// index of start of match within whole input
	res.index = this.lastIndex - res[0].length;

	// make up a new property to hold whole original input
	if (lastInd == 0) RegExp.$$lastInput$$ = s;
	res.input = RegExp.$$lastInput$$;

	// alert("exec of " + this + " on '" + s + "' returning with res=" + res.join('|') + " res.input=" + res.input + " res.index=" + res.index + " RegExp.lastIndex=" + RegExp.lastIndex + " lastInd=" + lastInd);
	return res;
    }
}


/****************************************************************
* String fixes.
****************************************************************/
/*
Fix or implement String.prototype.replace(searchValue, replaceValue) when replaceValue is a function

When replaceValue is a function, it should be called with arguments (matching_str, capture1, ..., captureN, offset, input).
 
Mozilla and IE5.5 both do this correctly.
Neither sets the re.lastIndex. IE5.5 does set the nonstandard RegExp.lastIndex to be the same as offset.

Opera7 attempts to implement it, but does the last two arguments incorrectly.
It sets offset=0 always, and input same as matching_str.
It sets re.lastIndex apparently to the length of matching_str, which isn't helpful.

Rhino (and ICE browser) throws a java NullPointerException with some regexp's and String.replace:
   http://groups.google.com/groups?selm=b950119f.0308251338.59f7b40f%40posting.google.com
   http://bugzilla.mozilla.org/show_bug.cgi?id=217379

Safari1 and IE5.0 don't implement the functionality at all (they try to treat replaceValue as a string
even when it is a function).

We have not implemented the unusual case of searchValue being a function with
searchValue being a String instead of a RegExp.

This implementation relies on RegExp.exec being fixed for looping on IE 5.0 (done in this file).

Note that String.prototype.match(re) with global=true supposedly works in IE 5.0,
although it doesn't do captures (just returning an array of matches from
each call to re.exec). 
TODO: verify that this is true.

*/
// easier to characterize where it does work: Moz, IE5.5, SpiderMonkey
if ((typeof navigator != 'undefined' && (navigator.userAgent.indexOf('rv:') != -1)) || 
    (bu_jscript_version && (bu_jscript_version >= 5.5)) ||
    (typeof line2pc !== 'undefined')) {
}
else {
    bu_fixing('String.replace');
    String.prototype.$$replace$$ = String.prototype.replace;
    String.prototype.replace = function(searchValue, replaceValue) {
	if (typeof replaceValue != 'function') {
	   var v = this.$$replace$$(searchValue, replaceValue);
	   //print("(fix_ecma.js) typeof replaceValue=" + (typeof replaceValue) + " returning: '" + v + "'"); 
	   return v;
	}
	if (!searchValue.exec) throw Error("unimplemented: searchValue not a RegExp: " + searchValue);
	var re = searchValue;
	var a;
	var instr = this;
	var out_parts = [];
	// RegExp.exec returns an array which is is the match followed by the captures.
	// this is just what replaceValue as a function expects, but it also expects two more arguments
	// at the end: offset and whole input
	var npasses = 0;
	var prev_end = 0;
	while( (a = re.exec(instr)) ) {
	    npasses++;
	    a.push(a.index);
	    a.push(a.input);
	    var res = replaceValue.apply(null, a);
	    // push on previous part of string prior to match
	    out_parts.push(this.substring(prev_end, a.index));
            // push on replacement
	    out_parts.push(res);

	    prev_end = a.index + a[0].length;

	    // only do one match if not global
	    if (!re.global) break;
	}
	// no matches replaced; return input
	if (npasses == 0) {
	   //print("(fix_ecma.js) npasses=0, so returning: '" + instr + "' typeof=" + (typeof instr) + " instr==null? " + (instr == null) + " uneval=" + burst.Lang.uneval(instr));
	   //return '' + instr;
	   return instr;
	}

	// push on rest of string and return it.
	out_parts.push(this.substring(prev_end));
	var s = out_parts.join('');
	//print("(fix_ecma.js) npasses=" + npasses + "; returning: '" + s + "' typeof=" + (typeof s));
	return s;
    }
}

if (!String.prototype.charCodeAt) {
  bu_fixing('String.charCodeAt');
  var BU_ASCII = "\000\001\002\003\004\005\006\007\010\011\012\013\014\015\016\017\020\021\022\023\024\025\026\027" +
        "\030\031\032\033\034\035\036\037\040\041\042\043\044\045\046\047\050\051\052\053\054\055\056\057" +
        "\060\061\062\063\064\065\066\067\070\071\072\073\074\075\076\077\100\101\102\103\104\105\106\107" +
        "\120\121\122\123\124\125\126\127\130\131\132\133\134\135\136\137\140\141\142\143\144\145\146\147" +
        "\150\151\152\153\154\155\156\157\160\161\162\163\164\165\166\167\170\171\172\173\174\175\176\177" +
	"\200\201\202\203\204\205\206\207\210\211\212\213\214\215\216\217\220\221\222\223\224\225\226\227" +
        "\230\231\232\233\234\235\236\237\240\241\242\243\244\245\246\247\250\251\252\253\254\255\256\257" +
        "\260\261\262\263\264\265\266\267\270\271\272\273\274\275\276\277\300\301\302\303\304\305\306\307" +
        "\320\321\322\323\324\325\326\327\330\331\332\333\334\335\336\337\340\341\342\343\344\345\346\347" +
        "\350\351\352\353\354\355\356\357\360\361\362\363\364\365\366\367\370\371\372\373\374\375\376\377";
  String.prototype.charCodeAt = function(index) {
    var c = this.charAt(index);
    // charAt and charCodeAt have similar behavior about non-numeric or out of range argument,
    // but return value differs.
    if (c == '') return NaN;
    var code = BU_ASCII.indexOf(c);
    if (code != -1) return code;
    // charCodeAt is defined to return a number < 2^16.
    // we could i suppose iterate over eval("\\0" + i.toNumber(8)) for i = 256; i< 
    throw "character at position " + index + " is not [0, 255]: " + c;
  }
}



/****************************************************************
* Error fixes.
****************************************************************/
/*
ECMAScript edition 3 says that the Error object has properties "name" and "message".

IE5 (JS.0) does not have "name" or "message", just "description" (same as "message") and "number".

The IE5 number is: errorObject.number & 0xffff, where facility code and error code are 16-bits each.

IE5.5 supports both "message" and "name".

Note that this doesn't help much regarding native Error objects thrown in IE5.0.
*/
if (typeof Error == 'undefined' || (bu_jscript_version && (bu_jscript_version < 5.5))) {
  bu_fixing('Error');
  Error = function(msg) { 
    if (!(this instanceof Error)) return new Error(msg);
    this.message = msg || '';
    return this; // just to silence warnings
  };
  Error.prototype = new Object();
  Error.prototype.name = 'Error';
  Error.prototype.toString = function() {return this.name + ': ' + this.message};
}

/****************************************************************
* global variable fixes
****************************************************************/
// There is no global "undefined" in IE5.0 PC. 
// Since there is no "in" operator in IE5.0 PC, and typeof window.undefined == 'undefined' doesn't help,
// we just test for jscript version here.
// We could also use the cc_on trick....
// Note that this doesn't do a whole lot, because IE5.0 may still complain if you do "return undefined", for example.
if (bu_jscript_version && (bu_jscript_version < 5.5)) {/*alert("defining undefined");*/ eval("var undefined");}

/****************************************************************
* global function fixes
****************************************************************/
/*
encodeURI, decodeURI, encodeURIComponent and decodeURIComponent.
These are missing in IE5.0PC, IE5Mac, and Safari1.

The ECMAScript edition 1 'escape' and 'unescape' are really not URI-compatible, but are
better than nothing. 

escape does not encode:
   alphanums
   @*_+-./

encodeURI does not encode:
  alphanum
  the URI reserved characters ;/?:@&=+$,
  the mark characters -_.!~*'()
  the character #

encodeURIComponent does not encode:
  alphanum
  the mark characters -_.!~*'()

Note that decodeURI is supposed to pass through '%XX' unchanged if it decodes as a character
that is any of the URI reserved characters or #.
So decodeURI('z%3Bz') == 'z%3Bz', while unescape('z%3Bz') == decodeURIComponent('z%3Bz') == 'z;z'.

In 262-3, SpiderMonkey, Rhino, and IE, escape('@') == '@'. In Mozilla, escape('@') == '%40'. See:
   http://bugzilla.mozilla.org/show_bug.cgi?id=192148
*/

// our only fix for Mozilla!
if (escape('@') == '%40') {
  //alert('fixing escape');
  bu_fixing('escape');
  var $$escape$$ = escape;
  //IE5.0 doesn't like this way of defining, even if it isn't going to get run.
  //function escape(s) {
  window.escape = function(s) {
    //alert("in wrapper escape");
    var esc = $$escape$$(s);
    return esc.replace(/\%40/g, '@');
  }
}

if (typeof decodeURIComponent == 'undefined') {
  bu_fixing('encodeURI');
  var BU_UNESCAPE_ENCODE = escape(';?:&=$,!~\'()#');
  function encodeURI(s) {
    var esc = escape(s);
    // now need to unescape ;?:&=$, and !~'() and #
    return esc.replace(/\%../g, function(match) {
      return BU_UNESCAPE_ENCODE.indexOf(match) == -1 ? match : unescape(match);
    });
  }

  bu_fixing('encodeURIComponent');
  var BU_UNESCAPE_ENCODE_COMP = escape('!~\'()');
  function encodeURIComponent(s) {
    var esc = escape(s);
    // now need to unescape !~'() and escape @+/
    var unesc = esc.replace(/\%../g, function(match) {
      return BU_UNESCAPE_ENCODE_COMP.indexOf(match) == -1 ? match : unescape(match);
    });
    return unesc.replace(/\@/g, '%40').replace(/\+/g,'%2B').replace(/\//g,'%2F');
  }

  bu_fixing('decodeURI');
  var BU_PASSTHRU_DECODE = escape(';/?:@&=+$,#');
  function decodeURI(enc) {
    // need to pass through the encoded versions of ;/?:@&=+$,#
    var s = enc.replace(/\%../g, function(match) {
       return BU_PASSTHRU_DECODE.indexOf(match) == -1 ? unescape(match) : match;
    });
    return s;
  }

  bu_fixing('decodeURIComponent');
  var decodeURIComponent = unescape;
}

/****************************************************************
* operator fixes (not actually possible to fix).
****************************************************************/
/*
* The boolean operator "in" is available in IE starting only with JScript 5.5 (not IE5.0PC or IE5Mac).
* [This is the operator used in "if ('a' in obj)"; the "for" loop is fine.]
*
* The expression "mem in obj" is roughly equivalent to "typeof obj[mem] != 'undefined'".
* The exception case is when obj[mem] exists but happens to be undefined.
*
* The boolean "in" is used both to determine membership, and in some cases to avoid
* strict warnings upon returning obj[mem]. 
* We define bu_in elsewhere for these purposes.
*/

/*
The operator "instanceof" is in Netscape JavaScript1.4 and JScript5 Win, but not IE5Mac.

It is basically impossible to properly implement "instanceof" even as a function
using other functionality.
This is one of the reasons why IE5Mac is broken beyond repair.

It became a reserved word in ECMAScript edition 2.
Its semantics was defined in edition 3.

It is possible to emulate instanceof with a function if __proto__ is available.

The __proto__ member is Nestcape-specific. It connects and object with its prototype:
    object.__proto__ === ctor.prototype

// depends on __proto__
function bu_instanceof_netscape(object, constructor) { 
   while (object != null) { 
      if (object == constructor.prototype) 
         return true; 
      object = object.__proto__; 
   }  return false; 
}

Without __proto__, we are just left with MyClass.prototype (must be explicitly set and defaults to null),
and object.constructor, which is a Function. 
The object.constructor member is inherited.
If object.prototype.constructor are overridden, then all bets are off, but
otherwise object.constructor is the function that made the object's prototype.
It is equal to MyClass.prototype.constructor if there is a prototype,
and otherwise is MyClass.

If inheritance is done simply with just:
    SubClass.prototype = new BaseClass();
then we have:
    var base = new BaseClass();
    var sub = new SubClass();
    var test_bcb = base.constructor === BaseClass; // undefined behavior. true in IE5Mac, false in safari
    var test_scs = sub.constructor === SubClass;  // false always.
    var test_scb = sub.constructor === BaseClass;  // undefined behavior. true in IE5Mac, false in safari.

If inheritance is done with:
    SubClass.prototype = new BaseClass();
    SubClass.prototype.constructor = SubClass;
then 
    var base = new BaseClass();
    var sub = new SubClass();
    var test_bcb = base.constructor === BaseClass; // undefined behavior. true in IE5Mac, false in Safari
    var test_scs = sub.constructor === SubClass;  // true always.
    var test_scb = sub.constructor === BaseClass;  // false always.

If more involved conventions are used then it could be done. For example,
Explicitly setting a .__proto__ member in the constructor function body,
or setting 
    SubClass.prototype.super = BaseClass;
among many other approaches.
But those approaches require consistent cooperation by the programmer.

Something that will work as long as inheritance isn't used:

var bu_global_this = this;
function bu_instanceof_partial(object, ctor) {
  if (!object || object === bu_global_this) return false;
  if (object.constructor === ctor) return true;
  throw "beat's me";
}
*/


/****************************************************************
* optional hooks for notifying library that this is done.
****************************************************************/
// for Burst
if (typeof bu_loaded != 'undefined') bu_loaded('fix_ecma.js');
// for NetWindows
if (typeof __scripts__ != 'undefined') {
	__scripts__.provide(__config__.corePath+"fix_ecma.js");
	__scripts__.finalize(__config__.corePath+"fix_ecma.js");
}
