/**
* @file UserAgent.js
*
* Singleton class burst.web.UserAgent to identify the browser, and its global instance bu_UA.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

/**
Singleton class to provide identifying information about the current browser, and any bugs and features it may have.
The bu_UA global object is an instance of burst.web.UserAgent.

<h3>user agent identifiers</h3>
An instance has these member attributes which describe the browser:

<dl>
<dt>family_</dt>
  <dd>One of the BU_UA_FAMILY_* constants. This is indicates the ancestry of the source code of the browser. 
  Thus Konqueror and Safari are in the same family, and Netscape and Mozilla are in the same family.
  But IE5-Mac is not in the same family as IE-Windows.
 </dd>

<dt>brand_</dt>
  <dd>One of the BU_UA_BRAND_* constants. This indicates the associated brand name of the browser.</dd>

<dt>version_</dt>
   <dd>A float giving the brand-specific release version
    (for example "1.2" might be a version for Mozilla).
   </dd>

<dt>generation_</dt>
   <dd>This is an integer indicating the "generation".
   A fairly complete DOM, and the highest number currently set, is 5. 
   That is also the minimum number we support.
   This "generation" matches ppk's definition of "version" at http://www.xs4all.nl/~ppk/js/browsers.html
</dd>

<dt>os_</dt>
   <dd>One of the BU_UA_OS_* constants.</dd>

</dl>

For a good discussion, see http://www.xs4all.nl/~ppk/js/detect.html

A good list of useragent strings in the wild is http://www.xwolf.de/browserplaza/appnames.shtml
An older larger list is: http://www.browserlist.browser.org/browser_mappings_list_big.html

For Netscape agent strings, see:
- http://devedge.netscape.com/viewsource/2002/gecko-useragent-strings/
- http://devedge.netscape.com/viewsource/2002/browser-statistics/

<h3>browser checks, object detection, and bug detection</h3>

You generally do not want to have explicit tests for particular browser makes/versions in
your code, as you'll inevitably have false positives and false negatives, and future maintainers
will not know what you are really testing for.

Object detection works in some cases, but not always: it is not sufficient for
circumstances where objects or methods exist, but there are crippling defects
in their implementation. For those cases, something more advanced is needed. 

Ideally, we would have automatic
"bug detection" when "object detection" is insufficient.
This could be done as a sort of lazy "autoconf" that kicks in the first time
a feature is queried for while running; thereafter the answer would be cached. 

If it didn't have so many technology dependencies, some variant of the W3 DOM2 unit tests could be used 
( http://www.w3.org/2002/11/DOM-Level-2-HTML-Results/ ).

Our own <a href="../../tests/testbrowser/browser_bugs.html">browser_bugs.html</a> test page (in this release) has a few tests as well.

For now however, we hardcode the answers; we do not determine the correct answer at run time.
That is, the implementation of functions like <code>Boolean bug_iframe_display_none()</code> 
returns an answer based on browser make and version.

<h3>user agent bugs and features</h3>

We distinguish between "bugs" and "features":
- a "bug" is a total lack of some standardized ability, or a crippling problem with it.
- a "feature" is something we may want to take advantage of, but it is not mandated by any standard.

Generally speaking, a "bug" should be associated with a "less than or equal" test on
particular browser brands and versions, indicating when it was fixed by.

A "feature" should be associated with a "greater than or equal" test on
particular browser brands and versions, indicating when it started being available.

We have functions such as <code>bug_iframe_display_none()</code> for bugs,
and <code>can_iframe_onload_dyn()</code> for features.


*/
//:CLBEGIN burst.web.UserAgent

/** Constant strings for user agent family. */
//:CLCONSTANTS String
/** IE, excluding IE5 Mac */
var BU_UA_FAMILY_IE = 'ie';
/** IE5 Mac */
var BU_UA_FAMILY_IEMAC = 'iemac';
/** Opera. FYI, they call their engine "Presto" */
var BU_UA_FAMILY_OPERA = 'opera';
/** Including konqueror, safari, atheos, and recent OmniWeb */
var BU_UA_FAMILY_KHTML = 'khtml';
/** Including mozilla, netscape */
var BU_UA_FAMILY_GECKO = 'gecko';
/** icab. */
var BU_UA_FAMILY_ICAB = 'icab';
/** InFix acquired Wind River AS which acquired ICEStorm from norwegian icesoft.no . Uses Mozilla Rhino for javascript. */
var BU_UA_FAMILY_ICE = 'ice';
/** See http://abe.nwr.jp/w3m/w3m-js-en.html for javascript. */
var BU_UA_FAMILY_W3M = 'w3m';
/** There is a navigator object, but not one we understand. */
var BU_UA_FAMILY_UNKNOWN = 'unknown';
/** There is not even a navigator object. */
var BU_UA_FAMILY_NONE = 'none';
//:ENDCONSTANTS

/** Constant strings for user agent brand. */
//:CLCONSTANTS String
var BU_UA_BRAND_KONQ = 'konqueror';
var BU_UA_BRAND_SAFARI = 'safari';
var BU_UA_BRAND_OPERA = 'opera';
var BU_UA_BRAND_IE = 'ie';
var BU_UA_BRAND_IEMAC = 'iemac';
var BU_UA_BRAND_NETSCAPE = 'netscape';
var BU_UA_BRAND_MOZILLA = 'mozilla';
var BU_UA_BRAND_ICAB = 'icab';
var BU_UA_BRAND_ICE = 'ice';
var BU_UA_BRAND_W3M = 'w3m';
var BU_UA_BRAND_UNKNOWN = 'unknown';
var BU_UA_BRAND_NONE = 'none';
//:ENDCONSTANTS

/** Constant strings for user agent operating system. */
//:CLCONSTANTS String
var BU_UA_OS_WIN = 'windows';
var BU_UA_OS_MAC = 'mac';
var BU_UA_OS_LINUX = 'linux';
var BU_UA_OS_X11 = 'x11';
var BU_UA_OS_UNKNOWN = 'unknown';
//:ENDCONSTANTS


// set by side-effect in bu_first_match
var bu_last_index;
var bu_last_match;

// return the cdr for the first car that matches.
function bu_first_match(str, pairs) {
  for(var i=0;i<pairs.length;++i) {
    var s = pairs[i++];
    var val = pairs[i];
    bu_last_index = str.indexOf(s);
    if (bu_last_index != -1) {bu_last_match = s; return val;}
  }
  return null;
}

//:CLCONSTRUCT burst.web.UserAgent()
burst.web.UserAgent = function() {
  if (typeof navigator == 'undefined') {
    this.family_ = BU_UA_FAMILY_NONE;
    this.brand_ = BU_UA_BRAND_NONE;
    return;
  }
  var ua = navigator.userAgent.toLowerCase();

  var os = bu_first_match(ua, 
     ['win',   BU_UA_OS_WIN,
      'mac',   BU_UA_OS_MAC,
      'linux', BU_UA_OS_LINUX,
      'x11',   BU_UA_OS_X11
     ]) || BU_UA_OS_UNKNOWN;

  bu_last_match = bu_last_index = null;

  var brand = bu_first_match(ua,
     ['konqueror', BU_UA_BRAND_KONQ,
      'safari',    BU_UA_BRAND_SAFARI,
      'opera',     BU_UA_BRAND_OPERA,
      'icebrowser',BU_UA_BRAND_ICE,
      'icab',      BU_UA_BRAND_ICAB,
      'w3m',       BU_UA_BRAND_W3M,
      'msie',      BU_UA_BRAND_IE,
      'netscape6', BU_UA_BRAND_NETSCAPE,
      'netscape',  BU_UA_BRAND_NETSCAPE, // should check not compatible
      'gecko',     BU_UA_BRAND_MOZILLA // catch all
   ]) || BU_UA_BRAND_UNKNOWN;

  if (typeof navigator.__ice_version != 'undefined') {
    brand = BU_UA_BRAND_ICE;
  }

  /*
   * generally the brand-specific version appears in the ua string after the brand name.
   *
   * IE
   *   Mozilla/4.0 (compatible; MSIE 5.01; Windows 95; QXW0332l)
   *   Mozilla/4.0 (compatible; MSIE 5.5; AOL 5.0; Windows 98)
   *   Mozilla/4.0 (compatible; MSIE 5.5; AOL 7.0; Windows NT 5.0)
   *   Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; (R1 1.3))
   * Konqueror
   *   Mozilla/5.0 (compatible; Konqueror/3)
   *   Mozilla/5.0 (compatible; Konqueror/2.2-11; Linux)
   *   Mozilla/5.0 (compatible; Konqueror/3.0.0; SunOS)
   * Safari
   *   Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-us) AppleWebKit/60 (like Gecko) Safari/60
   *   Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en) AppleWebKit/48 (like Gecko) Safari/48
   * Mozilla
   *   Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US; rv:1.1) Gecko/20020826
   *   Mozilla/5.0 (X11; U; Linux i686; en-US; rv:0.9.8) Gecko/20020204
   *   Mozilla/5.0 (X11; U; SunOS sun4u; en-US; rv:1.1a) Gecko/20020614
   * Galeon
   *   Mozilla/5.0 Galeon/1.2.5 (X11; Linux i686; U;) Gecko/20020809
   * Netscape
   *   Mozilla/5.0 (Windows; U; Windows NT 5.0; de-DE; rv:0.9.4) Gecko/20011019 Netscape6/6.2
   *   Mozilla/5.0 (X11; U; SunOS sun4u; en-US; rv:1.0.1) Gecko/20020719 Netscape/7.0
   * Opera
   *   Opera/6.0 (Windows 98; U) [de]
   *   Mozilla/4.0 (compatible; MSIE 5.0; Windows 2000) Opera 6.0 [de]
   *   Mozilla/4.0 (compatible; MSIE 6.0; MSIE 5.5; Windows XP) Opera 7.0 [de]
   *   Opera/7.01 (Windows NT 5.1; U) [en]
   * ICEBrowser
   *   ICEBrowser
   *   Mozilla/4.0 (compatible; MSIE 5.0; Windows98)
   *   Mozilla/5.0 (compatible; MSIE 4.0; MSIE 5.0; ICEBrowser; compatible; Netscape; Win98; I)
   *   (there is no version, see navigator.__ice_version;)
   * iCab
   *   iCab/2.8.2 (Macintosh; U; PPC; Mac OS X)
   * w3m
   *   Emacs-w3m/1.3.1 w3m/0.3.2.2 
   *   w3m/0.4.1-m17n-20030308
   *   w3m/0.3.1/FreeBSD-4.7RELEASE 
   */

  var ver = null;

  var rvind = ua.indexOf('rv:');
  var gecko_rv = (rvind == -1) ? null : parseFloat(ua.substring(rvind + 3));
  if (brand == BU_UA_BRAND_MOZILLA) {
     ver = gecko_rv;
  }
  if (!ver && bu_last_match) {
     ver = parseFloat(ua.substring(bu_last_index + bu_last_match.length + 1));
  }

  //Netscape 6.x and Mozilla 1.x are both 5th generation browsers.
  //IE 5.0 reports Mozilla/4.0 when it is 5th generation
  // we don't trust this at all
  //var gen = parseInt(ua.substring("Mozilla/".length));
  var gen;

  var fam = null;

  switch(brand) {
  case BU_UA_BRAND_IE: {
    fam = BU_UA_FAMILY_IE;
    if (ver >= 5) gen = 5;
    break;
  }
  case BU_UA_BRAND_NETSCAPE: {
    fam = BU_UA_FAMILY_GECKO;
    if (ver >= 6) gen = 5;
    break;
  }
  case BU_UA_BRAND_MOZILLA: {
    fam = BU_UA_FAMILY_GECKO;
    gen = 5;
    break;
  }
  case BU_UA_BRAND_ICAB: {
    fam = BU_UA_FAMILY_ICAB;
    gen = 4;
    break;
  }
  case BU_UA_BRAND_W3M: {
    fam = BU_UA_FAMILY_W3M;
    gen = 4;
    break;
  }
  case BU_UA_BRAND_ICE: {
    fam = BU_UA_FAMILY_ICE;
    ver = navigator.__ice_version;
    gen = 5;
    break;
  }
  case BU_UA_BRAND_KONQ: {
    fam = BU_UA_FAMILY_KHTML;
    gen = ver > 2 ? 5 : 4;
    break;
  }
  case BU_UA_BRAND_SAFARI: {
    fam = BU_UA_FAMILY_KHTML;
    gen = 5;
    break;
  }
  case BU_UA_BRAND_OPERA: {
    fam = BU_UA_FAMILY_OPERA;
    gen = (ver < 7) ? 4 : 5;
    break;
  }
  default: {
    throw Error("unexpected brand " + brand);
  }
  }

  if (os == BU_UA_OS_MAC && fam == BU_UA_FAMILY_IE) {
    fam = BU_UA_FAMILY_IEMAC;
    brand = BU_UA_BRAND_IEMAC;
  }

  this.os_ = os;
  this.brand_ = brand;
  this.version_ = ver;
  this.gecko_version_ = gecko_rv;
  this.family_ = fam;
  this.generation_ = gen;

  //this.family = function() {return this.family_};
}

/** convenience for this.family_ == BU_UA_FAMILY_IE */
//:CLIMETHOD Boolean is_family_ie()
burst.web.UserAgent.prototype.is_family_ie = function() {return this.family_ == BU_UA_FAMILY_IE};

burst.web.UserAgent.prototype.is_family_opera = function() {return this.family_ == BU_UA_FAMILY_OPERA};

// Opera has window.attachEvent and it works, even if it does return false.
//return this.family_ != BU_UA_FAMILY_OPERA;
burst.web.UserAgent.prototype.has_window_event_listener = function() {return true};

/** convenience to determine whether there is a real browser (useful in the face of BUFakeDom) */
burst.web.UserAgent.prototype.is_browser = function() {return this.family_ !== BU_UA_FAMILY_NONE;}

/*
* bugs. should generally be less-than tests.
*/

/** true if the UA is unable to set the value of a 'style' attribute when the attribute name is a String. */
//:CLIMETHOD Boolean bug_set_style_attribute()
burst.web.UserAgent.prototype.bug_set_style_attribute = function() {
   return this.is_family_ie();
};

burst.web.UserAgent.prototype.bug_builtin_constructor_unreliable = function() {
  var isbug = 
    (this.brand_ === BU_UA_BRAND_OPERA) ||
    (this.family_ === BU_UA_FAMILY_KHTML) ||
    false;
  return isbug;
}

/** true if the UA is unable to create an 'iframe' with document.createElement */
//:CLIMETHOD Boolean bug_create_iframe()
burst.web.UserAgent.prototype.bug_create_iframe = function() {
   var isbug = 
//     (this.is_family_ie() && this.version_ < 5.5) ||
     (this.is_family_ie() && this.version_ < 7) ||
     // Opera can create an iframe with either innerHTML or createElement.
     // If created with createElement, getAttribute('name') fails on the result
     // If created with innerHTML the resulting iframe will not show up in window.frames[iframe_id]
//     (this.brand_ == BU_UA_BRAND_OPERA) ||
     false;
   return isbug;
};

/** true if a created iframe has no window until after a setTimeout or alert */
//:CLIMETHOD Boolean bug_iframe_delayed_create()
burst.web.UserAgent.prototype.bug_iframe_delayed_create = function() {
  var isbug = 
    (this.family_ === BU_UA_FAMILY_OPERA) ||
    false;
  return isbug;
}

/** true if the UA fails to process an iframe that has "display: none" */
//:CLIMETHOD Boolean bug_iframe_display_none()
burst.web.UserAgent.prototype.bug_iframe_display_none = function() {
  var isbug = 
    // Also form controls: http://bugzilla.mozilla.org/show_bug.cgi?id=34297
    //    Mozilla up to 0.97 and NS6
    (this.family_ == BU_UA_FAMILY_GECKO && this.gecko_version_ < 1.1) ||
    (this.family_ === BU_UA_FAMILY_OPERA) ||
    (this.family_ === BU_UA_FAMILY_KHTML) ||
    false;
  return isbug;
};

/** 
true if the UA fails to treat links in a dynamically created iframe's contents relative to its parent
(the src value of the iframe element, itself relativized to its window).
*/
//:CLIMETHOD Boolean bug_iframe_relative_url()
burst.web.UserAgent.prototype.bug_iframe_relative_url = function() {
  var isbug = 
    (this.brand_ === BU_UA_BRAND_OPERA) ||
    (this.family_ === BU_UA_FAMILY_KHTML) ||
    false;
  return isbug;
}

/**
true if Node.attributes is broken like ie.
See http://www.xs4all.nl/~ppk/js/w3c_core.html
*/
//:CLIMETHOD Boolean bug_ie_attributes()
burst.web.UserAgent.prototype.bug_ie_attributes = function() {
   var isbug = 
     (this.is_family_ie() && this.version_ < 7) ||
     false;
   return isbug;
}



/*
* features. should be greater-than-or-equal tests.
*/

burst.web.UserAgent.prototype.can_setTimeout_function = function() {
  var can = 
     (this.is_family_ie()) ||
     (this.family_ === BU_UA_FAMILY_GECKO) ||
     (this.family_ === BU_UA_FAMILY_OPERA) ||
     false;
  return can;
}

/** 
* True if the UA supports an onload attribute on an iframe element that
* is created through innerHTML or is statically already present in a document.
*
* W3 says nothing at all about an onload attribute for iframe or frame, only frameset:
*    http://www.w3.org/TR/REC-html40/present/frames.html#h-16.5
*/
//:CLIMETHOD Boolean can_iframe_onload_static()
burst.web.UserAgent.prototype.can_iframe_onload_static = function() {
  //alert("can_iframe_onload_static");
  var can = 
     (this.is_family_ie() && this.version_ >= 5.5) ||
     (this.brand_ === BU_UA_BRAND_NETSCAPE && this.version_ >= 6.2) ||
     (this.family_ === BU_UA_FAMILY_GECKO && this.gecko_version_ >= 1.0) ||
     // (this.brand_ === BU_UA_BRAND_OPERA && this.version_ >= 7.0) ||
/*
     (this.brand_ === BU_UA_BRAND_KONQ && this.version_ >= 3.0) ||
     (this.brand_ === BU_UA_BRAND_SAFARI && this.version_ >= 60) ||
*/
//     (this.family_ === BU_UA_FAMILY_KHTML) ||
     false;
  //alert("returning can=" + can);
  return can;
}

/**
* True if the UA supports an 'onload' attribute that is dynamically added
* to an iframe element through the DOM.
* The word "supports" here means that it would also need to be called after any dynamic
* location.replace. Also, the value set to the attribute is a Function, not a String.
*/
//:CLIMETHOD Boolean can_iframe_onload_dyn()
burst.web.UserAgent.prototype.can_iframe_onload_dyn = function() {
  var can = 
     (this.brand_ === BU_UA_BRAND_NETSCAPE && this.version_ >= 6.2) ||
     (this.family_ === BU_UA_FAMILY_GECKO && this.gecko_version_ >= 1.0) ||
     //(this.brand_ === BU_UA_BRAND_OPERA && this.version_ >= 7.0) ||
     (this.family_ === BU_UA_FAMILY_KHTML) ||
     false;
  return can;
}






//:CLEND

/** The global instance of burst.web.UserAgent that describes the current user agent. */
//:GLVAR burst.web.UserAgent bu_UA
var bu_UA = new burst.web.UserAgent();

bu_UA.isIE = bu_UA.is_family_ie();
bu_UA.isIE50 = bu_UA.isIE && bu_UA.version_ < 5.5;
bu_UA.isIEBox = bu_UA.isIE && document.compatMode != 'CSS1Compat';
bu_UA.isOpera = (bu_UA.family_ == BU_UA_FAMILY_OPERA);
bu_UA.isGecko = (bu_UA.family_ == BU_UA_FAMILY_GECKO);
bu_UA.isKHTML = (bu_UA.family_ == BU_UA_FAMILY_KHTML);
bu_UA.isIce = (bu_UA.family_ == BU_UA_FAMILY_ICE);

//print("bu_UA=" + bu_UA);

bu_loaded('burst.web.UserAgent');

