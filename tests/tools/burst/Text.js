/**
* @file Text.js
* Defines burst.Text which contains static string utilities.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/**
* Scoping class to hold static utilities for String.
*/
//:NSBEGIN Text
burst.Text = {};

/** replace all backslashes with two backslashes */
//:NSFUNCTION String doubleEscape(String s)
burst.Text.doubleEscape = function(s) {return s.indexOf('\\') != -1 ? s.replace(/\\/g, '\\\\') : s;}

/** 
* produce a valid quoted string.
* Internal quotes and backslashes are escaped with backslash.
* If escapeEOL is true, single character "\n" is converted to two characters.
*
* Remember that eval("\"\\\\\"").length == 1
*
* @param str The input string.
* @param escapeEOL optional. If true, "\n" as single character becomes two.
* @param notIfIdent optional. if true, just return the argument if it is a legal JS identifier.
*/
//:NSFUNCTION String quote(String str, Boolean escapeEOL, Boolean notIfIdent)
burst.Text.quote = function(s, escapeEOL, notIfIdent) {
  //bu_debug("burst.Text.quote(",s,",",escapeEOL,",",notIfIdent,")");
  if (notIfIdent && burst.Lang.isLegalIdentifier(s)) return s;

  s = burst.Text.doubleEscape(s);

  // maybe convert EOL characters
  if (escapeEOL) {
     // bu_debug("escaping eols, index=" + s.indexOf("\n"));
     s = s.replace(/\n/g, "\\n");
  }

  // if no internal double quote, just quote it
  if (s.indexOf('"')==-1) return '"' + s + '"';

  // optimization to use single quote if double quote but no single quote internally
  if (s.indexOf("'")==-1) return "'" + s + "'";

  // escape double quotes with backslash
  s = '"' +  s.replace(/\"/g, '\\"') + '"';

  return s;
}

/** Return true if s ends with s2 */
//:NSFUNCTION Boolean endsWith(String s, String s2)
burst.Text.endsWith = function(s, s2) {
  if (s2.length > s.length) return false;
  //return s.substring(s2.length - s.length) == s2;
  return s.substring(s.length - s2.length) == s2;
}

/** Return true if s starts with s2 */
//:NSFUNCTION Boolean startsWith(String s, String s2)
burst.Text.startsWith = function(s, s2) {
  if (s2.length > s.length) return false;
  return s.substring(0,s2.length) == s2;
}

/**
* Trim any leading white space. Here "white space" means matching \s, which in EcmaScript means
* any white space or line terminator:
<pre>
    TB 0x09  9
    VT 0x0B 11
    FF 0x0C 12
    SP 0x20 32
    (any unicode "space separator")
    LF 0x0A 10
    CR 0x0D 15
    LS 0x2028
    PS 0x2029
</pre>
* Note that java.lang.String.trim will remove all characters <32. This is more aggressive than \s.
*/
//:NSFUNCTION String ltrim(String s)
burst.Text.ltrim = function(s) {
  // Could do s.charCodeAt(0) > 20 in JScript 5.5
  if (!s || s.length == 0 || s.charAt(0) > ' ') return s;
  return s.replace(/^\s+/,'');
}

/**
* Trim leading and trailing white space
* TODO: compare speed of bu_trim* alternatives.
*/
//:NSFUNCTION String trim(String s)

// 2 regexps, with checking
function bu_trim(s) {
  if (!s || s.length == 0) return s; 
  if (s.charAt(0) <= ' ') s = s.replace(/^\s+/,'');
  if (s.length > 0 && s.charAt(s.length - 1) <= ' ') s = s.replace(/\s+$/,'');
  return s;
}

// 2 regexps, minor checking
function bu_trim2(s) {
  if (!s || s.length == 0) return s; 
  return s.replace(/^\s+/,'').replace(/\s+$/);
}

// 1 regexp, minor checking
function bu_trim3(s) {
  if (!s || s.length == 0) return s; 
  return s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}

// 1 regexp, no checking
function bu_trim3a(s) {
  return s.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
}

// 1 regexp, minor checking
function bu_trim4(s) {
  if (!s || s.length == 0) return s; 
  return s.replace(/^\s+|\s+$/g,'');
}

burst.Text.trim = bu_trim3a;
//burst.Text.trim = (bu_jscript_version && bu_jscript_version < 5.5) ? bu_trim2 : bu_trim;

/** Return true if s is false, empty, or entirely white space */
//:NSFUNCTION Boolean isWhite(String s)
burst.Text.isWhite = function(s) {return !s || s == '' || /^\s*$/.test(s);}

// IE5.0 PC does not support non-greedy regexps at parse phase, so
// don't use  /'.*?'|".*?"|\w+/g;
//burst.Text.DEFAULT_SPLIT_RE_STRING = '\'.*?\'|".*?"|';
burst.Text.DEFAULT_SPLIT_RE_STRING = '\'[^\']*\'|"[^\"]*"|';
//burst.Text.DEFAULT_SPLIT_RE = /'.*?'|".*?"|\w+/g;
burst.Text.DEFAULT_SPLIT_RE = /'[^']*'|"[^"]*"|\w+/g;

/** 
* Split the string into an Array of terms. A term is either an unquoted single-word token,
* or is a quoted string (single or double quotes).
* No white space is preserved except within quoted strings.
* The surrounding quotes on quoted terms are preserved.
*/
//:NSFUNCTION Array splitTerms(String s, String tokenre)
burst.Text.splitTerms = function(s, tokenre) {
  var re;
  if (tokenre) {re = new RegExp(burst.Text.DEFAULT_SPLIT_RE_STRING + tokenre,'g');}
  else {
    if (!burst.Text.DEFAULT_SPLIT_RE) {burst.Text.DEFAULT_SPLIT_RE = new RegExp(burst.Text.DEFAULT_SPLIT_RE_STRING + '\\w+', 'g');}
    re = burst.Text.DEFAULT_SPLIT_RE;
  }
  
  var matches = s.match(re);
  return matches ? matches : [];
}

/**
* Remote any surrounding quotes (single or double).
*/
//:NSFUNCTION String unquote(String s)
burst.Text.unquote = function(s) {
  if (!s || s.length == 0) return s;
  if (s.charAt(0) == "'" || s.charAt(0) == '"') return s.substring(1,s.length-1);
  return s;
}

/**
* If string length is less than or equal maxlen, return it.
* Otherwise truncate string to maxlen and append '...' (so total
* length is maxlen + 3).
*/
//:NSFUNCTION String ellipsis(String s, Number maxlen)
burst.Text.ellipsis = function(s, maxlen) {
  return s.length <= maxlen ? s : s.substring(0,maxlen) + '...';
}

/**
* True if the given string is a digit char ([0-9]).
*/
//:NSFUNCTION Boolean isDigit(String s)
burst.Text.isDigit = function(s) {
  return s && s.length == 1 && '0123456789'.indexOf(s) != -1;
}

/**
* True if the given string is a letter char ([a-zA-Z]).
*/
//:NSFUNCTION Boolean isLetter(String s)
burst.Text.isLetter = function(s) {
  return s && s.length == 1 && /[a-zA-Z]/.test(s);
}

/**
* Returns a String with enough leading zeros to make it a total length len.
* If the input s is not a string it is made into one.
*/
//:NSFUNCTION String zeroPad(Object s, Number len)
burst.Text.ZEROS10 = '0000000000';
burst.Text.zeroPad = function(s, len) {
  if (typeof s != 'string') s = '' + s;
  var padlen = len - s.length;
  if (padlen < 0) return s;
  else if (padlen == 0) return s;
  else if (padlen == 1) return '0' + s;
  else if (padlen == 2) return '00' + s;
  else if (padlen < 10) return burst.Text.ZEROS10.substring(0,padlen) + s;
  else return burst.Text.ZEROS10 + arguments.callee(s, len - 10);
}

// utility to zero-pad a 1- or 2- digit number.
function buzp2(i) {return i >= 10 ? "" + i : "0" + i;}

// zero-pad a 3-char field
function buzp3(i) {
  return i > 100 ? '' + i : (i > 10 ? '0' + i : '00' + i);
}

// zero-pad 4-char field
function buzp4(i) {
  var s = '' + i;
  return '0000'.substring(s.length) + s;
}


/**
* space pad to length len.
* @param s The input string; if not a string it is converted.
* @param len The intended output length.
* @param is_lj Optional, defaults to false, whether to left-justify in the field.
*/
//:NSFUNCTION String spacePad(Object s, Number len, Boolean is_lj)
burst.Text.SPACES10 = '          ';
burst.Text.spacePad = function(s, len, is_lj) {
  if (arguments.length < 3) is_lj = false;
  if (typeof s != 'string') s = '' + s;
  var padlen = len - s.length;
  if (padlen < 0) return s;
  else if (padlen == 0) return s;
  else if (padlen == 1) return is_lj ? s + ' ' : ' ' + s;
  else if (padlen == 2) return is_lj ? s + '  ' : '  ' + s;
  else if (padlen < 10) return is_lj ? s + burst.Text.SPACES10.substring(0,padlen) : burst.Text.SPACES10.substring(0,padlen) + s; 
  else return is_lj ? arguments.callee(s, len - 10, is_lj) + burst.Text.SPACES10 :
  burst.Text.SPACES10 + arguments.callee(s, len - 10, is_lj); 
}

// will also downcase the rest of the string.
burst.Text.ucfirst = function(s) {
  var uc = s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
  return uc;
}

/**
* Formatted output to the Writer writer.
*
* Supported flags:
*   "0"  zero padding right justify, such as "%0d"
*   "-"  left justify, such as "%-10s" 
*   " "  blank for positive signed conversion, such as "% d"
*   "+"  sign for positive signed conversion, such as "%+d"
*   "#"  alternative form ("%#x")
*        prepend '0' if necessary for 'o'
*        prepend '0x' for 'x' and '0X' for 'X'
*        ensure a decimal point for aAeEfgG
*        do not remove trailing zeros for gG
*
* Unsupported flags:
*   "'"  use a thousands grouping character, if the locale says so (SUSv2 standard)
*
* Supported widths:
*   "10" minimum field width (left justified if "%-10s")
*   ".5" precision = 
*        for 'diouxX', minimum number of digits for zero padding, rest is space on left or right according to "-" flag
*        for 'eEf', number of digits after decimal
*        for 'gG', number of sig digits for either decimal or exponential notation
*        for 's', maximum number of characters to truncate at
*
* Unsupported length modifiers (any of these): 
*   "h"  short, 
*   "l"  long
*   "ll" long long
*   "L"  long double

* Supported conversion specifiers:
*   s        string
*   c        unsigned char
*   bdiouxX  int, various bases (b is non-standard, for base 2)
*   eE       double, exponential notation
*   f        double, decimal notation 
*   gG       f or e according to exponent (f or E if "G") 
*   %        an escaped '%'
*
* Unsupported conversion specifiers:
*   DOU      long int
*   aA       double exponential hex notation 
*   p        pointer
*   n        number of characters written so far stored in the argument
*
* Supported arguments:
*   non-positional arguments ("%*s" or "%.*s" for width or precision)
*       negative width value means lj; negative precision means unspecified
*
* Unsupported arguments:
*   positional arguments ("%3$s" or "%*1$s" or "%.*2$s" for arg or width or precision)
*
* Returns number of characters written for fprintf, and the string for sprintf. 
* 
* CAVEATS:
*   for 'uboxX' specifiers, we convert negative args to 32-bit unsigned by (0xffffffff + i + 1)
*   we currently format double NaN and +-infinity as if they were 0 (pre-C99 convention)
*
* BUGS:
*   the known unsupported items that are meaningful in JavaScript are positional arguments and thousands grouping
*
* TODO: 
*   would toLocaleString help with implementing SUSv2 ' radic?
*
* See also:
* Mavi Gozler (mavigozler@yahoo.com )
*   http://groups.google.com/groups?threadm=5446f761.0211181406.4a0388b0%40posting.google.com&rnum=8
*
* Note that ECMAScript 262-3 has Number.toFixed(), Number.toExponential(), Number.toPrecision() 
* These are not available in IE 5.0 PC or Safari1, but are implemented in fix_ecma.js.
*
* The implementation here relies on String.replace(searchValue, replaceValue) with replaceValue
* being a function. Many ECMAScript environments do not support this properly, despite it being standard.
* An implementation is available in fix_ecma.js.
*/

//:NSFUNCTION Number fprintf(Writer writer, String fmt, ...)
burst.Text.fprintf = function(writer, fmt) {
  var s = burst.Text.sprintf_internal(fmt, arguments, 2);
  if (typeof writer == 'function') writer(s);
  else writer.write(s);
  return s.length;
}

/**
Return the sprintf result as a String.
*/
//:NSFUNCTION String sprintf(String fmt, ...)
burst.Text.sprintf = function(fmt) {
  return burst.Text.sprintf_internal(fmt, arguments, 1);
}

burst.Text.sprintf_internal = function(fmt, args, args_offset) {
  // matches a single directive
  var DIR_RE = /\%([\'0 +\-\#]*)(\*|\d+)?(\.)?(\*|\d+)?([\%scdeEfgGiouxX])/g;

  var argi = args_offset;

  // private closure to return the value of the argument at position pos.
  // throws if one isn't available.
  function get_arg(pos) {
    var ind = (arguments.length == 0 ? argi++ : pos + args_offset);
    if (ind >= args.length) {
       var mess = "got " + (args.length - args_offset) + " printf arguments, insufficient for '" + fmt + "'" +
          " (args.length=" + args.length + " args_offset=" + args_offset + " ind=" + ind + " argi=" + argi + ")";
       bu_alert(mess);
       throw Error(mess);
    }
    return args[ind];
  }

  var nsubs = 0;
  // private function to pass in to fmt.replace
  function do_match(matching_str, flags, minwidth, period, precision, specifier, offset, input_str) {
     nsubs++;
     // if %%, eat no arguments and return '%'.
     if (specifier == '%') {
       if (matching_str != '%' + specifier) throw Error("unexpected '%' specifier in format '" + fmt + "'");
       return '%';
     }
     var sd = burst.Text.sprintf_directive(get_arg, flags, minwidth, period, precision, specifier);
     return sd;
  }

  // do the replace
  var s = fmt.replace(DIR_RE, do_match);

  // double-check that there wasn't some parsing problem, if we didn't change the fmt string at all.
  if (s == fmt && fmt.indexOf('%') != -1) {
       var mess = "could not parse format string '" + fmt + "'";
       bu_alert(mess);
       throw Error(mess);
  }

  return s;
}

/*
Subroutine for sprintf.

Implements one formatting directive.
*/
burst.Text.sprintf_directive = function(get_arg, flags, minwidth, period, precision, specifier) {
   var sign = ''; // can be '', ' ', '+'
   var zp = false; // true for zero-pad
   var lj = false; // true for right justify
   var radic = false; // true to show radic (thousands grouping)
   var alt = false;
   for(var fi=flags.length; fi--;) {
     switch(flags.charAt(fi)) {
       case ' ': sign = ' '; break;
       case '+': sign = '+'; break;
       case '0': zp = true; break;
       case '-': lj = true; break;
       case '\'': radic = true; throw Error("flag ' not supported"); break;
       case '\#': alt = true; break;
       default: throw Error("bad formatting flag '" + flags.charAt(fi) + "'");
     }
   }
   if (lj) zp = false; // "-" overrides "0" 

   var minw = 0;
   if (minwidth == '*') {
       minw = parseInt(get_arg());
       if (isNaN(minw)) throw Error("the argument for * width is not a number: " + minwidth);
       // negative width means lj
       if (minw < 0) {lj = true; minw = - minw;}
   }
   else if (minwidth) {
     minw = parseInt(minwidth);
   }

   var prec = 1; // default precision is 1 for int, so that number 0 is '0'.
   // default precision is 6 for double
   if (period == '.') {
     // just '.' means precision is 0, so that number 0 is empty string
     if (precision == '*') {
       prec = parseInt(get_arg());
       if (isNaN(prec)) throw Error("the argument for * precision is not a number: " + precision);
       // negative precision means unspecified
       if (prec < 0) {prec = 1; period = '';}  
     }
     else if (precision) {
       prec = parseInt(precision);
     }
     else prec = 0;
   }

   var arg = get_arg();

   // C standards says that max width only applies to 's' specifier.
   var maxw = -1;

   var to_upper = false;
   var is_unsigned = false;
   var is_int = false;
   var is_double = false;
   var double_notation; // 'e','f','g' 
   var base;

   var s;
   switch(specifier) {
    case 'b': base = 2; is_int = true; break;
    case 'o': base = 8; is_int = true; break;

    case 'X': to_upper = true; // fall through
    case 'x': base = 16; is_int = true; break;

    case 'u': is_unsigned = true; // fall through
    case 'd': case 'i': base = 10; is_int = true; break;

    case 'c': {
         var num = parseInt(arg);
         s = isNaN(num) ? '' + num : String.fromCharCode(num); 
         break;
    }
    case 's': s = arg; maxw = period == '.' ? prec : -1; break;

    case 'E': to_upper = true; // fall through
    case 'e': is_double = true; double_notation = 'e'; break;
  
    case 'f': is_double = true; double_notation = 'f'; break;

    case 'G': to_upper = true; // fall through
    case 'g': is_double = true; double_notation = 'g'; break;

    default: throw Error("unexpected specifier '" + specifier + "'");
   }

   if (is_int) {
     // a specified precision means no zero padding
     if (period == '.') zp = false;
     s = burst.Text.format_int(arg, prec, base, is_unsigned, to_upper, sign, radic, alt);
   }
   else if (is_double) {
     if (period != '.') prec = 6;
     s = burst.Text.format_double(arg, prec, double_notation, to_upper, sign, alt); 
   }
   var field = burst.Text.fit_field(s, lj, zp, minw, maxw); 
 
   //print("sprintf_directive(" + burst.Lang.argumentsToArray(arguments).join(',') + ") -> '" + field + "'");
   return field;
}

/*
Subroutine for sprintf.

Assumes that if lj, then !zp.
*/
burst.Text.fit_field = function(s, lj, zp, minw, maxw) {
  if (maxw >= 0 && s.length > maxw) return s.substring(0,maxw);
  if (zp) return burst.Text.zeroPad(s, minw);
  return burst.Text.spacePad(s, minw, lj);
}

/*
Subroutine for sprintf.

Note that Rhino has a bug with large unsigned numbers: (4294967286).toString(16) == '7fffffff.?'
  See http://bugzilla.mozilla.org/show_bug.cgi?id=217346
*/
burst.Text.format_int = function(arg, prec, base, is_unsigned, to_upper, sign, radic, alt) {
  var i = parseInt(arg);
  if (!isFinite(i)) { // isNaN(f) || f == Number.POSITIVE_INFINITY || f == Number.NEGATIVE_INFINITY)
     // allow this only if arg is number
    if (typeof arg != 'number') throw Error("format argument '" + arg + "' not an integer; parseInt returned " + i);
    //return '' + i;
    i = 0;
  }
  var s;
  // if not base 10, make negatives be positive
  // otherwise, (-10).toString(16) is '-a' instead of 'fffffff6'
  if (i < 0 && (is_unsigned || base != 10)) {
    i = 0xffffffff + i + 1;
  } 

  if (i < 0) {
     s = (- i).toString(base);
     s = '-' + burst.Text.zeroPad(s, prec);
  }
  else {
     s = i.toString(base);
     // need to make sure that argument 0 with precision==0 is formatted as ''
     s = (i == 0 && prec == 0) ? '' : burst.Text.zeroPad(s, prec);
     if (sign) s = sign + s;
  }
  if (base == 16) {
     if (alt) s = '0x' + s;
     s = to_upper ? s.toUpperCase() : s.toLowerCase();
  }
  if (base == 8) {
     if (alt && s.charAt(0) != '0') s = '0' + s;
  }
  return s;
}

/*
Subroutine for sprintf.

This relies on Number.toFixed, Number.toPrecision, Number.toExponential.
Fallback implementations of these exist in fix_ecma.js.
*/
burst.Text.format_double = function(arg, prec, double_notation, to_upper, sign, alt) {
  var f = parseFloat(arg);
  if (!isFinite(f)) { // isNaN(f) || f == Number.POSITIVE_INFINITY || f == Number.NEGATIVE_INFINITY)
     // allow this only if arg is number
    if (typeof arg != 'number') throw Error("format argument '" + arg + "' not a float; parseFloat returned " + f);
    // C99 says that for 'f':
    //   infinity -> '[-]inf' or '[-]infinity' ('[-]INF' or '[-]INFINITY' for 'F')
    //   NaN -> a string  starting with 'nan' ('NAN' for 'F')
    // this is not commonly implemented though.
    //return '' + f;
    f = 0;
  }

  var s;

  switch(double_notation) {

  case 'e': {
     s = f.toExponential(prec); 
     break;
  }

  case 'f': {
      s = f.toFixed(prec); 
     break;
  }

  case 'g': {
    // C says use 'e' notation if exponent is < -4 or is >= prec
    // ECMAScript for toPrecision says use exponential notation if exponent is >= prec,
    // though step 17 of toPrecision indicates a test for < -6 to force exponential.
    if (Math.abs(f) < 0.0001) {
      //print("forcing exponential notation for f=" + f);
      s = f.toExponential(prec > 0 ? prec - 1 : prec);
    }
    else {
      s = f.toPrecision(prec); 
    }

    // In C, unlike 'f', 'gG' removes trailing 0s from fractional part, unless alternative format flag ("#").
    // But ECMAScript formats toPrecision as 0.00100000. So remove trailing 0s.
    if (!alt) { 
       //print("replacing trailing 0 in '" + s + "'");
       s = s.replace(/(\..*[^0])0*/, "$1");
       // if fractional part is entirely 0, remove it and decimal point
       s = s.replace(/\.0*e/, 'e').replace(/\.0$/,'');
    }
    break;
  }
  default: throw Error("unexpected double notation '" + double_notation + "'");
  }

  // C says that exponent must have at least two digits.
  // But ECMAScript does not; toExponential results in things like "1.000000e-8" and "1.000000e+8".
  // Note that s.replace(/e([\+\-])(\d)/, "e$10$2") won't work because of the "$10" instead of "$1".
  // And replace(re, func) isn't supported on IE50 or Safari1.
  s = s.replace(/e\+(\d)$/, "e+0$1").replace(/e\-(\d)$/, "e-0$1");

  // Ensure a '0' before the period.
  // Opera implements (0.001).toString() as '0.001', but (0.001).toFixed(1) is '.001'
  if (bu_UA.isOpera) s = s.replace(/^\./, '0.');

  // if alt, ensure a decimal point
  if (alt) {
    s = s.replace(/^(\d+)$/,"$1.");
    s = s.replace(/^(\d+)e/,"$1.e");
  }

  if (f >= 0 && sign) s = sign + s;
  s = to_upper ? s.toUpperCase() : s.toLowerCase();

  return s;
} 

//:NSEND

bu_loaded('burst.Text', ['burst.Lang']);

