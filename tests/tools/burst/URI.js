/**
* @file URI.js
* Defines burst.URI, which has static utility functions as well as being instantiable.
*
* Note that we rely on ECMAScript 262-3 global encodeURIComponent and decodeURIComponent.
* Workaround implementations are in fix_ecma.js.
*
* @author Copyright 2003 Mark D. Anderson (mda@discerning.com)
* @author Licensed under the Academic Free License 1.2 http://www.opensource.org/licenses/academic.php
*/

//=java package burst;
/** 
Scoping class for static URI-related utilities; can also be instantiated, if you prefer an OO-model.

@todo Add more instance methods.
*/
//=java class URI {

/** Construct a URI object from the string url. */
//=java public URI(String uri) {}
function BU_URI(uri) {
   this.uri_ = uri;
}
burst.URI = BU_URI;

/**
* Parse the url query string (which excludes any leading '?').
* If the same name appears multiple times, the behavior is determined
* by the <var>dup_handling</var> parameter, which can be: 'first', 'last', 'array', 'error'
* The default is 'last'
*/
//:CLCMETHOD Object queryToMap(String s, String dup_handling)
burst.URI.queryToMap = function(s, dup_handling) {
  var pairs = s.split(/[\&\;]/);
  var map = {};
  if (!dup_handling) dup_handling = 'last';
  burst.Alg.for_each(pairs, function(pair) {
    var i = pair.indexOf('=');
    var key = i == -1 ? pair : pair.substring(0,i);
    var val = i == -1 ? '' : pair.substring(i+1);
    key = decodeURIComponent(key);
    val = decodeURIComponent(val);
    if (bu_in(key, map)) {
      switch(dup_handling) {
        case 'first': break;
        case 'last': map[key] = val; break;
        case 'array': map[key] = [map[key], val]; break;
        case 'error': throw "duplicate values for key '" + key + "'";
        default: throw "unknown duplicate handling '" + dup_handling + "'";
      }
    }
    else {
      map[key] = val;
    }
  });
  return map;
}

/**
* Parse the query string into an Array of 2-element Arrays
*/
//:CLCMETHOD Array queryToPairs(String s)
burst.URI.queryToPairs = function(s) {
  var pairs = s.split(/[\&\;]/);
  var a = [];
  burst.Alg.for_each(pairs, function(pair) {
    var i = pair.indexOf('=');
    var key = i == -1 ? pair : pair.substring(0,i);
    var val = i == -1 ? '' : pair.substring(i+1);
    key = decodeURIComponent(key);
    val = decodeURIComponent(val);
    a.push([key,val]);
  });
  return a;
}

/**
* Parse the query string into an Array with alternating names and values.
*/
//:CLCMETHOD Array queryToArray(String s)
burst.URI.queryToArray = function(s) {
  var pairs = s.split(/[\&\;]/);
  var a = [];
  burst.Alg.for_each(pairs, function(pair) {
    var i = pair.indexOf('=');
    var key = i == -1 ? pair : pair.substring(0,i);
    var val = i == -1 ? '' : pair.substring(i+1);
    key = decodeURIComponent(key);
    val = decodeURIComponent(val);
    a.push(key);
    a.push(val);
  });
  return a;
}

/**
* Produce a query string (without leading '?') from an associative array.
*/
//:CLCMETHOD String mapToQuery(Object map)
burst.URI.mapToQuery = function(map, sep) {
  var a = [];
  var count = 0;
  if (!sep) sep = ';';
  for(var k in map) {
    var v = map[k] || '';
    if (count++ > 0) a.push(sep);
    a.push(encodeURIComponent(k));
    a.push('=');
    a.push(encodeURIComponent(v));
  }
  return a.join('');
}

/**
True if the url is absolute.
*/
//=java public static boolean isAbsolute(String url) {}
burst.URI.isAbsolute = function(url) {
  if (!url) return false;
  if (url.indexOf('/') == -1) return false;
  if (url.substring(0,7) == 'http://') return true;
  return /^\w+:\/\//.test(url);
}

/**
Resolve the url relative to the provide base_url.
The url is just returned if it is already absolute.

RFC2396 specifies relative urls: http://www.faqs.org/rfcs/rfc2396.html 
This supplants RFC1808.

TBD:
As special case, if url starts with '/', and base url is absolute,
a url is returned which is made by replacing the base url's pathinfo.
This is not valid.

@param url The url to resolve.
@param base_url The base url to resolve against
@param noabscheck Optional. If true, skip checking whether url is already absolute.
*/

//:CLCMETHOD String resolveUrl(String url, String base_url, Boolean noabscheck)
burst.URI.resolveUrl = function(url, base_url, noabscheck) {
  if (!noabscheck && burst.URI.isAbsolute(url)) return url;

  var base_isabs = burst.URI.isAbsolute(base_url);

  // special case?
  if (url.charAt(0) == '/' && base_isabs) {
  }

  // nothing to do if base_url has no slash
  var last_slash = base_url.lastIndexOf("/") + 1;
  if (last_slash == 0) return url;

  // make sure we don't take last slash in 'http://foo.com'
  if (base_isabs) {
    if (/^\w+:\/\/[^\/]+$/.test(base_url)) {
       base_url += '/';
       last_slash = base_url.length;
    }
  }

  var res_url = base_url.substring(0, last_slash) + url;
  // remove everything like a/../
  res_url = res_url.replace(/\w+\/\.\.\//g,'');
  // replace /./ with /
  res_url = res_url.replace(/\/\.\//g,'/');
  return res_url;
}

/**
Equivalent to calling burst.URI.parse on the string url member of the object.
*/
//:CLIMETHOD String parse(String url)

/**
Parses the url into an Array of 5 Strings.
<pre>
  scheme ":" 
  "//" net_loc 
  ["/"] path 
  "?" query 
  "#" fragment 
</pre>

- scheme is non-empty for an absolute url, and null for a relative url. It excludes the ':'.
- net_loc is non-null if '//' is found, and null if '//' is found. It excludes the '//'.
- path is always non-null. It includes '/' if present in the URL (it may not be present if scheme and net_loc are missing).
- query is non-null if '?' is found, and null if not. It excludes the '?'.
- fragment is non-null if '#' is found, and null if not. It excludes the '#'.
*/
//:CLCMETHOD String parse(String url)
burst.URI.parse = function(url) {
  var rest; // whatever is left to parse

  // fragment
  var fragment_ind = url.indexOf('#');
  var fragment;
  if (fragment_ind == -1) {
    fragment = null;
    rest = url;
  }
  else {
    fragment = url.substring(fragment_ind + 1);
    rest = url.substring(0, fragment_ind);
  }

  // scheme
  var scheme_matches = /^([a-z\d\.\-\+]+):/i.exec(rest);
  var scheme;
  if (scheme_matches) {
     scheme = scheme_matches[1];
     rest = rest.substring(scheme_matches[0].length);
  }
  else {
     scheme = null;
  }

  // net_loc
  var net_loc = null;
  if (rest.substring(0,2) == '//') {
    net_loc = rest.substring(2);
    //bu_debug("preliminary net_loc=" + net_loc);
    var path_slash = net_loc.indexOf('/');
    if (path_slash == -1) {
      //bu_debug("found no / in net_loc=" + net_loc);
      rest = '';
    }
    else {
      rest = net_loc.substring(path_slash);
      net_loc = net_loc.substring(0,path_slash);
    }
bu_debug("after net_loc=" + net_loc + ' rest=' + rest + ' path_slash=' + path_slash);
  }

  // path
  var question_ind = rest.indexOf('?');
  var path;
  var query;
  if (question_ind == -1) {
    query = null;
    path = rest;
  }
  else {
    query = rest.substring(question_ind + 1);
    path = rest.substring(0, question_ind);
  }
  
  return [scheme, net_loc, path, query, fragment];
}

burst.URI.urlPath = function(url) {
  return burst.URI.parse(url)[2];
}

/**
Extracts the path part, and from that the file suffix.
Returns the empty string if none.
*/
//:CLCMETHOD String pathSuffix(String url)
burst.URI.pathSuffix = function(url) {
  var path = burst.URI.urlPath(url);
  var suf_matches = /\.([^\/\\]*)$/.exec(path);
  return suf_matches ? suf_matches[1] : '';
}

/**
* Guess the MIME type (such as 'text/plain' based on the file suffix in the url (such as '.txt').
* Returns empty string if can't guess.
*/
//:CLCMETHOD String guessMimeType(String url)
burst.URI.guessMimeType = function(url) {
  var suffix = burst.URI.pathSuffix(url).toLowerCase();
  switch(suffix) {
  case 'txt': 
  case 'text':
      return 'text/plain';
  case 'htm':
  case 'html':
      return 'text/html';
  case 'xml':
      return 'text/xml';
  case 'js':
      return 'text/javascript';
  default:
      return '';
  }
}

//=java } // class burst.URI

bu_loaded('burst.URI', ['burst.Alg']);
