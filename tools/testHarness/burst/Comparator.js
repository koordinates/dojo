/**
* @file Comparator.js
* Defines burst.Comparator, and some predefined instances for different object types.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/**
* Class representing a comparator function for a particular object type and behavior.
* Each instance has either or both of a <var>convert</var> and a <var>compare</var>
* function.
* The <var>convert</var> function, if any, is called on each Array item exactly
* once prior to sorting, as preprocessing.
* The <var>compare</var> is used to compare two values (the return values of <var>convert</var>,
* if any).
* If no <var>compare</var> is defined, then the native sort comparator is used (presumably
* lexical String compare).
*
* The <var>convert</var> may return undefined, null, or NaN to indicate something that
* cannot be parsed. The <var>compare</var> function need not test for those cases; it
* will not be given them.
*
* The <var>convert</var> may assume that its input is a (non-null) String and
* is already left trimmed (via burst.Text.ltrim).
*
* Note that the Array.sort comparator in ECMAScript is like Java and C, in that it returns a number
* less than, equal to, or greater than zero (like <code>a - b</code>).
* This differs from the C++ STL, which uses a boolean <code>less</code> function in its sort template.
*
* The predefined comparators are these:
* <dl>
* <dt>string:cs</dt><dd>case-sensitive String</dd>
* <dt>string:cis</dt><dd>case-insensitive String</dd>
* <dt>date:native</dt><dd>any String that Date.parse understands</dd>
* <dt>integer:10</dt><dd>calls parseInt(v,10)</dd>
* <dt>float</dt><dd>calls parseFloat(v)</dd>
* </dl>
*/
//:CLBEGIN Comparator

/**
* The constructor. It automatically registers the instance using the name.
* @param name Globally unique name.
* @param convert Optional preprocessing function.
* @param compare Comparison function to use if other than case-sensitive String compare.
*/
//:CLCONSTRUCT Comparator(String name, Function convert, Function compare)
function BU_Comparator(name, desc, convert, compare) {
  this.name_ = name;
  this.description_ = desc;
  this.convert = convert;
  this.compare = compare;
  // register this instance
  burst.Comparator.ALL[name] = this;
}
burst.Comparator = BU_Comparator;

burst.Comparator.prototype.toString = function() {
  return 'burst.Comparator{' + 'name_: "' + this.name_ + '", description_: ' + 
     (this.description ? '"' + this.description + '"' : this.description) +
     ', convert: ' + this.convert + ', compare: ' + this.compare + '}';
}

/**
* Get an burst.Comparator instance by name. 
* @param name The name of the comparator.
* @param missing_ok optional. If true, and none exists, return null. Otherwise an error is thrown.
*/
//:CLCMETHOD getComparator(String name, Boolean missing_ok)
burst.Comparator.getComparator = function(name, missing_ok) {
  if (bu_in(name, burst.Comparator.ALL)) {
    return burst.Comparator.ALL[name];
  }
  return missing_ok ? null : bu_throw("no such comparator '" + name + "'");
}

/**
* An implementation of what (we believe) the native Array.sort
* does for String comparison when the sort function is not provided.
*/
//:CLCMETHOD Number stringCompare(String a, String b)
burst.Comparator.stringCompare = function(a, b) {
  return (a<b ? -1 : (a==b ? 0 : 1));
}

//:CLEND
//:NSEND

function bu_minus(a,b) {return a - b;}

burst.Comparator.ALL = {};


new burst.Comparator('string:cs', 'case-sensitive String', null, null);

new burst.Comparator('string:cis', 'case-insensitive String', function(v) {return v.toUpperCase()}, null);

new burst.Comparator('date:native', 'any String that Date.parse understands', 
    // may return NaN
    function(v) {return Date.parse(v)}, 
    bu_minus);

new burst.Comparator('integer:10', 'calls parseInt(v,10)',
    // may return NaN
    function(v) {return parseInt(v,10)},
    bu_minus);

new burst.Comparator('float', 'calls parseFloat(v)',
    function(v) {return parseFloat(v)},
    bu_minus);

bu_loaded('burst.Comparator');
